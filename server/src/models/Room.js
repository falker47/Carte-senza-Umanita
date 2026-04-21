import { shuffleArray } from '../utils.js';

export class Room {
  constructor(roomCode, hostId, hostNickname, whiteCards, blackCards) {
    this.instanceId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    this.roomCode = roomCode;
    this.hostId = hostId;
    this.players = [{ id: hostId, nickname: hostNickname, score: 0, hand: [] }];
    this.gameStarted = false;
    this.currentRound = 0;
    this.judgeIndex = 0;
    this.blackCards = [...blackCards];
    this.whiteCards = [...whiteCards];
    this.usedBlackCards = [];
    this.usedWhiteCards = [];
    this.currentBlackCard = null;
    this.playedCards = [];
    this.maxPlayers = 10;
    this.maxPoints = 5;
    this.handSize = 7;
    this.roundStatus = 'waiting';
    this.roundWinner = null;
    this.gameWinner = null;
    this.gameOver = false;
    this.shuffledPlayedCards = null;
  }

  isFull() {
    return this.players.length >= this.maxPlayers;
  }

  isNicknameTaken(nickname) {
    return this.players.some(player => player.nickname.toLowerCase() === nickname.toLowerCase());
  }

  isHost(playerId) {
    return this.hostId === playerId;
  }

  isJudge(playerId) {
    if (!this.gameStarted) return false;
    return this.players[this.judgeIndex].id === playerId;
  }

  addPlayer(playerId, nickname) {
    this.players.push({ id: playerId, nickname, score: 0, hand: [] });
  }

  removePlayer(playerId) {
    const index = this.players.findIndex(player => player.id === playerId);
    if (index !== -1) {
      this.players.splice(index, 1);

      // Se il giudice è uscito, passa al prossimo giocatore
      if (this.gameStarted && this.judgeIndex >= this.players.length) {
        this.judgeIndex = 0;
      }

      // Se l'host è uscito, assegna un nuovo host
      if (playerId === this.hostId && this.players.length > 0) {
        this.hostId = this.players[0].id;
      }

      // Rimuovi le carte giocate dal giocatore uscito
      this.playedCards = this.playedCards.filter(card => card.playerId !== playerId);
    }
  }

  getPlayerCount() {
    return this.players.length;
  }

  getPlayers() {
    return this.players.map(({ id, nickname, score }) => ({ id, nickname, score }));
  }

  startGame(maxPoints = 5, handSize = 7) { // Aggiunto handSize come parametro
    this.gameStarted = true;
    this.currentRound = 1;
    this.judgeIndex = 0;
    this.maxPoints = maxPoints;
    this.handSize = handSize; // Imposta handSize dalle impostazioni
    this.playedCards = [];
    this.roundStatus = 'playing'; // Set round status to playing
    this.gameOver = false;
    this.gameWinner = null;
    this.roundWinner = null;

    // Mescola le carte
    this.shuffleCards();

    // Distribuisci le carte ai giocatori
    this.dealCards(); // dealCards userà this.handSize aggiornato

    // Seleziona la prima carta nera
    this.currentBlackCard = this.blackCards.pop();
  }

  shuffleCards() {
    this.whiteCards = shuffleArray(this.whiteCards);
    this.blackCards = shuffleArray(this.blackCards);
  }

  // Pesca una carta bianca, rimescolando lo scarto se il mazzo è vuoto.
  drawWhiteCard() {
    if (this.whiteCards.length === 0 && this.usedWhiteCards.length > 0) {
      this.whiteCards = shuffleArray(this.usedWhiteCards);
      this.usedWhiteCards = [];
    }
    return this.whiteCards.pop();
  }

  dealCards() {
    this.players.forEach(player => {
      player.hand = [];
      for (let i = 0; i < this.handSize; i++) {
        const card = this.drawWhiteCard();
        if (card) player.hand.push(card);
      }
    });
  }

