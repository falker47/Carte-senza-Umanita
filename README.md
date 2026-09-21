# Carte senza Umanità

Unofficial Italian-language browser party game inspired by the fill-in-the-blank format popularized by **Cards Against Humanity**. The application uses a React client and a Node.js/Socket.io server for real-time rooms and rounds.

> This is an independent fan project. It is not affiliated with or endorsed by Cards Against Humanity.

![Carte senza Umanità preview](assets/preview.webp)

## What is implemented

- Real-time multiplayer rooms with Socket.io.
- 3 to 10 players per room.
- Host-controlled game start.
- Rotating judge, anonymous shuffled submissions and score tracking.
- One-, two- and three-card prompts.
- Configurable target score and hand size.
- Reconnection support for an existing nickname/room.
- Responsive React interface with light/dark mode.
- A repository-maintained Italian-language deck with **417 white cards** and **234 black cards**.

The card data is **not presented as an official or complete Cards Against Humanity deck**. Its original external provenance was not documented when the data files were introduced, and later commits include project-specific additions and edits. See [CONTENT_NOTICE.md](CONTENT_NOTICE.md).

## Demo / deployment

The repository is configured for these Render endpoints:

- Frontend: https://carte-senza-umanita.onrender.com/
- Socket.io backend: https://carte-senza-umanita-server.onrender.com/

Availability depends on the external Render services. A configured URL is not treated here as proof that the deployment is currently reachable.

## Architecture

```text
client/
  React + Vite
      |
      | Socket.io
      v
server/
  Express + Socket.io
  GameManager / Room
      |
      v
server/data/
  Italian-language card data
```

The server owns room membership, judge rotation, hands, played cards, scoring and round transitions. The client renders the current state and emits player actions.

## Verification

Server-side game-flow tests use Node's built-in test runner and cover:

- room creation and joining;
- host-only start and the 3-player minimum;
- dealing hands and selecting the first judge;
- card submission and the judging phase;
- winner selection and game-over behavior;
- round rotation;
- multi-card prompts;
- reconnection of an existing player.

Run them with:

```bash
cd server
npm test
```

GitHub Actions also runs the server tests and a production client build on pushes and pull requests.

## Run locally

Requirements: a current Node.js LTS release and npm.

Install dependencies:

```bash
npm run install-all
```

Start client and server together:

```bash
npm run dev
```

Development endpoints:

- client: http://localhost:5173
- server: http://localhost:3001

## Card data

The current repository contains:

- `server/data/carte_bianche.json`: 417 white cards;
- `server/data/carte_nere.json`: 234 black cards;
- black-card blank counts: 197 single-card, 33 two-card, 4 three-card prompts.

The current files contain no duplicate white-card strings or duplicate black-card prompt text.

Because the original source/rights record for these card files is not documented, they are excluded from the source-code license. If this project is ever redistributed commercially, republished as a reusable dataset, or promoted as a fully cleared public product, the card corpus should first be replaced with demonstrably original/cleared content or have its provenance and permissions established.

## License

Source code authored for this repository is licensed under the MIT License; see [LICENSE](LICENSE).

The MIT license does **not** cover the card corpus under `server/data/` or third-party intellectual property. See [CONTENT_NOTICE.md](CONTENT_NOTICE.md).
