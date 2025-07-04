export class Room {
  constructor(roomCode, hostId, hostNickname, whiteCards, blackCards) {
    this.instanceId = Date.now() + '_' + Math.random().toString(36).substr(2, 9); // Aggiungi un ID univoco
    console.log(`[Room ${roomCode}] Created with instanceId: ${this.instanceId}`);
    this.roomCode = roomCode;
    this.hostId = hostId;
    this.players = [{ id: hostId, nickname: hostNickname, score: 0, hand: [] }];
    this.gameStarted = false;
    this.currentRound = 0;
    this.judgeIndex = 0;
    this.blackCards = [...blackCards]; // Copia per non modificare l'originale
    this.whiteCards = [...whiteCards]; // Copia per non modificare l'originale
    this.currentBlackCard = null;
    this.playedCards = []; // Array di { playerId, cards }
    this.maxPlayers = 10;
    this.maxPoints = 5;
    this.handSize = 7;    // Valore di default, sovrascritto da startGame
    this.roundStatus = 'waiting'; // 'waiting', 'playing', 'judging', 'roundEnd', 'gameOver'
    this.roundWinner = null; // playerId of the winner of the current round
    this.gameWinner = null; // player object of the game winner
    this.gameOver = false;
    this.shuffledPlayedCards = null; // Aggiungi questa proprietà per memorizzare l'ordine mescolato
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
    // Fisher-Yates shuffle
    for (let i = this.whiteCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.whiteCards[i], this.whiteCards[j]] = [this.whiteCards[j], this.whiteCards[i]];
    }

    for (let i = this.blackCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.blackCards[i], this.blackCards[j]] = [this.blackCards[j], this.blackCards[i]];
    }
  }

  dealCards() {
    // Distribuisci 10 carte bianche a ogni giocatore
    this.players.forEach(player => {
      player.hand = [];
      for (let i = 0; i < this.handSize; i++) {
        if (this.whiteCards.length > 0) {
          player.hand.push(this.whiteCards.pop());
        }
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

    // Aggiungi nuove carte alla mano del giocatore
    const cardsToAdd = Math.min(requiredCards, this.whiteCards.length);
    for (let i = 0; i < cardsToAdd; i++) {
      if (this.whiteCards.length > 0) {
        this.players[playerIndex].hand.push(this.whiteCards.pop());
      }
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

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  setRoundStatus(status) {
    this.roundStatus = status;
    console.log(`[Room ${this.roomCode}] Round status set to: ${status}`);
    
    // Quando inizia la fase di giudizio, mescola le carte una sola volta
    if (status === 'judging') {
      this.shuffledPlayedCards = this.shufflePlayedCards();
      console.log(`[Room ${this.roomCode}] Cards shuffled for judging phase:`, JSON.stringify(this.shuffledPlayedCards));
    }
    
    // Reset quando inizia un nuovo round
    if (status === 'playing') {
      this.shuffledPlayedCards = null;
    }
  }

  getPlayedCards() {
    // Se siamo in fase di giudizio o il round è finito, usa l'ordine già mescolato
    if (this.shuffledPlayedCards && (this.roundStatus === 'judging' || this.roundStatus === 'roundEnd')) {
      console.log(`[Room ${this.roomCode}] Returning cached shuffled cards:`, JSON.stringify(this.shuffledPlayedCards));
      return this.shuffledPlayedCards;
    }
    
    // Altrimenti restituisci le carte in ordine originale (per debug o altri scopi)
    return [...this.playedCards];
  }

  shufflePlayedCards() {
    console.log(`[SERVER Room ${this.roomCode}] shufflePlayedCards: Original playedCards before shuffle:`, JSON.stringify(this.playedCards));
    const cards = [...this.playedCards]; // Each element is { playerId, card }
    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    console.log(`[SERVER Room ${this.roomCode}] shufflePlayedCards: Shuffled cards:`, JSON.stringify(cards));
    return cards; // Returns an array of { playerId, card }
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
    console.log(`[SERVER Room ${this.roomCode}] processJudgeSelection: Received selectedCardIndex: ${selectedCardIndex}`);
    console.log(`[SERVER Room ${this.roomCode}] processJudgeSelection: Current this.playedCards (original order):`, JSON.stringify(this.playedCards));

    if (this.roundStatus !== 'judging') {
      console.warn(`[SERVER Room ${this.roomCode}] processJudgeSelection: Attempted when roundStatus was ${this.roundStatus}.`);
      return { success: false, error: 'Non è il momento di giudicare (controllo interno Room).' };
    }

    // Usa le carte mescolate memorizzate invece di chiamare getPlayedCards() che rimescolerebbe
    const displayedPlayedCards = this.shuffledPlayedCards || this.playedCards;
    console.log(`[SERVER Room ${this.roomCode}] processJudgeSelection: displayedPlayedCards (cached shuffled):`, JSON.stringify(displayedPlayedCards));

    if (selectedCardIndex < 0 || selectedCardIndex >= displayedPlayedCards.length) {
      console.error(`[SERVER Room ${this.roomCode}] processJudgeSelection: Invalid selectedCardIndex: ${selectedCardIndex} for displayedPlayedCards length: ${displayedPlayedCards.length}`);
      return { success: false, error: 'Indice carta selezionata non valido.' };
    }

    // Identify the winning submission from the displayed list
    const winningSubmission = displayedPlayedCards[selectedCardIndex];
    console.log(`[SERVER Room ${this.roomCode}] processJudgeSelection: Winning submission based on index ${selectedCardIndex}:`, JSON.stringify(winningSubmission));

    // winningSubmission is an object like { playerId: 'someId', card: 'text of card' }

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

    console.log(`[Room ${this.roomCode}] Giudice ha selezionato la carta. Vincitore del round: ${winnerPlayer.nickname}. Carta: ${JSON.stringify(winningSubmission.card)}`);

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

  selectWinner(cardIndex) {
    if (cardIndex < 0 || cardIndex >= this.playedCards.length) {
      return { success: false, error: 'Indice carta non valido' };
    }
    
    // This method's logic should be mostly covered by processJudgeSelection now.
    // For now, let's keep it but it might be deprecated or refactored.
    const winningCard = this.playedCards[cardIndex];
    const winnerIndex = this.players.findIndex(player => player.id === winningCard.playerId);
    
    if (winnerIndex === -1) {
      return { success: false, error: 'Giocatore vincente non trovato' };
    }
    
    // Incrementa il punteggio del vincitore
    this.players[winnerIndex].score += 1;
    
    // Verifica se il giocatore ha raggiunto il punteggio massimo
    const gameOver = this.players[winnerIndex].score >= this.maxPoints;
    
    // Restituisci le informazioni sul vincitore
    return { 
      success: true, 
      winnerInfo: {
        playerId: winningCard.playerId,
        nickname: this.players[winnerIndex].nickname,
        score: this.players[winnerIndex].score,
        cardIndex
      },
      gameOver,
      winner: gameOver ? this.players[winnerIndex] : null
    };
  }
  
  startNewRound() {
    // Incrementa il round
    this.currentRound += 1;
    
    // Passa al prossimo giudice
    this.judgeIndex = (this.judgeIndex + 1) % this.players.length;
    
    // Resetta le carte giocate
    this.playedCards = [];
    this.roundWinner = null;
    this.setRoundStatus('playing'); // Set round status to playing for the new round
    
    // Seleziona una nuova carta nera
    if (this.blackCards.length === 0) {
      // Se le carte nere sono finite, rimescola quelle usate
      // Questo è un punto di miglioramento: sarebbe meglio tenere traccia delle carte usate
      this.shuffleCards();
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