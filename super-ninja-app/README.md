# ⚡ SuperNinja AI - Desktop Application

## Autonomous AI Desktop Assistant with Full Tool Suite
### Built for Harvey Miller (DJ Speedy) | GOAT Royalty Edition

---

## 🚀 Features

### 🤖 Multi-LLM Support
- **OpenAI** - GPT-4o, GPT-4o Mini, GPT-4 Turbo, o1 Preview
- **Google** - Gemini 2.0 Flash, Gemini 1.5 Pro
- **Anthropic** - Claude 3.5 Sonnet, Claude 3 Opus
- **Local** - Ollama (Llama 3, Mistral, CodeLlama) - fully offline

### 🛠 Complete Tool Suite
| Tool | Description |
|------|-------------|
| ⌨ Terminal | Execute system commands directly |
| 📁 File Manager | Browse, open, and manage files |
| 💻 Code Editor | Write, edit, and run code (JS, Python, etc.) |
| 🌐 Web Browser | Search and research the web |
| 🎨 Image Tools | Generate and edit images with AI |
| 🎵 Audio Tools | Transcribe and analyze audio files |
| 📄 PDF Tools | Extract text and summarize PDFs |
| 📊 Data Analysis | Analyze CSV, JSON, Excel with visualizations |
| 🎵 Music Production | Catalog analysis, beat ideas, lyric writing |
| 💰 Royalty Calculator | Multi-platform royalty calculations |

### 🎯 Key Capabilities
- Chat with multiple AI models simultaneously
- Execute terminal commands from the app
- Open, edit, and save files with built-in code editor
- Attach files (images, audio, PDFs, data) to conversations
- Dark and light theme support
- Chat history with search
- Keyboard shortcuts for power users
- Global hotkey (Ctrl+Shift+N) to show/hide
- Always-on-top mode
- Cross-platform (Windows, macOS, Linux)

---

## 📦 Installation

### Pre-built Downloads

| Platform | File | Type |
|----------|------|------|
| Windows | `SuperNinja-AI-1.0.0-Setup.exe` | Installer |
| Windows | `SuperNinja-AI-1.0.0-Portable.exe` | Portable (no install) |
| macOS | `SuperNinja-AI-1.0.0.dmg` | Disk Image |
| Linux | `SuperNinja-AI-1.0.0.AppImage` | AppImage |
| Linux | `SuperNinja-AI-1.0.0.deb` | Debian Package |

### Build from Source

```bash
# Clone the repository
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
cd GOAT-Royalty-App2/super-ninja-app

# Install dependencies
npm install

# Run in development mode
npm start

# Build for your platform
npm run build:win      # Windows (EXE + Portable)
npm run build:mac      # macOS (DMG)
npm run build:linux    # Linux (AppImage + DEB)
npm run build:all      # All platforms
```

---

## ⚙️ Configuration

### API Keys Setup

1. Launch SuperNinja AI
2. Click the ⚙️ gear icon or press `Ctrl+,`
3. Enter your API keys:

| Provider | Get Key From |
|----------|-------------|
| OpenAI | https://platform.openai.com/api-keys |
| Google AI | https://aistudio.google.com/apikey |
| Anthropic | https://console.anthropic.com/settings/keys |
| Ollama | Install from https://ollama.ai (runs locally, no key needed) |

### Local LLM (Ollama) Setup

For fully offline AI with no API costs:

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Download models
ollama pull llama3
ollama pull mistral
ollama pull codellama

# Ollama runs automatically on http://localhost:11434
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+N` | Show/Hide app (global) |
| `Ctrl+N` | New chat |
| `Ctrl+,` | Settings |
| `Ctrl+O` | Open file |
| `Ctrl+S` | Save chat |
| `Ctrl+T` | Terminal |
| `Ctrl+E` | File Manager |
| `Ctrl+K` | Code Editor |
| `Ctrl+B` | Web Browser |
| `Ctrl+\` | Toggle sidebar |
| `Ctrl+D` | Toggle dark/light mode |
| `Enter` | Send message |
| `Shift+Enter` | New line in message |

---

## 🎵 Music Production Features

### Royalty Calculator
Calculate earnings across 8 streaming platforms with 2025 rates:
- Spotify: $0.00437/stream
- Apple Music: $0.00783/stream
- YouTube: $0.00274/view
- TikTok: $0.00069/play
- Tidal: $0.01284/stream
- Amazon Music: $0.00402/stream
- Deezer: $0.00394/stream
- Instagram: $0.00123/reel

### Music Production Assistant
- Catalog analysis and promotion suggestions
- Beat ideas based on trending sounds
- AI-powered lyric writing
- Industry trend analysis
- Release marketing plans

---

## 🏗 Project Structure

```
super-ninja-app/
├── package.json           # Dependencies & build config
├── build.sh               # Build script for all platforms
├── README.md              # This file
├── src/
│   ├── main.js            # Electron main process
│   ├── preload.js         # Secure IPC bridge
│   └── renderer/
│       ├── index.html     # App UI
│       ├── styles.css     # Dark/light theme styles
│       └── app.js         # Application logic & AI integration
├── assets/
│   ├── icon.png           # App icon (1024x1024)
│   ├── icon.ico           # Windows icon
│   └── icon.icns          # macOS icon
├── tools/                 # Additional tool modules
└── dist/                  # Built applications (after build)
```

---

## 🔒 Security

- All API keys stored locally using electron-store (encrypted)
- Context isolation enabled (renderer cannot access Node.js)
- Secure IPC bridge via preload script
- No data sent to external servers (except chosen AI provider)
- Ollama option for 100% offline operation
- Content Security Policy headers enforced

---

## 🛣 Roadmap

- [ ] Plugin system for custom tools
- [ ] Voice input/output
- [ ] Screen sharing and annotation
- [ ] Multi-window support
- [ ] Collaborative chat sessions
- [ ] Auto-update system
- [ ] Spotify API direct integration
- [ ] DAW plugin bridge (Logic Pro, Ableton)
- [ ] Mobile companion app

---

## 📄 License

MIT License - Copyright 2025 Harvey Miller (DJ Speedy)

Built with Electron, powered by multiple AI providers.
Part of the GOAT Royalty App ecosystem.

---

*SuperNinja AI - Your Music Empire, Automated* ⚡🎵