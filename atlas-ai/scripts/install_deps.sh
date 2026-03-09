#!/bin/bash
# Atlas AI — Install All Dependencies
# Run this once before building or running the app

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "🐐 Atlas AI — Dependency Installer"
echo "===================================="
echo ""

# ── Homebrew (macOS) ──────────────────────────────────────────
if [[ "$OSTYPE" == "darwin"* ]]; then
  if ! command -v brew &>/dev/null; then
    echo "📦 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  
  if ! command -v python3 &>/dev/null; then
    echo "📦 Installing Python 3..."
    brew install python3
  fi
  
  if ! command -v node &>/dev/null; then
    echo "📦 Installing Node.js..."
    brew install node
  fi
fi

echo "✅ System dependencies OK"
echo "   Python: $(python3 --version)"
echo "   Node:   $(node --version)"
echo "   npm:    $(npm --version)"

# ── Python virtual environment ────────────────────────────────
echo ""
echo "🐍 Setting up Python virtual environment..."
cd "$BACKEND_DIR"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
  echo "   Created .venv"
fi

source .venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt

echo "✅ Python dependencies installed"

# ── Pre-download GPT-2 model ──────────────────────────────────
echo ""
echo "🧠 Pre-downloading GPT-2 Medium model (~500MB)..."
echo "   This only happens once. Future startups will be fast."
python3 -c "
from transformers import AutoModelForCausalLM, AutoTokenizer
print('Downloading tokenizer...')
AutoTokenizer.from_pretrained('gpt2-medium')
print('Downloading model...')
AutoModelForCausalLM.from_pretrained('gpt2-medium')
print('✅ GPT-2 Medium downloaded and cached!')
"

# ── Node dependencies ─────────────────────────────────────────
echo ""
echo "📦 Installing Node.js dependencies..."
cd "$FRONTEND_DIR"
npm install

echo "✅ Node dependencies installed"

# ── Setup .env ────────────────────────────────────────────────
if [ ! -f "$BACKEND_DIR/.env" ]; then
  cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
  echo ""
  echo "📝 Created .env file at: $BACKEND_DIR/.env"
  echo "   Edit it to add your Twilio credentials (optional)"
fi

echo ""
echo "🎉 All dependencies installed!"
echo ""
echo "Next steps:"
echo "  Dev mode:  ./scripts/run_dev.sh"
echo "  Build DMG: ./scripts/build_dmg.sh"
echo ""
echo "🐐 GOAT Royalty — Atlas AI"