/**
 * GOAT LLM Router - Unified Multi-Provider LLM System
 * 
 * Routes requests to the optimal LLM provider based on:
 * - Task complexity
 * - Cost considerations
 * - Latency requirements
 * - Model availability
 * 
 * Supports:
 * - NVIDIA NIM (215+ models)
 * - OpenAI
 * - Anthropic Claude
 * - Google Gemini
 * - Local models
 * 
 * The "Super LLM" feature combines multiple models for enhanced responses.
 */

import NVIDIAProvider from './NVIDIAProvider';

class LLMRouter {
  constructor(config = {}) {
    this.name = 'GOAT LLM Router';
    this.version = '2.0.0';
    
    // Initialize providers
    this.providers = new Map();
    
    // Register NVIDIA NIM as primary provider
    if (config.nvidiaApiKey || process.env.NVIDIA_API_KEY) {
      this.providers.set('nvidia', new NVIDIAProvider({
        apiKey: config.nvidiaApiKey || process.env.NVIDIA_API_KEY
      }));
    }
    
    // Provider priorities
    this.priorities = ['nvidia', 'openai', 'anthropic', 'google', 'local'];
    
    // Routing rules
    this.routingRules = {
      coding: ['nvidia', 'openai'],
      analysis: ['nvidia', 'anthropic'],
      creative: ['nvidia', 'google'],
      quick: ['nvidia', 'local'],
      complex: ['nvidia', 'anthropic', 'openai']
    };
    
    // Super LLM configuration
    this.superLLM = {
      enabled: config.enableSuperLLM !== false,
      minProviders: 2,
      consensusThreshold: 0.7
    };
    
    // Usage tracking
    this.usage = {
      totalRequests: 0,
      byProvider: {},
      byModel: {},
      errors: []
    };
  }

  /**
   * Register a new provider
   */
  registerProvider(name, provider) {
    this.providers.set(name, provider);
    console.log(`✅ Registered LLM provider: ${name}`);
  }

  /**
   * Route a request to the best provider
   */
  async route(messages, options = {}) {
    this.usage.totalRequests++;
    
    const taskType = this.classifyTask(messages);
    const preferredProviders = this.routingRules[taskType] || this.priorities;
    
    // Try providers in order of preference
    for (const providerName of preferredProviders) {
      const provider = this.providers.get(providerName);
      
      if (!provider) continue;
      
      try {
        const response = await this.executeWithProvider(providerName, provider, messages, options);
        return response;
      } catch (error) {
        console.warn(`⚠️ Provider ${providerName} failed: ${error.message}`);
        this.usage.errors.push({
          provider: providerName,
          error: error.message,
          timestamp: Date.now()
        });
      }
    }
    
    // All providers failed - return fallback
    return this.getFallbackResponse(messages);
  }

  /**
   * Execute with Super LLM (ensemble across multiple providers)
   */
  async superQuery(messages, options = {}) {
    if (!this.superLLM.enabled) {
      return this.route(messages, options);
    }
    
    console.log('🔮 Executing Super LLM ensemble query...');
    
    // Get all available providers
    const availableProviders = Array.from(this.providers.entries());
    
    if (availableProviders.length < this.superLLM.minProviders) {
      console.log('⚠️ Not enough providers for Super LLM, falling back to single provider');
      return this.route(messages, options);
    }
    
    // Query all providers in parallel
    const promises = availableProviders.map(async ([name, provider]) => {
      try {
        const response = await this.executeWithProvider(name, provider, messages, options);
        return { provider: name, response, success: true };
      } catch (error) {
        return { provider: name, error: error.message, success: false };
      }
    });
    
    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success);
    
    if (successful.length === 0) {
      return this.getFallbackResponse(messages);
    }
    
