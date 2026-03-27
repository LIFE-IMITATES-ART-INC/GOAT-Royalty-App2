/**
 * GOAT Agent Manager - Unified AI Agent System
 * 
 * This is the central hub that coordinates all specialized agents,
 * providing a single interface for the GOAT app to interact with
 * the AI agent ecosystem.
 * 
 * Features:
 * - Agent registration and discovery
 * - Load balancing across agents
 * - Conversation-style interface (Atlas Brain inspired)
 * - Multi-agent collaboration
 * - Learning and improvement tracking
 */

import OrchestratorAgent from './OrchestratorAgent';
import CoderAgent from './CoderAgent';
import AnalystAgent from './AnalystAgent';
import BlockchainAgent from './BlockchainAgent';
import ResearchAgent from './ResearchAgent';
import VideoAgent from './VideoAgent';
import AudioAgent from './AudioAgent';
import AutomationAgent from './AutomationAgent';

class AgentManager {
  constructor(config = {}) {
    this.name = 'GOAT Agent Manager';
    this.version = '2.0.0';
    
    // Initialize the orchestrator (supervisor)
    this.orchestrator = new OrchestratorAgent(config.orchestrator);
    
    // Initialize specialized agents
    this.specializedAgents = {
      coder: new CoderAgent(config.coder),
      analyst: new AnalystAgent(config.analyst),
      blockchain: new BlockchainAgent(config.blockchain),
      researcher: new ResearchAgent(config.researcher),
      video: new VideoAgent(config.video),
      audio: new AudioAgent(config.audio),
      automation: new AutomationAgent(config.automation)
    };
    
    // Register all agents with the orchestrator
    Object.entries(this.specializedAgents).forEach(([name, agent]) => {
      this.orchestrator.registerAgent(name, agent);
    });
    
    // Conversation history for context
    this.conversationHistory = [];
    this.maxHistoryLength = 50;
    
    // Learning metrics
    this.metrics = {
      totalTasks: 0,
      successfulTasks: 0,
      failedTasks: 0,
      averageExecutionTime: 0,
      agentUsage: {}
    };
    
    // LLM Integration (will be connected to NVIDIA NIM)
    this.llmProvider = null;
  }

  /**
   * Set the LLM provider (NVIDIA NIM, OpenAI, etc.)
   */
  setLLMProvider(provider) {
    this.llmProvider = provider;
    console.log(`🧠 LLM Provider set: ${provider.name || 'Unknown'}`);
  }

