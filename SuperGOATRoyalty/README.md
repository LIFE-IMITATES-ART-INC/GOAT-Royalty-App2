# 🐐⚡ Super GOAT Royalty — Ultimate Desktop App v4.0.0

**The Ultimate AI-Powered Music Production & Royalty Management Desktop Application**

© 2025 Harvey Miller (DJ Speedy) / GOAT Royalty / FASTASSMAN Publishing Inc.

---

## 🎯 What Is This?

Super GOAT Royalty is a **complete desktop application** (EXE, DMG, AppImage) that combines:

- 🤖 **Multi-LLM AI Chat** — Ollama (local), GPT-4o, Gemini, Claude, Groq
- 🖥️ **Built-in Terminal** — Full command line with SSH to your Hostinger servers
- 📝 **Code Editor** — Open, edit, and save files with syntax detection
- 📁 **File Manager** — Browse your entire file system
- 🌐 **Web Browser** — Built-in Chromium browser
- 💰 **Royalty Calculator** — 8 streaming platforms with custom splits
- 🎵 **Track Catalog** — 3,650 tracks (1,814 Harvey + 1,836 FASTASSMAN)
- 📊 **Streaming Analytics** — Revenue, streams, geographic data
- 🎨 **Adobe Firefly AI Studio** — AI image generation
- 🎬 **Sora AI Video Studio** — AI video creation
- 📷 **Cinema Camera Suite** — Video production tools
- 👗 **Fashion Forge Studio** — Fashion design
- 🖥️ **Server Manager** — Deploy to both Hostinger VPS servers
- 🟢 **NVIDIA DGX Cloud** — GPU computing integration
- 🔀 **Git Manager** — Version control
- 🤖 **Axiom Automation** — Browser automation
- 🎹 **Music Production** — Production tools
- 📋 **Publishing Manager** — Music publishing
- 📡 **Streaming Platforms** — Platform integrations
- ⚙️ **Settings** — Full configuration panel

---

## 🚀 Quick Start

### Option 1: Download Pre-Built (Recommended)

Go to [GitHub Releases](https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/releases) and download:

| Platform | File | Size |
|----------|------|------|
| 🪟 Windows | `Super-GOAT-Royalty-4.0.0-Setup.exe` | ~80MB |
| 🪟 Windows Portable | `Super-GOAT-Royalty-4.0.0-Portable.exe` | ~80MB |
| 🍎 macOS (Intel+M1) | `Super-GOAT-Royalty-4.0.0-mac.dmg` | ~90MB |
| 🐧 Linux | `Super-GOAT-Royalty-4.0.0-linux.AppImage` | ~85MB |
| 🐧 Linux DEB | `Super-GOAT-Royalty-4.0.0-linux.deb` | ~85MB |

### Option 2: Build From Source

#### Prerequisites
- **Node.js 20+** — https://nodejs.org
- **npm 9+** — Comes with Node.js
- **Git** — https://git-scm.com

#### Build on Windows (Git Bash / PowerShell / VS Code Terminal)

```bash
# Clone the repo
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
cd GOAT-Royalty-App2/SuperGOATRoyalty

# Install dependencies
npm install

# Build Windows EXE + Portable
npm run build:win

# Output files in dist/ folder:
# - Super-GOAT-Royalty-4.0.0-Setup.exe
# - Super-GOAT-Royalty-4.0.0-Portable.exe
```

#### Build on macOS (Terminal / Xcode Terminal)

```bash
# Clone the repo
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
cd GOAT-Royalty-App2/SuperGOATRoyalty

# Install dependencies
npm install

# Build DMG (works on both Intel and Apple Silicon)
npm run build:mac

# Output files in dist/ folder:
# - Super-GOAT-Royalty-4.0.0-mac.dmg
# - Super-GOAT-Royalty-4.0.0-mac.zip
```

#### Build on Linux