  playCard(playerId, cardIndices) {
    // Trova il giocatore
    const playerIndex = this.players.findIndex(player => player.id === playerId);
    if (playerIndex === -1) {
      return { success: false, error: 'Giocatore non trovato' };
    }

    // Verifica se il giocatore ha già giocato
    if (this.playedCards.some(card => card.playerId === playerId)) {
      return { success: false, error: 'Hai già giocato le tue carte in questo turno' };
    }

    // Supporta sia singola carta (retrocompatibilità) che array di carte
    const indices = Array.isArray(cardIndices) ? cardIndices : [cardIndices];
    
    // Verifica che il numero di carte corrisponda ai blanks della carta nera
    const requiredCards = this.currentBlackCard ? this.currentBlackCard.blanks : 1;
    if (indices.length !== requiredCards) {
      return { success: false, error: `Devi giocare esattamente ${requiredCards} carta${requiredCards > 1 ? 'e' : ''}` };
    }

    // Verifica che tutti gli indici siano validi e unici
    const playerHand = this.players[playerIndex].hand;
    for (let i = 0; i < indices.length; i++) {
      if (indices[i] < 0 || indices[i] >= playerHand.length) {
        return { success: false, error: 'Indice carta non valido' };
      }
      // Verifica duplicati
      if (indices.indexOf(indices[i]) !== i) {
        return { success: false, error: 'Non puoi giocare la stessa carta più volte' };
      }
    }

    // MODIFICA: Estrai le carte mantenendo l'ordine di selezione
    const cards = [];
    const cardsToRemove = [];
    
    // Prima estrai le carte nell'ordine di selezione
    for (const index of indices) {
      cards.push(playerHand[index]);
      cardsToRemove.push(index);
    }
    
    // Poi rimuovi le carte dalla mano in ordine decrescente per non alterare gli indici
    const sortedIndices = [...cardsToRemove].sort((a, b) => b - a);
    for (const index of sortedIndices) {
      playerHand.splice(index, 1);
    }

    // Aggiungi le carte giocate (ora nell'ordine di selezione)
    this.playedCards.push({ playerId, cards });

    // Aggiungi nuove carte alla mano del giocatore (ricicla lo scarto se necessario)
    for (let i = 0; i < requiredCards; i++) {
      const card = this.drawWhiteCard();
      if (card) this.players[playerIndex].hand.push(card);
    }

    return { success: true };
  }

  getPlayersPlayedCount() {
    // Escludi il giudice dal conteggio
    const nonJudgePlayers = this.players.filter((_, index) => index !== this.judgeIndex);
    
    // Conta quanti giocatori hanno giocato
    const playedCount = this.playedCards.length;
    
    return {
      played: playedCount,
      total: nonJudgePlayers.length
    };
  }

  allPlayersPlayed() {
    // Escludi il giudice dal conteggio
    const nonJudgePlayers = this.players.filter((_, index) => index !== this.judgeIndex);
    
    // Verifica se tutti i giocatori (tranne il giudice) hanno giocato le loro carte
    return nonJudgePlayers.every(player => 
      this.playedCards.some(card => card.playerId === player.id)
    );
  }

  setRoundStatus(status) {
    this.roundStatus = status;
    console.log(`[Room ${this.roomCode}] Round status set to: ${status}`);

    if (status === 'judging') {
      this.shuffledPlayedCards = this.shufflePlayedCards();
    }

    if (status === 'playing') {
      this.shuffledPlayedCards = null;
    }
  }

  getPlayedCards() {
    if (this.shuffledPlayedCards && (this.roundStatus === 'judging' || this.roundStatus === 'roundEnd')) {
      return this.shuffledPlayedCards;
    }
    return [...this.playedCards];
  }

  shufflePlayedCards() {
    return shuffleArray(this.playedCards);
  }

