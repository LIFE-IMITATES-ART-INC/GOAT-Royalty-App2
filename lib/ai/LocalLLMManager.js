/**
 * Local LLM Manager
 * Manages local LLM deployment, storage, and inference
 * Supports Ollama, LM Studio, vLLM, llama.cpp, and llamafile
 */

const { exec, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const https = require('https');

class LocalLLMManager {
  constructor(options = {}) {
    this.modelsDir = options.modelsDir || './models';
    this.ollamaUrl = options.ollamaUrl || 'http://localhost:11434';
    this.lmStudioUrl = options.lmStudioUrl || 'http://localhost:1234';
    this.vllmUrl = options.vllmUrl || 'http://localhost:8000';
    
    // Generous timeout for slow hardware (CPU-only inference, USB/HDD
    // model storage, cold model loads).  Matches OLLAMA_LOAD_TIMEOUT=10m.
    this.chatTimeout = options.chatTimeout || 600000; // 10 min
    
    // Supported backends
    this.backends = {
      ollama: { url: this.ollamaUrl, available: false },
      lmstudio: { url: this.lmStudioUrl, available: false },
      vllm: { url: this.vllmUrl, available: false },
      llamacpp: { url: 'http://localhost:8080', available: false }
    };
    
    // Model storage
    this.downloadedModels = [];
    this.loadedModel = null;
    
    // Configuration
    this.config = {
      defaultBackend: options.defaultBackend || 'ollama',
      autoDetectBackends: options.autoDetectBackends !== false,
      maxConcurrentRequests: options.maxConcurrentRequests || 10
    };
    
    // Initialize
    if (this.config.autoDetectBackends) {
      this.detectBackends();
    }
  }

  /**
   * Detect available LLM backends
   */
  async detectBackends() {
    console.log('🔍 Detecting available LLM backends...');
    
    for (const [name, backend] of Object.entries(this.backends)) {
      try {
        const response = await this.checkHealth(backend.url);
        backend.available = response;
        console.log(`${response ? '✅' : '❌'} ${name}: ${backend.url}`);
      } catch (error) {
        backend.available = false;
        console.log(`❌ ${name}: Not available`);
      }
    }
    
    return this.backends;
  }

  /**
   * Check if a backend is healthy
   */
  async checkHealth(url) {
    return new Promise((resolve) => {
      const client = url.startsWith('https') ? https : http;
      
      const req = client.get(`${url}/api/tags`, { timeout: 2000 }, (res) => {
        resolve(res.statusCode === 200);
      });
      
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  /**
   * Get the best available backend
   */
  getAvailableBackend() {
    for (const [name, backend] of Object.entries(this.backends)) {
      if (backend.available) {
        return name;
      }
    }
    return null;
  }

  // ============ OLLAMA METHODS ============

  /**
   * Install Ollama
   */
  async installOllama() {
    const platform = process.platform;
    
    if (platform === 'win32') {
      return {
        success: false,
        message: 'Please download Ollama from https://ollama.com/download',
        url: 'https://ollama.com/download'
      };
    }
    
    return new Promise((resolve, reject) => {
      exec('curl -fsSL https://ollama.com/install.sh | sh', (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Ollama installation failed: ${error.message}`));
        } else {
          resolve({ success: true, message: 'Ollama installed successfully' });
        }
      });
    });
  }

  /**
   * Pull a model with Ollama
   */
  async ollamaPull(modelName) {
    return new Promise((resolve, reject) => {
      exec(`ollama pull ${modelName}`, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Failed to pull model: ${error.message}`));
        } else {
          this.downloadedModels.push({ name: modelName, backend: 'ollama' });
          resolve({ success: true, modelName, output: stdout });
        }
      });
    });
  }

  /**
   * List Ollama models
   */
  async ollamaList() {
    const response = await fetch(`${this.ollamaUrl}/api/tags`, {
      signal: AbortSignal.timeout(15000)
    });
    const data = await response.json();
    return data.models || [];
  }

  /**
   * Run Ollama inference
   */
  async ollamaChat(model, messages, options = {}) {
    const timeout = options.timeout || this.chatTimeout;
    const response = await fetch(`${this.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 2048
        }
      }),
      signal: AbortSignal.timeout(timeout)
    });
    
    const data = await response.json();
    return {
      content: data.message?.content || '',
      model: data.model,
      totalDuration: data.total_duration,
      evalCount: data.eval_count
    };
  }

  // ============ LM STUDIO METHODS ============

  /**
   * Check LM Studio availability
   */
  async lmStudioStatus() {
    try {
      const response = await fetch(`${this.lmStudioUrl}/v1/models`);
      const data = await response.json();
      return {
        available: true,
        models: data.data || []
      };
    } catch (error) {
      return { available: false, models: [] };
    }
  }

  /**
   * LM Studio OpenAI-compatible chat
   */
  async lmStudioChat(model, messages, options = {}) {
    const response = await fetch(`${this.lmStudioUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'local-model',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048
      })
    });
    
    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      model: data.model,
      usage: data.usage
    };
  }

  // ============ VLLM METHODS ============

  /**
   * Start vLLM server
   */
  async startVllmServer(modelPath, options = {}) {
    const args = [
      'vllm',
      'serve',
      modelPath,
      '--port', options.port || 8000,
      '--gpu-memory-utilization', options.gpuMemory || 0.9
    ];
    
    if (options.tensorParallelSize) {
      args.push('--tensor-parallel-size', options.tensorParallelSize);
    }
    
    const process = spawn('python', args, { stdio: 'inherit' });
    
    return new Promise((resolve) => {
      process.on('spawn', () => {
        resolve({ success: true, pid: process.pid });
      });
      process.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
    });
  }

  /**
   * vLLM inference
   */
  async vllmChat(model, messages, options = {}) {
    const response = await fetch(`${this.vllmUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048
      })
    });
    
    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      model: data.model,
      usage: data.usage
    };
  }

  // ============ LLAMA.CPP METHODS ============

  /**
   * Start llama.cpp server
   */
  async startLlamaCppServer(modelPath, options = {}) {
    const args = [
      './server',  // Assumes llama.cpp is built
      '-m', modelPath,
      '-ngl', options.gpuLayers || 99,
      '-c', options.contextSize || 4096,
      '--port', options.port || 8080
    ];
    
    const process = spawn('./llama.cpp/server', args, { stdio: 'inherit' });
    
    return new Promise((resolve) => {
      process.on('spawn', () => {
        resolve({ success: true, pid: process.pid });
      });
      process.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
    });
  }

  /**
   * llama.cpp inference
   */
  async llamaCppChat(prompt, options = {}) {
    const response = await fetch(`http://localhost:${options.port || 8080}/completion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        n_predict: options.maxTokens || 2048,
        temperature: options.temperature || 0.7,
        stop: options.stop || []
      })
    });
    
    const data = await response.json();
    return {
      content: data.content,
      tokensEvaluated: data.tokens_evaluated,
      tokensGenerated: data.tokens_generated
    };
  }

  // ============ UNIFIED METHODS ============

  /**
   * Chat with any available backend
   */
  async chat(messages, options = {}) {
    const backend = options.backend || this.config.defaultBackend;
    const model = options.model || 'llama3';
    
    // Try requested backend first
    if (this.backends[backend]?.available) {
      return this.chatWithBackend(backend, model, messages, options);
    }
    
    // Fall back to any available backend
    for (const [name, config] of Object.entries(this.backends)) {
      if (config.available) {
        console.log(`Using fallback backend: ${name}`);
        return this.chatWithBackend(name, model, messages, options);
      }
    }
    
    throw new Error('No LLM backend available. Please start Ollama, LM Studio, or vLLM.');
  }

  /**
   * Route chat to specific backend
   */
  async chatWithBackend(backend, model, messages, options) {
    switch (backend.toLowerCase()) {
      case 'ollama':
        return this.ollamaChat(model, messages, options);
      case 'lmstudio':
        return this.lmStudioChat(model, messages, options);
      case 'vllm':
        return this.vllmChat(model, messages, options);
      case 'llamacpp':
        const prompt = this.messagesToPrompt(messages);
        return this.llamaCppChat(prompt, options);
      default:
        throw new Error(`Unknown backend: ${backend}`);
    }
  }

  /**
   * Convert messages to prompt for non-chat APIs
   */
  messagesToPrompt(messages) {
    return messages.map(m => {
      const role = m.role.toUpperCase();
      return `${role}: ${m.content}`;
    }).join('\n\n') + '\n\nASSISTANT:';
  }

  /**
   * Download model from Hugging Face
   */
  async downloadModel(repoId, filename, localDir = this.modelsDir) {
    const { hf_hub_download } = await import('huggingface_hub');
    
    console.log(`Downloading ${filename} from ${repoId}...`);
    
    const modelPath = await hf_hub_download({
      repo_id: repoId,
      filename: filename,
      local_dir: localDir
    });
    
    this.downloadedModels.push({
      name: filename,
      path: modelPath,
      source: 'huggingface',
      repoId
    });
    
    return modelPath;
  }

  /**
   * List all downloaded models
   */
  async listDownloadedModels() {
    const models = [];
    
    // Check models directory
    try {
      const files = await fs.readdir(this.modelsDir);
      for (const file of files) {
        if (file.endsWith('.gguf') || file.endsWith('.bin')) {
          const stat = await fs.stat(path.join(this.modelsDir, file));
          models.push({
            name: file,
            path: path.join(this.modelsDir, file),
            size: stat.size,
            source: 'local'
          });
        }
      }
    } catch (error) {
      // Directory doesn't exist yet
    }
    
    // Add Ollama models
    try {
      const ollamaModels = await this.ollamaList();
      for (const model of ollamaModels) {
        models.push({
          name: model.name,
          size: model.size,
          source: 'ollama'
        });
      }
    } catch (error) {
      // Ollama not available
    }
    
    return models;
  }

  /**
   * Get system requirements
   */
  getSystemRequirements(modelSize) {
    const requirements = {
      '7B': { ram: '8GB', vram: '6GB', disk: '4-8GB' },
      '13B': { ram: '16GB', vram: '12GB', disk: '8-12GB' },
      '30B': { ram: '32GB', vram: '24GB', disk: '20GB' },
      '70B': { ram: '64GB', vram: '48GB', disk: '40GB' },
      '120B': { ram: '128GB', vram: '80GB', disk: '80GB' }
    };
    
    return requirements[modelSize] || requirements['7B'];
  }

  /**
   * Generate embeddings using local model
   */
  async generateEmbeddings(text, model = 'nomic-embed-text') {
    const response = await fetch(`${this.ollamaUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: text }),
      signal: AbortSignal.timeout(this.chatTimeout)
    });
    
    const data = await response.json();
    return data.embedding;
  }

  /**
   * Create custom model from GGUF
   */
  async createCustomModel(name, ggufPath, options = {}) {
    // Create Modelfile
    const modelfile = `FROM ${ggufPath}
PARAMETER temperature ${options.temperature || 0.7}
PARAMETER num_ctx ${options.contextSize || 4096}
SYSTEM ${options.systemPrompt || 'You are a helpful assistant.'}
`;
    
    const modelfilePath = path.join(this.modelsDir, 'Modelfile');
    await fs.writeFile(modelfilePath, modelfile);
    
    // Create model with Ollama
    return new Promise((resolve, reject) => {
      exec(`ollama create ${name} -f ${modelfilePath}`, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Failed to create model: ${error.message}`));
        } else {
          resolve({ success: true, name, output: stdout });
        }
      });
    });
  }

  /**
   * Export chat history
   */
  async exportChatHistory(messages, format = 'json') {
    const exportPath = path.join(this.modelsDir, `chat-history-${Date.now()}.${format}`);
    
    if (format === 'json') {
      await fs.writeFile(exportPath, JSON.stringify(messages, null, 2));
    } else if (format === 'markdown') {
      const content = messages.map(m => `**${m.role}**: ${m.content}`).join('\n\n---\n\n');
      await fs.writeFile(exportPath, content);
    }
    
    return exportPath;
  }
}

// Export
module.exports = LocalLLMManager;
module.exports.default = LocalLLMManager;