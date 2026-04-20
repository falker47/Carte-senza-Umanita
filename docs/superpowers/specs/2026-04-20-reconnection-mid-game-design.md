# Design: rientro in partita dopo disconnessione

Data: 2026-04-20

## Obiettivo

Permettere a un giocatore che perde la connessione (chiusura browser, rete caduta, refresh) di rientrare in una partita in corso inserendo nuovamente **stesso nickname e codice stanza** dalla Home, mantenendo punteggio e mano. L'uscita volontaria tramite il pulsante "Esci" resta un abbandono definitivo, con la partita che prosegue correttamente tra i giocatori rimasti.

## Motivazione

Oggi esiste un'infrastruttura parziale di riconnessione ma rotta:
- Il client salva nickname/codice in `localStorage` e tenta `rejoin-room` al mount, ma solo se la pagina viene ricaricata.
- Da Home, inserire nick+codice invia `join-room` che risponde "Il gioco è già iniziato" anche quando il player era registrato ed è ora disconnesso.
- Il comportamento del pulsante "Esci" mid-game ha diversi bug: la stanza viene distrutta se esce l'host, il client non riceve aggiornamento dei giocatori, lo stato del round non transita correttamente.

## Ambito

### In ambito
- Rientro da Home con stesso nick+codice per un player marcato `disconnected` nella stanza.
- Indicatore visivo (nickname grigio) per player disconnessi nella PlayerList.
- Fix comportamento `leave-room` durante partita in corso.
- Fix broadcast alla disconnessione improvvisa durante partita in corso.

### Fuori ambito
- Kick automatico di player disconnessi da troppo tempo.
- Auto-skip del round se un player disconnesso non può giocare.
- Pausa esplicita della partita.
- Persistenza della partita dopo il riavvio del server (rimane in-memory).

## Design

### 1. Entry point unificato: `join-room` gestisce anche il rejoin

Il server, ricevendo `join-room`, distingue tre casi in base allo stato della stanza:

**Stanza non esiste** → errore "Stanza non trovata" (come oggi).

**Stanza esiste, partita non iniziata** → comportamento attuale: `isNicknameTaken` blocca duplicati, `addPlayer` aggiunge il nuovo giocatore, emette `room-players` a tutti.

**Stanza esiste, partita iniziata** → nuovo flusso:
1. Cerca un player con `nickname.toLowerCase() === input.toLowerCase()`.
2. Se non esiste → errore "Il gioco è già iniziato" (come oggi).
3. Se esiste ed è `disconnected === true` → **rejoin**:
   - Aggiorna `player.id = newSocketId`.
   - Azzera `player.disconnected = false`.
   - Aggiorna `gameManager.playerRooms`: rimuove vecchio socketId, aggiunge nuovo.
   - Se `room.hostId === oldSocketId` → aggiorna a `newSocketId`.
   - `socket.join(roomCode)`.
   - Emette `rejoin-success` al solo richiedente con `{ players, host, code, gameStarted: true }` + `game-update` con stato completo + `update-hand` con la mano preservata.
   - Emette `game-update` a tutta la stanza per riflettere lo stato online.
4. Se esiste ed è **ancora connesso** → errore "Nickname già in uso".

Il client `Home.jsx handleJoinRoom` aggiunge un listener per `rejoin-success` oltre a `room-players`:
- Su `room-players` → `setGameState('lobby')` (come oggi).
- Su `rejoin-success` → `setGameState('game')`.

Il flusso `rejoin-room` esistente (usato da `App.jsx` per auto-rejoin al refresh) resta invariato.

### 2. Fix `leave-room` durante partita in corso

Quando un player clicca "Esci" con `room.gameStarted === true`, il server deve:

1. Rimuovere il player dalla stanza (`room.removePlayer` già aggiusta `judgeIndex`, host, `playedCards`).
2. **Non** emettere `room-players`: Game.jsx non lo ascolta. Emettere invece `game-update` con lo stato aggiornato.
3. **Non** distruggere la stanza se esce l'host: riassegnare `hostId` al primo player rimasto (già fatto in `Room.removePlayer`), mantenere la stanza.
4. Se `room.players.length < 3`:
   - Impostare `room.gameOver = true`, `room.roundStatus = 'gameOver'`.
   - Lasciare `room.gameWinner = null` (partita interrotta, non conclusa): il client mostra classifica e messaggio di partita interrotta. Il client Game.jsx attualmente mostra la schermata di vittoria solo se `gameWinner` è definito — va aggiornata la UI per distinguere `gameOver && gameWinner` (vittoria) da `gameOver && !gameWinner` (interruzione).
   - Emettere `game-update` finale.
5. Se il player uscito era il giudice in fase `judging` o `playing`:
   - `removePlayer` (già esistente) ha aggiustato `judgeIndex` facendo "scorrere" gli indici. Il player ora a `judgeIndex` diventa il nuovo giudice di un round da rifare.
   - Resettare il round corrente: `playedCards = []`, `shuffledPlayedCards = null`, `setRoundStatus('playing')`, estrarre una nuova `currentBlackCard`.
   - Reinviare `update-hand` a ciascun player (carte invariate ma forza re-render) e `game-update`.
   - Non chiamare `startNewRound()` direttamente: rotherebbe `judgeIndex` e incrementerebbe `currentRound` erroneamente.
