/**
 * NVIDIA NIM API Client
 * Handles all interactions with NVIDIA NIM inference microservices
 */

import { NVIDIA_MODELS, getModelById } from './nvidiaModels';

const NVIDIA_NIM_BASE_URL = 'https://integrate.api.nvidia.com/v1';

/**
 * NVIDIA NIM Client Class
 */
class NVIDIANIMClient {
  constructor() {
    this.apiKey = process.env.NVIDIA_API_KEY || process.env.NEXT_PUBLIC_NVIDIA_API_KEY || '';
    this.baseUrl = NVIDIA_NIM_BASE_URL;
    this.timeout = 120000; // 2 minutes default timeout
  }

  /**
   * Set API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Set custom base URL
   */
  setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set timeout
   */
  setTimeout(timeout) {
    this.timeout = timeout;
  }

  /**
   * Make API request with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...options.headers
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - the operation took too long');
      }
      
      throw error;
    }
  }

  /**
   * Chat Completions API
   */
  async chat({
    model,
    messages,
    temperature = 0.7,
    maxTokens = 2048,
    topP = 1,
    topK = 1,
    frequencyPenalty = 0,
    presencePenalty = 0,
    stop = null,
    stream = false,
    tools = null,
    toolChoice = null,
    responseFormat = null,
    seed = null,
    echo = false
  }) {
    const payload = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      top_k: topK,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty
    };

    if (stop) payload.stop = stop;
    if (stream) payload.stream = stream;
    if (tools) payload.tools = tools;
    if (toolChoice) payload.tool_choice = toolChoice;
    if (responseFormat) payload.response_format = responseFormat;
    if (seed !== null) payload.seed = seed;
    if (echo) payload.echo = echo;

    const startTime = Date.now();
    const response = await this.request('/chat/completions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const latency = Date.now() - startTime;

    // Add metadata
    response._metadata = {
      latency,
      model,
      provider: 'nvidia',
      timestamp: new Date().toISOString()
    };

    return response;
  }

  /**
   * Embeddings API
   */
  async embedding({
    model,
    input,
    inputType = 'query',
    truncate = 'END',
    encodingFormat = 'float'
  }) {
    const payload = {
      model,
      input,
      input_type: inputType,
      truncate,
      encoding_format: encodingFormat
    };

    const startTime = Date.now();
    const response = await this.request('/embeddings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const latency = Date.now() - startTime;

    response._metadata = {
      latency,
      model,
      provider: 'nvidia',
      timestamp: new Date().toISOString()
    };

    return response;
  }

  /**
   * Rerank API
   */
  async rerank({
    model,
    query,
    documents,
    topN = null,
    rankFields = null,
    truncate = 'END'
  }) {
    const payload = {
      model,
      query,
      documents
    };

    if (topN) payload.top_n = topN;
    if (rankFields) payload.rank_fields = rankFields;
    payload.truncate = truncate;

    const startTime = Date.now();
    const response = await this.request('/rerank', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const latency = Date.now() - startTime;

    response._metadata = {
      latency,
      model,
      provider: 'nvidia',
      timestamp: new Date().toISOString()
    };

    return response;
  }

  /**
   * Simple chat method with automatic model selection
   */
  async simpleChat(message, options = {}) {
    const {
      model = 'llama-3_1-70b-instruct',
      systemPrompt = null,
      ...chatOptions
    } = options;

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: message });

    return this.chat({
      model,
      messages,
      ...chatOptions
    });
  }

  /**
   * Code generation with specialized prompts
   */
  async generateCode({
    language,
    task,
    code = null,
    model = 'devstral-2-123b-instruct-2512',
    temperature = 0.2,
    maxTokens = 4096
  }) {
    let prompt = '';
    if (code) {
      prompt = `Generate ${task} for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    } else {
      prompt = `Write ${language} code to: ${task}`;
    }

    return this.simpleChat(prompt, {
      model,
      temperature,
      maxTokens,
      systemPrompt: 'You are an expert software developer. Write clean, efficient, well-commented code. Respond only with the code and brief explanation.'
    });
  }

  /**
   * Streaming chat
   */
  async *streamChat(options) {
    const { stream = true, ...chatOptions } = options;
    
    const response = await this.request('/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        ...chatOptions,
        stream: true
      })
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices[0]?.delta?.content) {
              yield parsed.choices[0].delta.content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  /**
   * Batch processing for multiple requests
   */
  async batch(requests) {
    const results = await Promise.allSettled(
      requests.map(req => this.chat(req))
    );

    return results.map((result, index) => ({
      index,
      status: result.status,
      data: result.status === 'fulfilled' ? result.value : result.reason?.message
    }));
  }

  /**
   * Get model information
   */
  getModelInfo(modelId) {
    return getModelById(modelId);
  }

  /**
   * List all available models
   */
  listModels(category = null, provider = null) {
    let models = [...NVIDIA_MODELS];
    
    if (category) {
      models = models.filter(m => m.category === category);
    }
    
    if (provider) {
      models = models.filter(m => m.provider === provider);
    }

    return models;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.request('/models', {
        method: 'GET'
      });
      return {
        healthy: true,
        models: response.data?.length || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
const nvidiaClient = new NVIDIANIMClient();

export default nvidiaClient;
export { NVIDIANIMClient };