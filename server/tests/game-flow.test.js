import test from 'node:test';
import assert from 'node:assert/strict';

import { GameManager } from '../src/models/GameManager.js';

const WHITE_CARDS = Array.from({ length: 80 }, (_, index) => `white-${index}`);
const BLACK_CARDS = [
  { text: 'Prompt one: ____', blanks: 1 },
  { text: 'Prompt two: ____', blanks: 1 },
  { text: 'Prompt three: ____', blanks: 1 },
  { text: 'Double: ____ / ____', blanks: 2 }
];

function createThreePlayerGame({ maxPoints = 3, handSize = 5 } = {}) {
  const manager = new GameManager(WHITE_CARDS, BLACK_CARDS);
  const { roomCode } = manager.createRoom('host', 'Host');

  assert.equal(manager.joinRoom('p2', 'Player 2', roomCode).success, true);
  assert.equal(manager.joinRoom('p3', 'Player 3', roomCode).success, true);
  assert.equal(manager.startGame(roomCode, 'host', maxPoints, handSize).success, true);

  return { manager, roomCode, room: manager.rooms[roomCode] };
}

function playRound(manager, roomCode) {
  const room = manager.rooms[roomCode];
  const judgeId = room.players[room.judgeIndex].id;
  const nonJudges = room.players.filter(player => player.id !== judgeId);
  const requiredCards = room.currentBlackCard.blanks;

  for (const player of nonJudges) {
    const indices = Array.from({ length: requiredCards }, (_, index) => index);
    const result = manager.playWhiteCard(roomCode, player.id, indices);
    assert.equal(result.success, true);
  }

  assert.equal(room.allPlayersPlayed(), true);
  room.setRoundStatus('judging');
  return { judgeId, nonJudges };
}

test('room join rules and start permissions are enforced', () => {
  const manager = new GameManager(WHITE_CARDS, BLACK_CARDS);
  const { roomCode } = manager.createRoom('host', 'Host');

  assert.equal(manager.joinRoom('p2', 'Player 2', roomCode).success, true);
  assert.equal(manager.joinRoom('dup', 'player 2', roomCode).success, false);

  const tooEarly = manager.startGame(roomCode, 'host');
  assert.equal(tooEarly.success, false);
  assert.match(tooEarly.error, /almeno 3 giocatori/i);

  assert.equal(manager.joinRoom('p3', 'Player 3', roomCode).success, true);

  const notHost = manager.startGame(roomCode, 'p2');
  assert.equal(notHost.success, false);
  assert.match(notHost.error, /solo l'host/i);
});

test('complete multiplayer round reaches judging and awards a point', () => {
  const { manager, roomCode, room } = createThreePlayerGame({ maxPoints: 3, handSize: 5 });

  assert.equal(room.roundStatus, 'playing');
  assert.equal(room.currentRound, 1);
  assert.equal(room.players[room.judgeIndex].id, 'host');
  assert.ok(room.currentBlackCard);
  assert.ok(room.players.every(player => player.hand.length === 5));

  const { judgeId, nonJudges } = playRound(manager, roomCode);

  const judgeAttempt = manager.playWhiteCard(roomCode, judgeId, [0]);
  assert.equal(judgeAttempt.success, false);

  const beforeScores = new Map(room.players.map(player => [player.id, player.score]));
  const result = manager.judgeSelectsWinner(roomCode, judgeId, 0);

  assert.equal(result.success, true);
  assert.equal(room.roundStatus, 'roundEnd');
  assert.ok(nonJudges.some(player => room.roundWinner === player.id));
  assert.equal(room.players.find(player => player.id === room.roundWinner).score, 1);

  for (const player of room.players) {
    const expected = player.id === room.roundWinner
      ? beforeScores.get(player.id) + 1
      : beforeScores.get(player.id);
    assert.equal(player.score, expected);
  }
});

test('a one-point game ends immediately after the judge selects a winner', () => {
  const { manager, roomCode, room } = createThreePlayerGame({ maxPoints: 1 });
  const { judgeId } = playRound(manager, roomCode);

  const result = manager.judgeSelectsWinner(roomCode, judgeId, 0);

  assert.equal(result.success, true);
  assert.equal(room.gameOver, true);
  assert.equal(room.roundStatus, 'gameOver');
  assert.ok(room.gameWinner);
  assert.equal(room.gameWinner.score, 1);
});

test('starting a new round rotates the judge and advances the black card', () => {
  const { manager, roomCode, room } = createThreePlayerGame({ maxPoints: 3 });
  const initialJudge = room.players[room.judgeIndex].id;
  const initialBlackCard = room.currentBlackCard;

  const { judgeId } = playRound(manager, roomCode);
  assert.equal(judgeId, initialJudge);
  assert.equal(manager.judgeSelectsWinner(roomCode, judgeId, 0).success, true);

  const next = manager.startNewRound(roomCode, judgeId);
  assert.equal(next.success, true);
  assert.equal(room.currentRound, 2);
  assert.equal(room.roundStatus, 'playing');
  assert.equal(room.players[room.judgeIndex].id, 'p2');
  assert.ok(room.currentBlackCard);
  assert.notEqual(room.currentBlackCard, initialBlackCard);
});

test('multi-card prompts require the exact number of distinct cards', () => {
  const { manager, roomCode, room } = createThreePlayerGame({ handSize: 5 });

  room.currentBlackCard = { text: 'Double: ____ / ____', blanks: 2 };

  const oneCard = manager.playWhiteCard(roomCode, 'p2', [0]);
  assert.equal(oneCard.success, false);
  assert.match(oneCard.error, /esattamente 2 carte/i);

  const duplicate = manager.playWhiteCard(roomCode, 'p2', [0, 0]);
  assert.equal(duplicate.success, false);
  assert.match(duplicate.error, /stessa carta/i);

  const valid = manager.playWhiteCard(roomCode, 'p2', [0, 1]);
  assert.equal(valid.success, true);
});

test('rejoin replaces the socket id while preserving the player and host role', () => {
  const manager = new GameManager(WHITE_CARDS, BLACK_CARDS);
  const { roomCode } = manager.createRoom('old-host', 'Host');

  const result = manager.rejoinRoom('new-host', 'Host', roomCode);
  const room = manager.rooms[roomCode];

  assert.equal(result.success, true);
  assert.equal(room.hostId, 'new-host');
  assert.ok(room.players.some(player => player.id === 'new-host' && player.nickname === 'Host'));
  assert.equal(manager.playerRooms['old-host'], undefined);
  assert.equal(manager.playerRooms['new-host'], roomCode);
});
