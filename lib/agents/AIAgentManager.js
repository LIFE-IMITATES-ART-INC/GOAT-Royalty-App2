/**
 * 🐐 SUPER GOAT AI AGENT MANAGER
 * Central management system for all AI agent types
 * Provides unified interface for hierarchical, autonomous, multi-agent,
 * learning, utility-based, and goal-based AI capabilities
 */

import { EventEmitter } from 'events';
import OrchestratorAgent from './OrchestratorAgent';
import AutonomousAgent from './AutonomousAgent';
import MultiAgentSystem from './MultiAgentSystem';
import LearningAgent from './LearningAgent';
import UtilityBasedAgent from './UtilityBasedAgent';
import GoalBasedAgent from './GoalBasedAgent';

class AIAgentManager extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.name = 'GOAT AI Agent Manager';
    this.version = '5.0.0';
    
    // Initialize all agent types
    this.orchestrator = new OrchestratorAgent(config.orchestrator);
    this.autonomous = new AutonomousAgent(config.autonomous);
    this.multiAgent = new MultiAgentSystem(config.multiAgent);
    this.learning = new LearningAgent(config.learning);
    this.utilityBased = new UtilityBasedAgent(config.utilityBased);
    this.goalBased = new GoalBasedAgent(config.goalBased);
    
    // Task queue
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.completedTasks = [];
    
    // Agent routing configuration
    this.routingConfig = {
      // Task types to agent mapping
      taskRouting: {
        'research': ['orchestrator', 'multiAgent'],
        'analysis': ['orchestrator', 'learning'],
        'development': ['autonomous', 'goalBased'],
        'creative': ['orchestrator', 'multiAgent'],
        'royalty': ['orchestrator', 'learning', 'utilityBased'],
        'blockchain': ['autonomous', 'utilityBased'],
        'optimization': ['utilityBased', 'learning'],
        'planning': ['goalBased', 'orchestrator'],
        'automation': ['autonomous', 'goalBased'],
        'content': ['multiAgent', 'goalBased'],
        'default': ['orchestrator']
      },
      // Priority thresholds for agent selection
      priorityThresholds: {
        'critical': 0.95,
        'high': 0.8,
        'medium': 0.5,
        'low': 0.2
      }
    };
    
    // Performance metrics
    this.metrics = {
      tasksProcessed: 0,
      successfulTasks: 0,
      failedTasks: 0,
      averageResponseTime: 0,
      agentUtilization: {
        orchestrator: 0,
        autonomous: 0,
        multiAgent: 0,
        learning: 0,
        utilityBased: 0,
        goalBased: 0
      }
    };
    
    // Configuration
    this.config = {
      maxConcurrentTasks: config.maxConcurrentTasks || 5,
      taskTimeout: config.taskTimeout || 300000, // 5 minutes
      autoLearn: config.autoLearn !== false,
      enableCaching: config.enableCaching !== false,
      debugMode: config.debugMode || false,
      ...config
    };
    
    // Cache for results
    this.resultCache = new Map();
    
    // Set up event forwarding
    this.setupEventForwarding();
  }

  /**
   * Set up event forwarding from all agents
   */
  setupEventForwarding() {
    const agents = [
      { name: 'orchestrator', agent: this.orchestrator },
      { name: 'autonomous', agent: this.autonomous },
      { name: 'multiAgent', agent: this.multiAgent },
      { name: 'learning', agent: this.learning },
      { name: 'utilityBased', agent: this.utilityBased },
      { name: 'goalBased', agent: this.goalBased }
    ];
    
    for (const { name, agent } of agents) {
      agent.on('task_started', (data) => {
        this.emit('agent_event', { agent: name, event: 'task_started', data });
      });
      
      agent.on('task_completed', (data) => {
        this.emit('agent_event', { agent: name, event: 'task_completed', data });
        if (this.config.autoLearn) {
          this.learning.learn({
            type: 'observation',
            observedAction: data,
            observedOutcome: { success: true }
          });
        }
      });
      
      agent.on('error', (data) => {
        this.emit('agent_event', { agent: name, event: 'error', data });
      });
    }
  }

  /**
   * Process a task using the appropriate agent(s)
   */
  async processTask(task) {
    const startTime = Date.now();
    const taskId = task.id || `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    // Check cache
    if (this.config.enableCaching) {
      const cacheKey = this.getCacheKey(task);
      const cached = this.resultCache.get(cacheKey);
      if (cached) {
        this.emit('cache_hit', { taskId, cacheKey });
        return cached;
      }
    }
    
    // Analyze task to determine best agent(s)
    const analysis = this.analyzeTask(task);
    
    // Select agents based on analysis
    const selectedAgents = this.selectAgents(analysis);
    
    // Create task record
    const taskRecord = {
      id: taskId,
      ...task,
      analysis,
      selectedAgents,
      status: 'processing',
      startTime: new Date().toISOString(),
      progress: 0
    };
    
    this.activeTasks.set(taskId, taskRecord);
    this.emit('task_started', { taskId, analysis, selectedAgents });
    
    try {
      let result;
      
      // Execute based on agent selection
      if (selectedAgents.length === 1) {
        result = await this.executeWithAgent(selectedAgents[0], task);
      } else {
        result = await this.executeWithMultipleAgents(selectedAgents, task, analysis);
      }
      
      // Update task record
      taskRecord.status = 'completed';
      taskRecord.result = result;
      taskRecord.endTime = new Date().toISOString();
      taskRecord.duration = Date.now() - startTime;
      
      // Move to completed
      this.completedTasks.push(taskRecord);
      this.activeTasks.delete(taskId);
      
      // Update metrics
      this.updateMetrics(taskRecord, true);
      
      // Learn from success
      if (this.config.autoLearn) {
        this.learning.learn({
          type: 'success',
          action: { type: task.type, agents: selectedAgents },
          context: analysis,
          reward: 1
        });
      }
      
      // Cache result
      if (this.config.enableCaching) {
        this.resultCache.set(this.getCacheKey(task), result);
      }
      
      this.emit('task_completed', { taskId, result, duration: taskRecord.duration });
      
      return result;
      
    } catch (error) {
      // Update task record
      taskRecord.status = 'failed';
      taskRecord.error = error.message;
      taskRecord.endTime = new Date().toISOString();
      taskRecord.duration = Date.now() - startTime;
      
      // Update metrics
      this.updateMetrics(taskRecord, false);
      
      // Learn from failure
      if (this.config.autoLearn) {
        this.learning.learn({
          type: 'failure',
          action: { type: task.type, agents: selectedAgents },
          context: analysis,
          penalty: 0.5
        });
      }
      
      this.emit('task_failed', { taskId, error: error.message });
      
      throw error;
    }
  }

  /**
   * Analyze a task to determine requirements
   */
  analyzeTask(task) {
    const analysis = {
      type: this.classifyTask(task),
      complexity: this.assessComplexity(task),
      priority: this.assessPriority(task),
      capabilities: this.identifyRequiredCapabilities(task),
      constraints: this.identifyConstraints(task),
      deadline: task.deadline ? new Date(task.deadline) : null,
      estimatedDuration: this.estimateDuration(task),
      recommendedAgents: []
    };
    
    // Get recommendations from learning agent
    const recommendations = this.learning.getRecommendations(analysis);
    analysis.recommendations = recommendations;
    
    // Get utility predictions
    const agentUtilities = this.predictAgentUtilities(task);
    analysis.agentUtilities = agentUtilities;
    
    return analysis;
  }

  /**
   * Select the best agent(s) for a task
   */
  selectAgents(analysis) {
    const selectedAgents = [];
    const taskType = analysis.type;
    
    // Get default routing for task type
    const defaultAgents = this.routingConfig.taskRouting[taskType] || 
                          this.routingConfig.taskRouting.default;
    
    // Consider utility predictions
    const utilities = analysis.agentUtilities || {};
    
    // Consider learning recommendations
    const recommendations = analysis.recommendations || [];
    
    // Combine inputs to select agents
    for (const agent of defaultAgents) {
      const utility = utilities[agent] || 0.5;
      const hasRecommendation = recommendations.some(r => r.action.includes(agent));
      
      if (utility > 0.3 || hasRecommendation) {
        selectedAgents.push({
          name: agent,
          utility,
          confidence: hasRecommendation ? 0.8 : 0.5
        });
      }
    }
    
    // Sort by utility
    selectedAgents.sort((a, b) => b.utility - a.utility);
    
    // Limit based on complexity
    const maxAgents = analysis.complexity === 'high' ? 3 : 
                      analysis.complexity === 'medium' ? 2 : 1;
    
    return selectedAgents.slice(0, maxAgents).map(a => a.name);
  }

  /**
   * Execute task with a single agent
   */
  async executeWithAgent(agentName, task) {
    switch (agentName) {
      case 'orchestrator':
        return await this.orchestrator.executeTask(task);
      case 'autonomous':
        return await this.autonomous.executeAutonomously(task);
      case 'multiAgent':
        return await this.multiAgent.executeCollaborative(task);
      case 'learning':
        return await this.processWithLearning(task);
      case 'utilityBased':
        return await this.processWithUtility(task);
      case 'goalBased':
        return await this.processWithGoalBased(task);
      default:
        throw new Error(`Unknown agent: ${agentName}`);
    }
  }

  /**
   * Execute task with multiple agents
   */
  async executeWithMultipleAgents(agents, task, analysis) {
    const results = {};
    
    // Determine execution strategy
    const strategy = this.determineExecutionStrategy(agents, analysis);
    
    switch (strategy) {
      case 'sequential':
        for (const agent of agents) {
          results[agent] = await this.executeWithAgent(agent, task);
        }
        break;
        
      case 'parallel':
        const promises = agents.map(agent => 
          this.executeWithAgent(agent, task).then(result => ({ agent, result }))
        );
        const parallelResults = await Promise.all(promises);
        for (const { agent, result } of parallelResults) {
          results[agent] = result;
        }
        break;
        
      case 'hierarchical':
        // Orchestrator manages other agents
        results.orchestrator = await this.orchestrator.delegateTask(task, {
          workers: agents.filter(a => a !== 'orchestrator')
        });
        break;
        
      case 'collaborative':
        // Multi-agent collaboration
        results.collaborative = await this.multiAgent.executeCollaborative(task);
        break;
    }
    
    // Integrate results
    return this.integrateResults(results, strategy);
  }

  /**
   * Determine execution strategy for multiple agents
   */
  determineExecutionStrategy(agents, analysis) {
    if (agents.includes('orchestrator') && agents.length > 2) {
      return 'hierarchical';
    }
    
    if (agents.includes('multiAgent')) {
      return 'collaborative';
    }
    
    if (analysis.complexity === 'high' && analysis.priority === 'critical') {
      return 'parallel';
    }
    
    return 'sequential';
  }

  /**
   * Integrate results from multiple agents
   */
  integrateResults(results, strategy) {
    const integrated = {
      strategy,
      results,
      consensus: null,
      confidence: 0
    };
    
    // Get all result values
    const resultValues = Object.values(results).filter(r => r !== null && r !== undefined);
    
    if (resultValues.length === 0) {
      return integrated;
    }
    
    // Calculate consensus if multiple results
    if (resultValues.length > 1) {
      integrated.consensus = this.calculateConsensus(resultValues);
      integrated.confidence = integrated.consensus.agreement;
    } else {
      integrated.confidence = 0.7; // Single result confidence
    }
    
    // Use utility-based selection for best result
    const bestResult = this.utilityBased.selectBestAction(
      { results: resultValues },
      resultValues.map((r, i) => ({ type: `result_${i}`, value: r }))
    );
    
    integrated.bestResult = bestResult;
    
    return integrated;
  }

  /**
   * Calculate consensus among results
   */
  calculateConsensus(results) {
    // Simple voting-based consensus
    const votes = new Map();
    
    for (const result of results) {
      const key = this.getResultKey(result);
      votes.set(key, (votes.get(key) || 0) + 1);
    }
    
    const maxVotes = Math.max(...votes.values());
    const agreement = maxVotes / results.length;
    
    return {
      agreement,
      winningKey: [...votes.entries()].find(([_, v]) => v === maxVotes)?.[0],
      voteDistribution: Object.fromEntries(votes)
    };
  }

  /**
   * Process with learning agent
   */
  async processWithLearning(task) {
    const action = this.learning.selectAction(
      task.context || {},
      this.generatePossibleActions(task)
    );
    
    const result = await this.executeAction(action);
    
    // Learn from the outcome
    this.learning.learn({
      type: 'interaction',
      action,
      context: task.context,
      outcome: { success: !!result, result }
    });
    
    return result;
  }

  /**
   * Process with utility-based agent
   */
  async processWithUtility(task) {
    const actions = this.generatePossibleActions(task);
    const state = task.context || {};
    
    const selection = this.utilityBased.selectBestAction(state, actions);
    
    return {
      action: selection.action,
      utility: selection.riskAdjustedUtility,
      confidence: selection.confidence,
      alternatives: selection.alternatives
    };
  }

  /**
   * Process with goal-based agent
   */
  async processWithGoalBased(task) {
    // Convert task to goal
    const goal = this.goalBased.setGoal({
      name: task.type || 'task_goal',
      description: task.description || task.prompt,
      targetState: task.targetState || {},
      deadline: task.deadline,
      priority: task.priority || 0.5
    });
    
    // Generate plan
    const plan = this.goalBased.planForGoal(goal);
    
    // Execute plan
    const results = [];
    while (true) {
      const stepResult = await this.goalBased.executeNextStep();
      if (!stepResult) break;
      results.push(stepResult);
    }
    
    return {
      goal: goal.id,
      plan: plan.id,
      steps: results.length,
      completed: results
    };
  }

  /**
   * Generate possible actions for a task
   */
  generatePossibleActions(task) {
    const actions = [];
    const taskType = task.type || 'general';
    
    const actionTemplates = {
      research: [
        { type: 'web_search', description: 'Search the web for information' },
        { type: 'deep_analysis', description: 'Perform deep analysis on data' },
        { type: 'summarize', description: 'Summarize findings' }
      ],
      development: [
        { type: 'code', description: 'Write code' },
        { type: 'test', description: 'Write tests' },
        { type: 'deploy', description: 'Deploy changes' }
      ],
      creative: [
        { type: 'generate', description: 'Generate content' },
        { type: 'edit', description: 'Edit existing content' },
        { type: 'enhance', description: 'Enhance content quality' }
      ],
      royalty: [
        { type: 'track', description: 'Track royalties' },
        { type: 'verify', description: 'Verify payments' },
        { type: 'optimize', description: 'Optimize earnings' }
      ],
      blockchain: [
        { type: 'verify_transaction', description: 'Verify blockchain transaction' },
        { type: 'deploy_contract', description: 'Deploy smart contract' },
        { type: 'analyze', description: 'Analyze blockchain data' }
      ],
      general: [
        { type: 'process', description: 'Process the task' },
        { type: 'analyze', description: 'Analyze the request' },
        { type: 'execute', description: 'Execute the task' }
      ]
    };
    
    return actionTemplates[taskType] || actionTemplates.general;
  }

  /**
   * Execute an action
   */
  async executeAction(action) {
    // This would integrate with actual action executors
    return {
      action: action.type,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Predict utilities for different agents
   */
  predictAgentUtilities(task) {
    const utilities = {};
    const state = task.context || {};
    
    const agentNames = ['orchestrator', 'autonomous', 'multiAgent', 'learning', 'utilityBased', 'goalBased'];
    
    for (const agent of agentNames) {
      const prediction = this.utilityBased.predictOutcome(state, {
        type: `use_${agent}`,
        skill: agent
      });
      utilities[agent] = prediction.successProbability;
    }
    
    return utilities;
  }

  // Helper methods

  classifyTask(task) {
    const description = (task.description || task.prompt || '').toLowerCase();
    const type = task.type?.toLowerCase();
    
    const patterns = {
      research: ['research', 'find', 'investigate', 'analyze', 'study'],
      development: ['build', 'create', 'develop', 'code', 'implement'],
      creative: ['design', 'produce', 'create', 'edit', 'generate'],
      royalty: ['royalty', 'earnings', 'payment', 'track', 'verify'],
      blockchain: ['blockchain', 'smart contract', 'nft', 'crypto', 'verify'],
      optimization: ['optimize', 'improve', 'enhance', 'maximize', 'minimize'],
      planning: ['plan', 'schedule', 'organize', 'coordinate'],
      automation: ['automate', 'automated', 'automatic', 'workflow'],
      content: ['content', 'article', 'post', 'video', 'audio']
    };
    
    for (const [typeKey, keywords] of Object.entries(patterns)) {
      if (type === typeKey || keywords.some(kw => description.includes(kw))) {
        return typeKey;
      }
    }
    
    return 'general';
  }

  assessComplexity(task) {
    const factors = {
      hasSubtasks: !!(task.subtasks && task.subtasks.length > 0),
      hasDependencies: !!(task.dependencies && task.dependencies.length > 0),
      longDescription: (task.description || '').split(' ').length > 50,
      multiStep: /then|after|before|while|and/.test(task.description || ''),
      highPriority: task.priority === 'critical' || task.priority === 'high'
    };
    
    const score = Object.values(factors).filter(Boolean).length;
    
    return score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low';
  }

  assessPriority(task) {
    if (task.priority === 'critical' || task.priority === 'high') return 'critical';
    if (task.deadline && new Date(task.deadline) < new Date(Date.now() + 24 * 60 * 60 * 1000)) return 'critical';
    if (task.priority === 'medium') return 'medium';
    return 'normal';
  }

  identifyRequiredCapabilities(task) {
    const capabilities = [];
    const description = (task.description || task.prompt || '').toLowerCase();
    
    const capabilityKeywords = {
      web_search: ['search', 'find', 'lookup', 'research'],
      data_analysis: ['analyze', 'examine', 'study', 'evaluate'],
      coding: ['code', 'develop', 'build', 'program', 'implement'],
      design: ['design', 'create', 'visual', 'graphic'],
      writing: ['write', 'content', 'article', 'copy'],
      calculation: ['calculate', 'compute', 'estimate', 'forecast'],
      verification: ['verify', 'check', 'validate', 'confirm'],
      planning: ['plan', 'schedule', 'organize', 'coordinate'],
      optimization: ['optimize', 'improve', 'enhance', 'maximize']
    };
    
    for (const [cap, keywords] of Object.entries(capabilityKeywords)) {
      if (keywords.some(kw => description.includes(kw))) {
        capabilities.push(cap);
      }
    }
    
    return capabilities;
  }

  identifyConstraints(task) {
    return task.constraints || [];
  }

  estimateDuration(task) {
    const complexity = this.assessComplexity(task);
    const baseDurations = { low: 60000, medium: 180000, high: 600000 };
    return baseDurations[complexity];
  }

  getCacheKey(task) {
    return `${task.type}_${task.description?.slice(0, 50)}`;
  }

  getResultKey(result) {
    if (typeof result === 'string') return result;
    return JSON.stringify(result).slice(0, 100);
  }

  updateMetrics(taskRecord, success) {
    this.metrics.tasksProcessed++;
    
    if (success) {
      this.metrics.successfulTasks++;
    } else {
      this.metrics.failedTasks++;
    }
    
    // Update average response time
    const totalTime = this.metrics.averageResponseTime * (this.metrics.tasksProcessed - 1);
    this.metrics.averageResponseTime = (totalTime + taskRecord.duration) / this.metrics.tasksProcessed;
    
    // Update agent utilization
    for (const agent of taskRecord.selectedAgents || []) {
      this.metrics.agentUtilization[agent] = 
        (this.metrics.agentUtilization[agent] || 0) + 1;
    }
  }

  /**
   * Get comprehensive status
   */
  getStatus() {
    return {
      name: this.name,
      version: this.version,
      agents: {
        orchestrator: this.orchestrator.getStatus(),
        autonomous: this.autonomous.getStatus(),
        multiAgent: this.multiAgent.getStatus(),
        learning: this.learning.getStatus(),
        utilityBased: this.utilityBased.getStatus(),
        goalBased: this.goalBased.getStatus()
      },
      tasks: {
        active: this.activeTasks.size,
        completed: this.completedTasks.length,
        queued: this.taskQueue.length
      },
      metrics: this.metrics,
      config: this.config
    };
  }

  /**
   * Export all agent knowledge
   */
  exportKnowledge() {
    return {
      orchestrator: this.orchestrator.exportSystem(),
      autonomous: this.autonomous.exportState(),
      multiAgent: this.multiAgent.exportSystem(),
      learning: this.learning.exportKnowledge(),
      utilityBased: this.utilityBased.exportModel(),
      goalBased: this.goalBased.exportState(),
      metrics: this.metrics,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Import knowledge to all agents
   */
  importKnowledge(knowledge) {
    if (knowledge.learning) {
      this.learning.importKnowledge(knowledge.learning);
    }
    
    this.emit('knowledge_imported', {
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Process a natural language request
   */
  async processNaturalLanguage(input) {
    // Parse the natural language input
    const parsed = this.parseNaturalLanguage(input);
    
    // Create a task from the parsed input
    const task = {
      type: parsed.intent,
      description: input,
      context: parsed.entities,
      priority: parsed.priority,
      targetState: parsed.targetState
    };
    
    return await this.processTask(task);
  }

  /**
   * Parse natural language input
   */
  parseNaturalLanguage(input) {
    // Simple parsing - in production would use NLP
    const parsed = {
      intent: 'general',
      entities: {},
      priority: 'normal',
      targetState: {},
      originalInput: input
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detect intent
    if (lowerInput.includes('create') || lowerInput.includes('make') || lowerInput.includes('build')) {
      parsed.intent = 'creation';
    } else if (lowerInput.includes('analyze') || lowerInput.includes('examine')) {
      parsed.intent = 'analysis';
    } else if (lowerInput.includes('find') || lowerInput.includes('search') || lowerInput.includes('lookup')) {
      parsed.intent = 'research';
    } else if (lowerInput.includes('optimize') || lowerInput.includes('improve')) {
      parsed.intent = 'optimization';
    } else if (lowerInput.includes('track') || lowerInput.includes('monitor')) {
      parsed.intent = 'tracking';
    } else if (lowerInput.includes('verify') || lowerInput.includes('check')) {
      parsed.intent = 'verification';
    }
    
    // Detect priority
    if (lowerInput.includes('urgent') || lowerInput.includes('asap') || lowerInput.includes('immediately')) {
      parsed.priority = 'critical';
    } else if (lowerInput.includes('important') || lowerInput.includes('soon')) {
      parsed.priority = 'high';
    }
    
    return parsed;
  }
}

export default AIAgentManager;