  /**
   * Main conversation interface (Atlas Brain style)
   * Takes natural language input and executes appropriate actions
   */
  async chat(message, context = {}) {
    console.log(`💬 User: "${message}"`);
    
    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: Date.now()
    });
    
    // Trim history if needed
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
    
    // Determine the best agent(s) for this request
    const agentSelection = this.selectAgent(message, context);
    
    let response;
    
    if (agentSelection.multiAgent) {
      // Use orchestrator for complex, multi-agent tasks
      response = await this.orchestrator.processGoal(message, {
        ...context,
        conversationHistory: this.conversationHistory
      });
    } else {
      // Use single specialized agent
      const agent = this.specializedAgents[agentSelection.agent];
      if (agent) {
        response = await agent.execute(message, {
          ...context,
          conversationHistory: this.conversationHistory
        });
      } else {
        response = {
          success: false,
          error: `Agent not found: ${agentSelection.agent}`
        };
      }
    }
    
    // Update metrics
    this.updateMetrics(response, agentSelection.agent);
    
    // Add response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: response,
      agent: agentSelection.agent,
      timestamp: Date.now()
    });
    
    return {
      success: true,
      response,
      agent: agentSelection.agent,
      conversationId: this.conversationHistory.length
    };
  }

  /**
   * Select the best agent for a given request
   */
  selectAgent(message, context = {}) {
    const msgLower = message.toLowerCase();
    
    // Define agent selection rules
    const rules = [
      { agent: 'coder', keywords: ['code', 'script', 'develop', 'build', 'function', 'api', 'git'] },
      { agent: 'analyst', keywords: ['analyze', 'data', 'report', 'insight', 'trend', 'metric', 'analytics'] },
      { agent: 'blockchain', keywords: ['blockchain', 'crypto', 'nft', 'wallet', 'smart contract', 'ethereum', 'bitcoin'] },
      { agent: 'researcher', keywords: ['research', 'find', 'search', 'investigate', 'study', 'compare'] },
      { agent: 'video', keywords: ['video', 'edit', 'render', 'effects', 'film', 'movie', 'youtube'] },
      { agent: 'audio', keywords: ['audio', 'music', 'mix', 'master', 'beat', 'produce', 'track', 'song'] },
      { agent: 'automation', keywords: ['automate', 'schedule', 'bot', 'workflow', 'cron', 'task'] }
    ];
    
    // Count matches for each agent
    const scores = {};
    for (const rule of rules) {
      scores[rule.agent] = 0;
      for (const keyword of rule.keywords) {
        if (msgLower.includes(keyword)) {
          scores[rule.agent]++;
        }
      }
    }
    
    // Find best matching agent
    let bestAgent = 'researcher'; // default
    let bestScore = 0;
    
    for (const [agent, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }
    
    // If multiple keywords from different agents, use multi-agent
    const multiAgent = Object.values(scores).filter(s => s > 0).length > 2;
    
    return {
      agent: bestAgent,
      score: bestScore,
      multiAgent,
      allScores: scores
    };
  }

  /**
   * Update performance metrics
   */
  updateMetrics(response, agent) {
    this.metrics.totalTasks++;
    
    if (response.success) {
      this.metrics.successfulTasks++;
    } else {
      this.metrics.failedTasks++;
    }
    
    // Track agent usage
    if (!this.metrics.agentUsage[agent]) {
      this.metrics.agentUsage[agent] = 0;
    }
    this.metrics.agentUsage[agent]++;
  }

  /**
   * Get available capabilities
   */
  getCapabilities() {
    return {
      name: this.name,
      version: this.version,
      orchestrator: this.orchestrator.getCapabilities(),
      agents: Object.fromEntries(
        Object.entries(this.specializedAgents).map(([name, agent]) => [
          name,
          agent.getCapabilities()
        ])
      ),
      metrics: this.metrics
    };
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
    console.log('🧹 Conversation history cleared');
  }

  /**
   * Execute a specific task with a specific agent
   */
  async executeWithAgent(agentName, task, context = {}) {
    const agent = this.specializedAgents[agentName];
    
    if (!agent) {
      return {
        success: false,
        error: `Agent not found: ${agentName}. Available: ${Object.keys(this.specializedAgents).join(', ')}`
      };
    }
    
    return await agent.execute(task, context);
  }

  /**
   * Get all agent statuses
   */
  getStatus() {
    return {
      orchestrator: this.orchestrator.getState(),
      agents: Object.fromEntries(
        Object.entries(this.specializedAgents).map(([name, agent]) => [
          name,
          {
            name: agent.name,
            version: agent.version,
            tools: Array.from(agent.tools.keys()),
            memoryItems: agent.memory.shortTerm.length + agent.memory.longTerm.length,
            learningCount: agent.learningHistory.length
          }
        ])
      ),
      metrics: this.metrics,
      conversationLength: this.conversationHistory.length
    };
  }

  /**
   * Reset all agents
   */
  reset() {
    this.orchestrator.reset();
    this.conversationHistory = [];
    this.metrics = {
      totalTasks: 0,
      successfulTasks: 0,
      failedTasks: 0,
      averageExecutionTime: 0,
      agentUsage: {}
    };
    console.log('🔄 Agent Manager reset complete');
  }
}

// Export singleton instance
let instance = null;

export function getAgentManager(config = {}) {
  if (!instance) {
    instance = new AgentManager(config);
  }
  return instance;
}

export { AgentManager };
export default AgentManager;