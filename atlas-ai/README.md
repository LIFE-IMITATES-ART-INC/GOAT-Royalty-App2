# 🐐 Atlas AI — GOAT Royalty Desktop App

A full-featured macOS desktop AI chat app powered by **local GPT-2** with an integrated **AI Communication Agent** that streams all calls, texts, and video conversations into the chat interface in real-time.

Built for **Harvey Miller (DJ Speedy)** — GOAT Royalty Music Platform.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Atlas AI Desktop App (.dmg)                 │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Electron Shell (macOS)               │   │
│  │  ┌──────────────┐  ┌──────────┐  ┌───────────┐  │   │
│  │  │  Chat Window  │  │  Comms   │  │  GOAT     │  │   │
│  │  │  (GPT-2 AI)   │  │  Feed    │  │  Royalty  │  │   │
│  │  └──────────────┘  └──────────┘  └───────────┘  │   │
│  └──────────────────────┬───────────────────────────┘   │
│                          │ WebSocket + REST API           │
│  ┌───────────────────────┴──────────────────────────┐   │
│  │              Python Backend (FastAPI)              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────┐  │   │
│  │  │  GPT-2 Local  │  │  Comm Agent  │  │ SQLite │  │   │
│  │  │  (streaming)  │  │  (Twilio)    │  │   DB   │  │   │
│  │  └──────────────┘  └──────┬───────┘  └────────┘  │   │
│  └──────────────────────────┬┴──────────────────────┘   │
└────────────────────────────┬┴──────────────────────────┘
                              │
                   ┌──────────┴──────────┐
                   │    Twilio Cloud      │
                   │  📞 Voice  💬 SMS   │
                   │  📹 Video           │
                   └─────────────────────┘
```

---

## Features

| Feature | Description |
|---------|-------------|
| 💬 **Chat Interface** | ChatGPT-style UI with conversation history |
| 🧠 **Local GPT-2** | Runs entirely on your machine — no API keys |
| 📡 **Real-time Streaming** | Token-by-token response streaming |
| 📞 **Voice Calls** | Agent answers calls, transcribes, AI responds |
| 💬 **SMS/MMS** | Single and group messaging with AI auto-reply |
| 📹 **Video Rooms** | Twilio Video with SMS invitations |
| 🔴 **Live Comm Feed** | All comms stream into chat via WebSocket |
| 🗄️ **Database** | Every interaction logged and searchable |
| 🎵 **GOAT Royalty** | Music catalog, royalty, and publishing integration |
| 📦 **macOS .dmg** | One-click install, runs locally |

---

## Quick Start

### Option 1: One-Command Setup
```bash
# Install everything
./scripts/install_deps.sh

# Run in dev mode
./scripts/run_dev.sh
```

### Option 2: Manual Setup

```bash
# 1. Python backend
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 2. Download GPT-2 model (first run, ~500MB)
python3 -c "from transformers import AutoModelForCausalLM, AutoTokenizer; AutoTokenizer.from_pretrained('gpt2-medium'); AutoModelForCausalLM.from_pretrained('gpt2-medium')"

# 3. Configure
cp .env.example .env
# Edit .env with your settings

# 4. Start backend
python server.py

# 5. Frontend (new terminal)
cd ../frontend
npm install
npm run dev

# 6. Electron (new terminal)
cd frontend
NODE_ENV=development npx electron .
```

### Build macOS .dmg
```bash
./scripts/build_dmg.sh
```

---

## File Structure

```
atlas-ai/
├── backend/
│   ├── server.py          # FastAPI server (chat, webhooks, WebSocket)
│   ├── gpt2_engine.py     # Local GPT-2 with streaming
│   ├── database.py        # SQLAlchemy models
│   ├── stream_hub.py      # WebSocket broadcast hub
│   ├── requirements.txt   # Python dependencies
│   └── .env.example       # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Full chat UI (ChatGPT-style)
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Tailwind + custom styles
│   ├── electron/
│   │   ├── main.js        # Electron main process
│   │   └── preload.js     # Secure IPC bridge
│   ├── package.json       # Node deps + electron-builder config
│   ├── vite.config.js     # Vite bundler config
│   └── tailwind.config.js # Tailwind CSS config
│
└── scripts/
    ├── install_deps.sh    # One-time setup
    ├── run_dev.sh         # Start dev environment
    └── build_dmg.sh       # Build macOS .dmg
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check + status |
| `POST` | `/api/chat` | Send message (non-streaming) |
| `POST` | `/api/chat/stream` | Send message (SSE streaming) |
| `GET` | `/api/conversations` | List all conversations |
| `GET` | `/api/conversations/:id` | Get conversation messages |
| `DELETE` | `/api/conversations/:id` | Delete conversation |
| `GET` | `/api/dashboard` | Stats + recent activity |
| `GET` | `/api/contacts` | List contacts |
| `GET` | `/api/calls` | Call history |
| `GET` | `/api/messages` | SMS history |
| `POST` | `/api/send/sms` | Send outbound SMS |
| `WS` | `/ws/stream` | Real-time event stream |
| `POST` | `/webhooks/voice/incoming` | Twilio voice webhook |
| `POST` | `/webhooks/sms/incoming` | Twilio SMS webhook |

---

## Environment Variables

```bash
# Agent Identity
AGENT_NAME=Atlas
MODEL_NAME=gpt2-medium    # gpt2, gpt2-medium, gpt2-large, gpt2-xl

# Server
PORT=8765
BASE_URL=http://localhost:8765

# Twilio (optional — enables voice/SMS/video)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# GOAT Royalty Integration
GOAT_APP_URL=http://93.127.214.171:3002
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...

# Google Gemini (optional — enhances AI responses)
GOOGLE_AI_API_KEY=AIza...
```

---

## Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | Intel Core i5 | Apple M1/M2/M3 |
| RAM | 8GB | 16GB+ |
| Storage | 2GB free | 5GB free |
| OS | macOS 12+ | macOS 14+ |

**GPT-2 Model Sizes:**
- `gpt2` — 117M params, ~500MB, fastest
- `gpt2-medium` — 345M params, ~1.5GB, balanced ⭐
- `gpt2-large` — 774M params, ~3GB, better quality
- `gpt2-xl` — 1.5B params, ~6GB, best quality

---

## Credits

Built by **SuperNinja AI** for **Harvey Miller (DJ Speedy)**  
GOAT Royalty Music Platform — © 2025 All Rights Reserved

🐐 **GOAT Royalty** × 🤖 **Atlas AI**