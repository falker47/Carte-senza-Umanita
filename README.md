# 🃏 Carte senza Umanità

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-server-green)
![React](https://img.shields.io/badge/React-client-blue)

Versione italiana di **Cards Against Humanity** - Gioco multiplayer real-time direttamente nel tuo browser.

## 📋 Descrizione

**Carte senza Umanità** è un'applicazione web che porta il famoso ed irriverente gioco di carte sui vostri schermi, permettendo di giocare con amici in tempo reale ovunque vi troviate. Il progetto combina un frontend moderno realizzato con **React** e un backend robusto in **Node.js** che gestisce la logica di gioco istantanea tramite **Socket.io**.

### ✨ Caratteristiche Principali

*   🌍 **Multiplayer Online Real-time**: Unisciti e gioca con amici istantaneamente.
*   📱 **Design Responsive**: Ottimizzato per desktop, tablet e smartphone.
*   🌟 **Tag "Novità"**: Le nuove carte pescate vengono evidenziate per riconoscerle subito.
*   🇮🇹 **Full Italian Localization**: Mazzo completo di **650 carte** (417 Bianche e 233 Nere) localizzato in italiano per il massimo divertimento.

---

## 📸 Screenshots

| Lobby | Partita in Corso |
|:---:|:---:|
| ![Lobby Preview](https://via.placeholder.com/600x400?text=Inserisci+Screenshot+Lobby) | ![Game Preview](https://via.placeholder.com/600x400?text=Inserisci+Screenshot+Game) |

---

## 🃏 Come si Gioca

Il gioco segue le regole classiche di *Cards Against Humanity*:

1.  **Il Giudice**: A ogni turno, un giocatore viene designato come "Card Czar" (Giudice).
2.  **La Carta Nera**: Il Giudice pesca una **Carta Nera** che contiene una frase con degli spazi vuoti o una domanda.
3.  **La Risposta**: Gli altri giocatori scelgono dalla loro mano la **Carta Bianca** (o le carte, se richiesto) che completa la frase nel modo più divertente, assurdo o politicamente scorretto possibile.
4.  **Il Giudizio**: Il Giudice mescola le carte ricevute (virtualmente!) e le legge ad alta voce. Poi sceglie la sua preferita.
5.  **Vittoria**: Il giocatore che ha giocato la carta scelta vince il punto. Il primo ad arrivare al punteggio prestabilito vince la partita!

---

## 🛠️ Tecnologie Utilizzate

### Frontend
*   **React**: Libreria UI per interfacce dinamiche.
*   **Vite**: Build tool di nuova generazione per uno sviluppo rapido.
*   **Tailwind CSS**: Framework CSS utility-first per uno styling veloce e personalizzabile.

### Backend
*   **Node.js**: Runtime JavaScript per il server.
*   **Socket.io**: Motore per la comunicazione bidirezionale in tempo reale.
*   **Express**: Framework web per Node.js.

---

## 🚀 Per Iniziare

### Prerequisiti

Assicurati di avere installato sul tuo sistema:
*   [Node.js](https://nodejs.org/) (Versione LTS raccomandata)
*   **npm** (solitamente incluso con Node.js)

### 📥 Installazione

Per configurare il progetto, inclusi sia il client che il server, esegui questo comando nella root del progetto:

```bash
npm run install-all
```
Questo script installerà automaticamente tutte le dipendenze necessarie per la root, per la cartella `client` e per la cartella `server`.

---

## 🎮 Utilizzo

Per avviare l'intera applicazione in modalità sviluppo (Server + Client contemporaneamente):

```bash
npm run dev
```

*   📡 **Server**: Si avvierà (default: porta `3000`).
*   💻 **Client**: Si aprirà nel browser (solitamente `http://localhost:5173`).

### 📦 Altri comandi utili

| Comando | Descrizione |
| :--- | :--- |
| `npm run client` | Avvia solo il frontend (Client) |
| `npm run server` | Avvia solo il backend (Server) |
| `npm run build` | Compila il client per la produzione |
| `npm start` | Avvia il server in modalità produzione |

---

## ✏️ Personalizzazione

Vuoi aggiungere le tue carte personali o modificare quelle esistenti? È facilissimo:

1.  Naviga nella cartella `server/data/`.
2.  Troverai tre file JSON principali:
    *   `carte_bianche.json`: L'elenco delle risposte.
    *   `carte_nere.json`: L'elenco delle domande/frasi.
    *   `parole.json`: Parole extra usate per generare nickname o altro.
3.  Modifica questi file aggiungendo le tue frasi preferite rispettando il formato JSON.
4.  Riavvia il server per applicare le modifiche.

---

## 🐞 Risoluzione Problemi

### "Stiamo svegliando il server..."
Se vedi questo messaggio all'avvio, non preoccuparti!
Molti servizi di hosting gratuiti (come Render o Heroku) mettono in pausa il server dopo periodi di inattività. Il primo caricamento potrebbe richiedere **circa 60 secondi** mentre il server si riattiva. Nelle partite successive sarà istantaneo.

---

## 📂 Struttura del Progetto

```
Carte senza Umanità/
├── client/     # 🎨 Codice sorgente del frontend (React + Vite)
├── server/     # ⚙️ Codice sorgente del backend (Node.js + Socket.io)
│   └── data/   # 📝 File JSON con i mazzi di carte
└── ...
```

## 🤝 Contributing

I contributi sono benvenuti! Sentiti libero di aprire una *issue* o inviare una *pull request*.

## 📄 Licenza

Questo progetto è distribuito sotto licenza **MIT**. Vedi il file LICENSE per maggiori dettagli (se presente).