6. Se il player uscito era un non-giudice e dopo la rimozione `allPlayersPlayed()` diventa true → `setRoundStatus('judging')`, popolare `shuffledPlayedCards`, emettere `game-update`.

`gameManager.handleDisconnect` va ripulito dalla distruzione della stanza quando esce l'host: rimuove solo il player.

### 3. Fix `disconnect` improvviso durante partita in corso

Oggi il server marca `player.disconnected = true` ma non avvisa gli altri client. Aggiungere:
- Dopo aver marcato il flag, `io.to(roomCode).emit('game-update', room.getGameState())` così tutti vedono il nickname in grigio.

Scelta di design: **nessuna transizione automatica di stato** sulla disconnessione. Se il disconnesso stallerà il round, il gioco aspetta il suo rientro. Trade-off: UX meno reattiva in caso di abbandono definitivo mascherato da disconnessione, ma coerente con l'intento "riconnetti e continua".

### 4. Flag `disconnected` nel player

In `Room.js`:
- Costruttore: aggiungere `disconnected: false` all'oggetto host.
- `addPlayer`: aggiungere `disconnected: false` al nuovo player.
- `getPlayers()`: includere `disconnected` nell'oggetto serializzato.

Nessuna modifica alla rimozione (`removePlayer` non tocca il flag: si applica solo a player non rimossi).

### 5. Indicatore visivo in PlayerList

In `PlayerList.jsx`, se `player.disconnected === true`:
- Nickname in grigio (`text-gray-400 dark:text-gray-500`).
- Affianca un indicatore testuale/emoji (es. "🔌 offline") distinto dal badge giudice.

La logica di evidenziazione del giocatore corrente e del giudice resta invariata.

## Flussi

### Flusso A — Disconnessione e rientro da Home

1. Player P chiude il browser mid-game.
2. Server `disconnect` handler: trova `roomCode` di P, marca `P.disconnected = true`, emette `game-update`.
3. Altri client ricevono lo stato aggiornato, PlayerList mostra P grigio.
4. P riapre l'app, atterra su Home (localStorage vuoto, o auto-rejoin fallito).
5. P inserisce stesso nick + codice, clicca "ENTRA NELLA STANZA".
6. Server `join-room` rileva partita iniziata + nick match + disconnected → rejoin.
7. Server emette `rejoin-success` a P e `game-update` a tutta la stanza.
8. Client P va a `gameState='game'`, riceve mano e stato, riprende a giocare.
9. Altri client vedono P tornare online (grigio → normale).

### Flusso B — Uscita volontaria mid-game

1. Player P clicca "Esci".
2. Client emette `leave-room`, torna a Home, pulisce localStorage.
3. Server rimuove P dalla stanza, gestisce host/giudice/contatori.
4. Server emette `game-update` a tutti gli altri.
5. Client Game.jsx aggiorna PlayerList, il gioco prosegue.
6. Se P prova a rientrare con stesso nick+codice → trattato come join nuovo (non trova player con quel nick). Se la stanza ha ancora posti e la partita non è finita → errore "Il gioco è già iniziato" (comportamento accettato).

### Flusso C — Refresh della pagina

Flusso esistente, invariato: `App.jsx` legge localStorage, emette `rejoin-room`, server risponde `rejoin-success` o `rejoin-failed`.

## Considerazioni

- **Collisione nickname**: due giocatori con lo stesso nick nella stessa stanza sono già impediti in fase di join. Il rejoin usa il match su nick + flag disconnected, quindi il rischio di "identity theft" esiste solo se l'originale è offline — accettabile per un gioco casual senza autenticazione.
- **Host disconnesso a lungo**: la stanza non viene distrutta. Se l'host non torna e si scende sotto 3 player, la partita finisce automaticamente.
- **Race condition**: se P si disconnette e un nuovo client con lo stesso nick entra prima che `disconnected` sia letto come true, il check attuale (`disconnected === true`) richiede esplicitamente il flag. Finché `disconnect` handler è sincrono rispetto al successivo `join-room`, il rischio è minimo.

## Modifiche ai file

| File | Modifica |
|------|----------|
| `server/src/models/Room.js` | Aggiunta `disconnected: false` nel costruttore e `addPlayer`; inclusione in `getPlayers()` |
| `server/src/models/GameManager.js` | `joinRoom` detecta rejoin; `handleDisconnect` non distrugge più la stanza all'uscita dell'host |
| `server/src/server.js` | `join-room` gestisce rejoin con eventi `rejoin-success` + `game-update` + `update-hand`; `leave-room` emette `game-update`, gestisce stati di round e `gameOver`; `disconnect` emette `game-update` |
| `client/src/components/Home.jsx` | `handleJoinRoom` aggiunge listener `rejoin-success` → transita a `game` |
| `client/src/components/PlayerList.jsx` | Stile grigio + indicatore per player `disconnected` |

Nessuna modifica strutturale a `Game.jsx`, `Lobby.jsx`, `App.jsx`.
