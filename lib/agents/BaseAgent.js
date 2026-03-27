/**
 * GOAT Base Agent - Foundation for all specialized agents
 * 
 * All worker agents extend this class to get common functionality:
 * - Memory management
 * - Tool integration
 * - Learning capabilities
 * - State persistence
 */

class BaseAgent {
  constructor(config = {}) {
    this.name = config.name || 'BaseAgent';
    this.version = config.version || '1.0.0';
    this.description = config.description || 'Base agent';
    this.tools = new Map();
    this.memory = {
      shortTerm: [],
      longTerm: [],
      maxShortTerm: 10,
      maxLongTerm: 100
    };
    this.learningHistory = [];
    this.config = {
      timeout: config.timeout || 60000,
      maxRetries: config.maxRetries || 3,
      ...config
    };
  }

  /**
   * Register a tool for this agent to use
   */
  registerTool(name, toolFn, description = '') {
    this.tools.set(name, {
      execute: toolFn,
      description
    });
  }

  /**
   * Execute a tool by name
   */
  async useTool(name, ...args) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    return await tool.execute(...args);
  }

  /**
   * Add to short-term memory
   */
  addToMemory(item, type = 'shortTerm') {
    const memory = this.memory[type];
    memory.push({
      ...item,
      timestamp: Date.now()
    });
    
    // Enforce limits
    if (type === 'shortTerm' && memory.length > this.memory.maxShortTerm) {
      // Move oldest to long-term if significant
      const oldest = memory.shift();
      if (oldest.significance >= 0.7) {
        this.memory.longTerm.push(oldest);
      }
    }
    
    if (type === 'longTerm' && memory.length > this.memory.maxLongTerm) {
      memory.shift();
    }
  }

  /**
   * Get relevant memories for context
   */
  getRelevantMemories(query) {
    // Simple relevance scoring (could be enhanced with embeddings)
    const allMemories = [
      ...this.memory.shortTerm,
      ...this.memory.longTerm
    ];
    
    return allMemories
      .filter(m => m.content && m.content.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }

  /**
   * Learn from feedback
   */
  learn(task, result, feedback) {
    const learning = {
      task,
      result,
      feedback,
      timestamp: Date.now(),
      improved: feedback.success ? 1 : 0
    };
    
    this.learningHistory.push(learning);
    
    // Update internal models based on feedback
    this.updateModel(learning);
  }

  /**
   * Update internal model (placeholder for ML integration)
   */
  updateModel(learning) {
    // This could integrate with actual ML models
    console.log(`📚 ${this.name} learned from: ${learning.task}`);
  }

  /**
   * Execute a task (must be overridden by subclasses)
   */
  async execute(task, context = {}) {
    throw new Error('Execute method must be implemented by subclass');
  }

  /**
   * Get agent capabilities
   */
  getCapabilities() {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      tools: Array.from(this.tools.keys()),
      memoryStats: {
        shortTerm: this.memory.shortTerm.length,
        longTerm: this.memory.longTerm.length
      },
      learningCount: this.learningHistory.length
    };
  }
}

export default BaseAgent;