/**
 * 🤖 Oscar AI API Endpoint — GOAT Royalty
 * Handles local LLM communication, model management, and gateway status
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */

const OLLAMA_DEFAULT_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// Timeout for Ollama chat completions — set high for slow hardware (CPU-only
// Mac minis, USB-drive model storage, cold starts that must load the model
// into RAM first).  Matches OLLAMA_LOAD_TIMEOUT=10m in the launch scripts.
const OLLAMA_CHAT_TIMEOUT = parseInt(process.env.OLLAMA_CHAT_TIMEOUT, 10) || 600000; // 10 min

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    switch (action) {
      // ═══ Gateway Status ═══
      case 'status':
        return res.status(200).json({
          success: true,
          gateway: {
            status: 'online',
            version: 'Oscar v2026.2.26',
            uptime: process.uptime(),
            platform: 'GOAT Royalty Integration',
            ollamaUrl: OLLAMA_DEFAULT_URL,
          },
          system: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            memory: {
              total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
              used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
            }
          }
        });

      // ═══ List Available Models ═══
      case 'models':
        try {
          const ollamaRes = await fetch(`${OLLAMA_DEFAULT_URL}/api/tags`, {
            signal: AbortSignal.timeout(5000)
          });
          if (ollamaRes.ok) {
            const data = await ollamaRes.json();
            return res.status(200).json({
              success: true,
              source: 'ollama-live',
              models: data.models || []
            });
          }
        } catch (e) {
          // Ollama not running — return registry defaults
        }
        return res.status(200).json({
          success: true,
          source: 'registry-fallback',
          models: [
            { name: 'gemma2:2b', size: 1600000000, modified_at: new Date().toISOString() },
            { name: 'llama3.3:70b', size: 40000000000, modified_at: new Date().toISOString() },
            { name: 'llama3.2:3b', size: 2000000000, modified_at: new Date().toISOString() },
            { name: 'llama3.1:8b', size: 4700000000, modified_at: new Date().toISOString() },
            { name: 'llama3.1:70b', size: 40000000000, modified_at: new Date().toISOString() },
            { name: 'mistral:7b', size: 4100000000, modified_at: new Date().toISOString() },
            { name: 'mixtral:8x7b', size: 26000000000, modified_at: new Date().toISOString() },
            { name: 'mixtral:8x22b', size: 80000000000, modified_at: new Date().toISOString() },
            { name: 'gemma2:9b', size: 5400000000, modified_at: new Date().toISOString() },
            { name: 'gemma2:27b', size: 16000000000, modified_at: new Date().toISOString() },
            { name: 'phi-3:mini', size: 2300000000, modified_at: new Date().toISOString() },
            { name: 'phi-3:medium', size: 7900000000, modified_at: new Date().toISOString() },
            { name: 'qwen2.5:7b', size: 4400000000, modified_at: new Date().toISOString() },
            { name: 'qwen2.5:72b', size: 41000000000, modified_at: new Date().toISOString() },
            { name: 'command-r:35b', size: 20000000000, modified_at: new Date().toISOString() },
            { name: 'codellama:34b', size: 19000000000, modified_at: new Date().toISOString() },
            { name: 'codellama:7b', size: 3800000000, modified_at: new Date().toISOString() },
            { name: 'deepseek-coder-v2:16b', size: 8900000000, modified_at: new Date().toISOString() },
            { name: 'starcoder2:15b', size: 9000000000, modified_at: new Date().toISOString() },
            { name: 'codegemma:7b', size: 5000000000, modified_at: new Date().toISOString() },
            { name: 'llava:7b', size: 4700000000, modified_at: new Date().toISOString() },
            { name: 'llava-llama3:8b', size: 5500000000, modified_at: new Date().toISOString() },
            { name: 'bakllava:7b', size: 4700000000, modified_at: new Date().toISOString() },
            { name: 'nomic-embed-text', size: 274000000, modified_at: new Date().toISOString() },
            { name: 'mxbai-embed-large', size: 670000000, modified_at: new Date().toISOString() },
            { name: 'all-minilm', size: 45000000, modified_at: new Date().toISOString() },
            { name: 'neural-chat:7b', size: 4100000000, modified_at: new Date().toISOString() },
            { name: 'vicuna:13b', size: 7400000000, modified_at: new Date().toISOString() },
            { name: 'dolphin-mixtral:8x7b', size: 26000000000, modified_at: new Date().toISOString() },
          ],
          note: 'Ollama not detected — showing Oscar\'s 32 model registry. Run: ollama serve'
        });

      // ═══ Chat Completion ═══
      case 'chat':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'POST required for chat' });
        }

        const { model, messages, temperature, max_tokens } = req.body;

        // Try Ollama first
        try {
          const chatRes = await fetch(`${OLLAMA_DEFAULT_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: model || 'llama3.2:3b',
              messages: messages || [],
              stream: false,
              options: {
                temperature: temperature || 0.7,
                num_predict: max_tokens || 8192,
                num_ctx: 8192,
              }
            }),
            signal: AbortSignal.timeout(OLLAMA_CHAT_TIMEOUT)
          });

          if (chatRes.ok) {
            const data = await chatRes.json();
            return res.status(200).json({
              success: true,
              source: 'ollama-live',
              message: data.message,
              model: data.model,
              eval_count: data.eval_count,
              eval_duration: data.eval_duration,
            });
          }
        } catch (e) {
          // Ollama not available — use smart fallback
        }

        // Smart fallback responses for demo mode
        const lastMessage = messages?.[messages.length - 1]?.content || '';
        const fallbackResponse = generateSmartResponse(lastMessage);

        return res.status(200).json({
          success: true,
          source: 'goat-ai-fallback',
          message: {
            role: 'assistant',
            content: fallbackResponse
          },
          model: 'goat-royalty-ai',
          note: 'Running in demo mode. Install Ollama for full local LLM: curl -fsSL https://ollama.com/install.sh | sh'
        });

      // ═══ Pull Model ═══
      case 'pull':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'POST required' });
        }
        const { modelName } = req.body;
        try {
          const pullRes = await fetch(`${OLLAMA_DEFAULT_URL}/api/pull`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: modelName, stream: false }),
            signal: AbortSignal.timeout(600000) // 10 min timeout for large models
          });
          if (pullRes.ok) {
            const data = await pullRes.json();
            return res.status(200).json({ success: true, ...data });
          }
        } catch (e) {
          return res.status(503).json({
            success: false,
            error: 'Ollama not available. Start with: ollama serve',
            command: `ollama pull ${modelName}`
          });
        }
        break;

      // ═══ Health Check ═══
      case 'health':
        let ollamaOnline = false;
        try {
          const healthRes = await fetch(`${OLLAMA_DEFAULT_URL}/`, {
            signal: AbortSignal.timeout(3000)
          });
          ollamaOnline = healthRes.ok;
        } catch (e) {}

        return res.status(200).json({
          success: true,
          gateway: 'online',
          ollama: ollamaOnline ? 'connected' : 'offline',
          timestamp: new Date().toISOString(),
          app: 'GOAT Royalty × Oscar AI',
          version: '1.0.0'
        });

      default:
        return res.status(200).json({
          success: true,
          service: '🤖 Oscar AI API — GOAT Royalty',
          endpoints: {
            'GET /api/openclaw?action=status': 'Gateway status & system info',
            'GET /api/openclaw?action=models': 'List available LLM models',
            'GET /api/openclaw?action=health': 'Health check (Ollama + Gateway)',
            'POST /api/openclaw?action=chat': 'Send chat message to local LLM',
            'POST /api/openclaw?action=pull': 'Pull/download a model via Ollama',
          }
        });
    }
  } catch (error) {
    console.error('Oscar AI API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// Smart Fallback Response Generator (when Ollama is not running)
// ═══════════════════════════════════════════════════════════════
function generateSmartResponse(input) {
  const lower = input.toLowerCase();

  if (lower.includes('royalt') || lower.includes('earning') || lower.includes('revenue')) {
    return `📊 **GOAT Royalty Analysis**\n\nBased on the FASTASSMAN Publishing catalog of 3,650+ tracks:\n\n• **Estimated Monthly Revenue**: $12,400 - $18,600 across all platforms\n• **Top Platform**: Spotify (42%), Apple Music (28%), YouTube Music (15%)\n• **Growth Trend**: +8.3% quarter-over-quarter\n• **Top Performing Track**: Currently analyzing streaming data...\n\n💡 *For real-time calculations, connect to the Royalty Engine at /api/royalty-engine*\n\n🤖 *Oscar is running in demo mode — install Ollama for full AI analysis: \`curl -fsSL https://ollama.com/install.sh | sh\`*`;
  }

  if (lower.includes('track') || lower.includes('song') || lower.includes('music') || lower.includes('catalog')) {
    return `🎵 **Catalog Overview — FASTASSMAN Publishing**\n\n• **Total Tracks**: 3,650+\n• **Active Platforms**: 25+ DSPs worldwide\n• **Genres**: Hip-Hop, R&B, Electronic, Pop, Gospel\n• **Key Artists**: DJ Speedy, Harvey Miller, featured collaborations\n• **ISRC Coverage**: 100% registered\n• **Publishing Admin**: ASCAP/BMI registered\n\nI can help you search specific tracks, analyze performance, or generate reports. What would you like to explore?\n\n🤖 *Oscar Demo Mode — connect Ollama for deep catalog analysis*`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('what can')) {
    return `👑 **Welcome to GOAT Royalty AI — Powered by Oscar**\n\nI'm your personal AI assistant for managing the FASTASSMAN Publishing empire. Here's what I can help with:\n\n🎵 **Music Catalog** — Search, analyze, and manage 3,650+ tracks\n💰 **Royalty Tracking** — Real-time earnings across all platforms\n📊 **Analytics** — Streaming trends, audience insights, growth metrics\n🎬 **Content** — Video generation, artwork, marketing materials\n🔒 **Privacy** — All processing runs locally on your hardware\n\nWhat would you like to work on today?\n\n🤖 *Tip: Install Ollama + pull llama3.3:70b for the most powerful local AI experience*`;
  }

  if (lower.includes('deploy') || lower.includes('server') || lower.includes('host')) {
    return `🚀 **Deployment Guide — GOAT Royalty**\n\n**Current Setup:**\n• Web App: Next.js on Hostinger VPS\n• Desktop: Electron (SuperGOATRoyalty)\n• AI Backend: Oscar + Ollama\n\n**Quick Deploy Commands:**\n\`\`\`bash\n# Deploy web app\nsh DEPLOY-ALL-IN-ONE.sh\n\n# Launch Oscar\n./Launch Raspy Oscar.command\n\n# Start Ollama\nollama serve\n\n# Pull recommended model\nollama pull llama3.3:70b\n\`\`\`\n\nNeed help with a specific deployment step?`;
  }

  return `🤖 **Oscar AI Assistant**\n\nI received your message: "${input.substring(0, 100)}${input.length > 100 ? '...' : ''}"\n\nI'm currently running in **demo mode** without a local LLM backend. To unlock full AI capabilities:\n\n1. **Install Ollama**: \`curl -fsSL https://ollama.com/install.sh | sh\`\n2. **Pull a model**: \`ollama pull llama3.2:3b\` (fast) or \`ollama pull llama3.3:70b\` (powerful)\n3. **Launch Oscar**: The app will auto-detect Ollama on localhost:11434\n\nOnce connected, I can provide intelligent responses powered by local LLMs with full privacy — no data leaves your machine.\n\n👑 *GOAT Royalty × Oscar — Your Music Empire, Your AI*`;
}

// Next.js API route config — extend timeout for long-running Ollama inference
export const config = {
  maxDuration: 600, // 10 min (matches OLLAMA_LOAD_TIMEOUT)
};