  awardPointToPlayer(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.score += 1;
      console.log(`[Room ${this.roomCode}] Player ${playerId} awarded a point. New score: ${player.score}`);
      return player.score;
    }
    return null;
  }

  checkForGameWinner() {
    const winner = this.players.find(p => p.score >= this.maxPoints);
    if (winner) {
      this.gameOver = true;
      this.gameWinner = winner;
      this.setRoundStatus('gameOver');
      console.log(`[Room ${this.roomCode}] Game over! Winner: ${winner.nickname}`);
      return winner;
    }
    return null;
  }

  // This method will be called by GameManager.judgeSelectsWinner
  processJudgeSelection(selectedCardIndex) {
    if (this.roundStatus !== 'judging') {
      console.warn(`[Room ${this.roomCode}] processJudgeSelection: Attempted when roundStatus was ${this.roundStatus}.`);
      return { success: false, error: 'Non è il momento di giudicare (controllo interno Room).' };
    }

    const displayedPlayedCards = this.shuffledPlayedCards || this.playedCards;

    if (selectedCardIndex < 0 || selectedCardIndex >= displayedPlayedCards.length) {
      console.error(`[Room ${this.roomCode}] processJudgeSelection: Invalid selectedCardIndex: ${selectedCardIndex} for length: ${displayedPlayedCards.length}`);
      return { success: false, error: 'Indice carta selezionata non valido.' };
    }

    const winningSubmission = displayedPlayedCards[selectedCardIndex];

    const winnerId = winningSubmission.playerId;
    const winnerPlayer = this.players.find(p => p.id === winnerId);

    if (!winnerPlayer) {
      // This should not happen if playerId in playedCards is always valid
      console.error(`[Room ${this.roomCode}] Errore critico: Giocatore vincente non trovato con ID ${winnerId} dalla carta selezionata.`);
      return { success: false, error: 'Giocatore vincente non trovato.' };
    }

    this.awardPointToPlayer(winnerId);
    this.roundWinner = winnerId; // Store the ID of the round winner
    this.setRoundStatus('roundEnd');

    const gameWinner = this.checkForGameWinner();

    console.log(`[Room ${this.roomCode}] Vincitore del round: ${winnerPlayer.nickname}`);

    return {
      success: true,
      winnerInfo: {
        playerId: winnerId,
        nickname: winnerPlayer.nickname,
        score: winnerPlayer.score,
        cardPlayed: Array.isArray(winningSubmission.cards) ? 
          winningSubmission.cards.join(' / ') : 
          winningSubmission.card
      },
      gameOver: this.gameOver,
      gameWinner: gameWinner,
      gameState: this.getGameState()
    };
  }

  startNewRound() {
    this.currentRound += 1;
    this.judgeIndex = (this.judgeIndex + 1) % this.players.length;

    if (this.currentBlackCard) {
      this.usedBlackCards.push(this.currentBlackCard);
      this.currentBlackCard = null;
    }

    // Sposta le carte bianche giocate nello scarto prima di resettare
    for (const submission of this.playedCards) {
      if (Array.isArray(submission.cards)) {
        this.usedWhiteCards.push(...submission.cards);
      } else if (submission.card) {
        this.usedWhiteCards.push(submission.card);
      }
    }

    this.playedCards = [];
    this.roundWinner = null;
    this.setRoundStatus('playing');

    if (this.blackCards.length === 0) {
      if (this.usedBlackCards.length === 0) {
        console.error(`[Room ${this.roomCode}] Nessuna carta nera disponibile per il nuovo round.`);
        return { success: false, error: 'Nessuna carta nera disponibile.' };
      }
      this.blackCards = shuffleArray(this.usedBlackCards);
      this.usedBlackCards = [];
    }

    this.currentBlackCard = this.blackCards.pop();

    return { success: true };
  }
  
  getGameState() {
    let winningCardText = null;
    if (this.roundStatus === 'roundEnd' && this.roundWinner) {
      const originalWinningSubmission = this.playedCards.find(pc => pc.playerId === this.roundWinner);
      if (originalWinningSubmission) {
        // Le carte sono stringhe semplici
        if (Array.isArray(originalWinningSubmission.cards)) {
          winningCardText = originalWinningSubmission.cards.join(' / ');
        } else {
          winningCardText = originalWinningSubmission.card;
        }
      }
    }
  
    return {
      roomCode: this.roomCode,
      hostId: this.hostId,
      players: this.getPlayers(),
      gameStarted: this.gameStarted,
      currentRound: this.currentRound,
      currentJudge: this.players[this.judgeIndex]?.id,
      blackCard: this.currentBlackCard,
      maxPoints: this.maxPoints,
      maxPlayers: this.maxPlayers,
      handSize: this.handSize,
      roundStatus: this.roundStatus,
      playersPlayedCount: this.getPlayersPlayedCount(), // Aggiungi questa riga
      playedCards: (this.roundStatus === 'judging' || this.roundStatus === 'roundEnd') ? 
        this.getPlayedCards().map(pc => ({
          playerId: pc.playerId,
          cards: pc.cards || [pc.card],
          card: Array.isArray(pc.cards) ? pc.cards.join(' / ') : pc.card
        })) : [],
      roundWinner: this.roundWinner,
      winningCardText: winningCardText,
      gameOver: this.gameOver,
      gameWinner: this.gameWinner,
      // You might want to send player hands only to the specific player
      // For now, this sends the full state; consider security/privacy for hands later
    };
  }
}