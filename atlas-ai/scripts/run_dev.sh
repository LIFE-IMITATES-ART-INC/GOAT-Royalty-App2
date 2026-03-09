#!/bin/bash
# Atlas AI — Development Mode
# Starts Python backend + Vite frontend + Electron

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "🐐 Atlas AI — GOAT Royalty Desktop App"
echo "======================================="

# ── Check Python ──────────────────────────────────────────────
if ! command -v python3 &>/dev/null; then
  echo "❌ Python 3 not found. Install with: brew install python3"
  exit 1
fi

# ── Check Node ────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "❌ Node.js not found. Install from: https://nodejs.org"
  exit 1
fi

# ── Install Python deps ───────────────────────────────────────
echo "📦 Installing Python dependencies..."
cd "$BACKEND_DIR"
if [ ! -f ".venv/bin/activate" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -r requirements.txt -q

# ── Copy .env ─────────────────────────────────────────────────
if [ ! -f "$BACKEND_DIR/.env" ]; then
  cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
  echo "📝 Created .env from template. Edit $BACKEND_DIR/.env to configure."
fi

# ── Install Node deps ─────────────────────────────────────────
echo "📦 Installing Node dependencies..."
cd "$FRONTEND_DIR"
npm install --silent

# ── Start backend ─────────────────────────────────────────────
echo "🚀 Starting Python backend on port 8765..."
cd "$BACKEND_DIR"
source .venv/bin/activate
python server.py &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo "⏳ Waiting for backend..."
for i in {1..20}; do
  if curl -s http://127.0.0.1:8765/health > /dev/null 2>&1; then
    echo "✅ Backend ready!"
    break
  fi
  sleep 1
done

# ── Start frontend ────────────────────────────────────────────
echo "🎨 Starting Vite frontend on port 5173..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

# Wait for frontend
sleep 3

# ── Start Electron ────────────────────────────────────────────
echo "🖥️  Launching Electron..."
cd "$FRONTEND_DIR"
NODE_ENV=development npx electron . &
ELECTRON_PID=$!

echo ""
echo "✅ Atlas AI is running!"
echo "   Backend:  http://127.0.0.1:8765"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all processes."

# ── Cleanup on exit ───────────────────────────────────────────
cleanup() {
  echo ""
  echo "🛑 Shutting down..."
  kill $BACKEND_PID $FRONTEND_PID $ELECTRON_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

wait