```bash
# Clone the repo
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
cd GOAT-Royalty-App2/SuperGOATRoyalty

# Install dependencies
npm install

# Build AppImage + DEB
npm run build:linux

# Output files in dist/ folder:
# - Super-GOAT-Royalty-4.0.0-linux.AppImage
# - Super-GOAT-Royalty-4.0.0-linux.deb
```

#### Quick Build Script (Auto-detects OS)

```bash
cd SuperGOATRoyalty
chmod +x scripts/build-all.sh
./scripts/build-all.sh
```

---

## 🖥️ Server Deployment

Deploy the GOAT Royalty web app to your Hostinger VPS servers:

### Automatic Deployment

```bash
chmod +x scripts/deploy-to-servers.sh
./scripts/deploy-to-servers.sh
```

### Manual Deployment

```bash
# SSH to your server
ssh root@72.61.193.184

# Clone/update repo
cd ~ && git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
cd GOAT-Royalty-App2

# Install & build
npm install --production
npm run build

# Start with PM2
pm2 start npm --name goat-app -- start -- -p 3000
pm2 save && pm2 startup
```

### Your Servers

| Server | IP | Type | Expires |
|--------|-----|------|---------|
| KVM2 (Primary) | 72.61.193.184 | KVM 2 | 2026-11-23 |
| KVM8 (Backup) | 93.127.214.171 | KVM 8 | 2026-03-20 |

---

## 🤖 LLM Integration

### Local AI (No API Key Needed)

1. Install [Ollama](https://ollama.ai)
2. Run: `ollama pull llama3`
3. In app Settings, set provider to "Ollama"

### Cloud AI Providers

Set API keys in Settings:

| Provider | Model | Get Key |
|----------|-------|---------|
| OpenAI | GPT-4o | https://platform.openai.com/api-keys |
| Google | Gemini 2.0 Flash | https://aistudio.google.com/apikey |
| Anthropic | Claude 3.5 Sonnet | https://console.anthropic.com |
| Groq | Llama 3.3 70B | https://console.groq.com |

---

## 📁 Project Structure

```
SuperGOATRoyalty/
├── package.json              # Build config (EXE/DMG/AppImage)
├── src/
│   ├── main.js               # Electron main process (375 lines)
│   ├── preload.js             # Secure IPC bridge (95 lines)
│   ├── renderer/
│   │   ├── index.html         # Complete UI layout
│   │   ├── styles.css         # Full theme system (dark/light)
│   │   └── app.js             # All tool panels & logic
│   └── modules/               # Additional modules
├── assets/
│   ├── icon.png               # App icon
│   └── icon-generator.html    # Icon generator tool
├── scripts/
│   ├── build-all.sh           # Auto-detect OS & build
│   └── deploy-to-servers.sh   # Deploy to Hostinger VPS
├── .github/workflows/
│   └── build.yml              # CI/CD for all platforms
└── README.md                  # This file
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+G` | Show/Focus app (global) |
| `Ctrl+Shift+A` | AI Chat |
| `Ctrl+Shift+T` | Terminal |
| `Ctrl+Shift+E` | Code Editor |
| `Ctrl+Shift+F` | File Manager |
| `Ctrl+Shift+B` | Browser |
| `Ctrl+,` | Settings |
| `F11` | Full Screen |
| `F12` | DevTools |
| `Ctrl+R` | Reload |

---

## 🎵 Track Catalog

- **Harvey L Miller Writers**: 1,814 tracks
- **FASTASSMAN Publishing Inc**: 1,836 tracks
- **Total**: 3,650 tracks registered with ASCAP
- **Estimated Royalties**: $865K+
- **Total Streams**: 1.2B+

---

## 📜 License

**UNLICENSED — All Rights Reserved**

Copyright © 2025 Harvey L Miller Jr / Juaquin J Malphurs / Kevin W Hallingquest

This software is proprietary. Unauthorized copying, distribution, or modification is strictly prohibited.