    // Synthesize responses
    return this.synthesizeSuperLLMResults(results, messages);
  }

  /**
   * Execute with a specific provider
   */
  async executeWithProvider(name, provider, messages, options) {
    if (!this.usage.byProvider[name]) {
      this.usage.byProvider[name] = 0;
    }
    this.usage.byProvider[name]++;
    
    const response = await provider.chat(messages, options);
    
    // Track model usage
    const modelId = response.model || 'unknown';
    if (!this.usage.byModel[modelId]) {
      this.usage.byModel[modelId] = 0;
    }
    this.usage.byModel[modelId]++;
    
    return {
      ...response,
      provider: name
    };
  }

  /**
   * Classify the task type from messages
   */
  classifyTask(messages) {
    const content = messages.map(m => m.content).join(' ').toLowerCase();
    
    if (content.includes('code') || content.includes('function') || content.includes('debug')) {
      return 'coding';
    }
    if (content.includes('analyze') || content.includes('data') || content.includes('report')) {
      return 'analysis';
    }
    if (content.includes('creative') || content.includes('write') || content.includes('story')) {
      return 'creative';
    }
    if (content.includes('quick') || content.includes('simple') || content.includes('brief')) {
      return 'quick';
    }
    if (content.includes('complex') || content.includes('detailed') || content.includes('comprehensive')) {
      return 'complex';
    }
    
    return 'general';
  }

  /**
   * Synthesize Super LLM results
   */
  synthesizeSuperLLMResults(results, messages) {
    const successful = results.filter(r => r.success);
    const responses = successful.map(r => ({
      provider: r.provider,
      content: r.response.choices?.[0]?.message?.content || '',
      model: r.response.model
    }));
    
    // Find the most comprehensive response
    const bestResponse = responses.reduce((best, current) => 
      current.content.length > best.content.length ? current : best
    , responses[0]);
    
    // Check for consensus
    const consensus = this.checkConsensus(responses);
    
    return {
      id: `super-llm-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'super-llm-ensemble',
      superLLM: true,
      providers: results.map(r => r.provider),
      consensus,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: bestResponse.content,
          providerContributions: responses.map(r => ({
            provider: r.provider,
            model: r.model,
            length: r.content.length
          }))
        },
        finish_reason: 'stop'
      }],
      alternatives: responses.slice(1).map(r => ({
        provider: r.provider,
        content: r.content
      })),
      usage: {
        prompt_tokens: messages.reduce((sum, m) => sum + (m.content?.length || 0) / 4, 0),
        completion_tokens: responses.reduce((sum, r) => sum + r.content.length / 4, 0),
        total_tokens: 0
      }
    };
  }

  /**
   * Check consensus between responses
   */
  checkConsensus(responses) {
    if (responses.length < 2) return { score: 1, agreement: 'single-response' };
    
    // Simple keyword-based consensus
    const allWords = responses.map(r => 
      new Set(r.content.toLowerCase().split(/\s+/).filter(w => w.length > 4))
    );
    
    const intersection = new Set([...allWords[0]].filter(w => 
      allWords.slice(1).every(set => set.has(w))
    ));
    
    const score = intersection.size / Math.max(...allWords.map(s => s.size));
    
    return {
      score,
      agreement: score > this.superLLM.consensusThreshold ? 'high' : 
                 score > 0.3 ? 'medium' : 'low',
      commonKeywords: [...intersection].slice(0, 10)
    };
  }

  /**
   * Get fallback response
   */
  getFallbackResponse(messages) {
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    return {
      id: `fallback-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'fallback',
      fallback: true,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: `I apologize, but I'm currently unable to connect to any LLM providers. Please check your API configuration and try again. Your query was: "${lastMessage.substring(0, 100)}..."`
        },
        finish_reason: 'stop'
      }]
    };
  }

  /**
   * Get router status
   */
  getStatus() {
    return {
      name: this.name,
      version: this.version,
      providers: Array.from(this.providers.keys()),
      superLLMEnabled: this.superLLM.enabled,
      usage: this.usage
    };
  }

  /**
   * Get available models across all providers
   */
  getAvailableModels() {
    const models = [];
    
    for (const [name, provider] of this.providers) {
      if (provider.getAvailableModels) {
        const providerModels = provider.getAvailableModels();
        models.push(...providerModels.map(m => ({ ...m, provider: name })));
      }
    }
    
    return models;
  }
}

// Singleton instance
let instance = null;

export function getLLMRouter(config = {}) {
  if (!instance) {
    instance = new LLMRouter(config);
  }
  return instance;
}

export { LLMRouter };
export default LLMRouter;