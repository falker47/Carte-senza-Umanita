# 🃏 Carte senza Umanità

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-server-green)
![React](https://img.shields.io/badge/React-client-blue)

Versione italiana di **Cards Against Humanity** - Gioco multiplayer real-time direttamente nel tuo browser.

## 📋 Descrizione

**Carte senza Umanità** è un'applicazione web che porta il famoso ed irriverente gioco di carte sui vostri schermi, permettendo di giocare con amici in tempo reale ovunque vi troviate. Il progetto combina un frontend moderno realizzatyo con **React** e un backend robusto in **Node.js** che gestisce la logica di gioco istantanea tramite **Socket.io**.

### ✨ Caratteristiche Principali

*   🌍 **Multiplayer Online Real-time**: Unisciti e gioca con amici istantaneamente.
*   💬 **Chat Integrata**: Insulta (amichevolmente) gli avversari o commenta le giocate direttamente in partita.
*   📱 **Design Responsive**: Ottimizzato per desktop, tablet e smartphone.
*   🇮🇹 **Full Italian Localization**: Mazzo di carte completo e localizzato in italiano per il massimo divertimento.

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

## 📂 Struttura del Progetto

```
Carte senza Umanità/
├── client/     # 🎨 Codice sorgente del frontend (React + Vite)
├── server/     # ⚙️ Codice sorgente del backend (Node.js + Socket.io)
└── ...
```

## 🤝 Contributing

I contributi sono benvenuti! Sentiti libero di aprire una *issue* o inviare una *pull request*.

## 📄 Licenza

Questo progetto è distribuito sotto licenza **MIT**. Vedi il file LICENSE per maggiori dettagli (se presente).
