#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "======================================================"
echo "  Carte Senza Umanita - Avvio ambiente di sviluppo"
echo "======================================================"

if ! command -v node >/dev/null 2>&1; then
  echo "[ERRORE] Node.js non trovato nel PATH."
  exit 1
fi

echo "[OK] Node.js $(node -v)"

install_if_missing() {
  local dir="$1"
  local label="$2"
  if [ ! -d "$dir/node_modules" ]; then
    echo "[INFO] Installazione dipendenze $label..."
    ( cd "$dir" && npm install )
  else
    echo "[OK] Dipendenze $label gia' installate."
  fi
}

install_if_missing "." "root"
install_if_missing "client" "client"
install_if_missing "server" "server"

echo ""
echo "======================================================"
echo "  Server (3001) + Client (5173) — CTRL+C per uscire"
echo "======================================================"

( sleep 4 && (command -v xdg-open >/dev/null && xdg-open http://localhost:5173 \
    || command -v open >/dev/null && open http://localhost:5173 \
    || true) ) &

npm run dev
