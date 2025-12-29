# Carte senza Umanità

Versione italiana di Cards Against Humanity - Gioco multiplayer real-time.

Un'applicazione web che porta il famoso gioco di carte "Cards Against Humanity" nel browser, permettendo di giocare con amici in tempo reale. Il progetto è composto da un frontend React moderno e un backend Node.js che gestisce la logica di gioco tramite Socket.io.

## Caratteristiche

*   **Multiplayer in tempo reale**: Gioca con amici ovunque si trovino.
*   **Chat integrata**: Comunica con gli altri giocatori durante la partita.
*   **Design Responsive**: Giocabile da desktop e dispositivi mobili.
*   **Carte Italiane**: Utilizza un mazzo di carte localizzato in italiano.

## Tecnologie

*   **Frontend**: React, Vite, Tailwind CSS
*   **Backend**: Node.js, Socket.io
*   **Gestione Pacchetti**: npm

## Prerequisiti

*   [Node.js](https://nodejs.org/) (versione raccomandata installata)

## Installazione

Per installare tutte le dipendenze sia per il client che per il server, esegui il comando:

```bash
npm run install-all
```

Questo installerà le dipendenze nella cartella root, in `client` e in `server`.

## Utilizzo

Per avviare l'applicazione in modalità sviluppo (sia client che server contemporaneamente):

```bash
npm run dev
```

*   Il **Client** sarà accessibile solitamente su `http://localhost:5173` (o altra porta assegnata da Vite).
*   Il **Server** si avvierà sulla porta configurata (default 3000 o simile).

### Altri script utili

*   `npm run client`: Avvia solo il client.
*   `npm run server`: Avvia solo il server.
*   `npm run build`: Compila il client per la produzione.
*   `npm start`: Avvia il server in modalità produzione.

## Struttura del Progetto

*   `client/`: Codice sorgente del frontend (React).
*   `server/`: Codice sorgente del backend (Node.js).
