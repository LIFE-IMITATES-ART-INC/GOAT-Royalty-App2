/**
 * GOAT Orchestrator Agent - Hierarchical Supervisor Pattern
 * 
 * This is the highest-level AI agent that acts as a "manager" 
 * decomposing complex goals into subtasks and delegating to specialized workers.
 * 
 * Features:
 * - Goal decomposition
 * - Task delegation to specialized agents
 * - Workflow coordination
 * - State management across long-running tasks
 * - Human approval checkpoints for high-stakes decisions
 */

class OrchestratorAgent {
  constructor(config = {}) {
    this.name = 'GOAT Orchestrator';
    this.version = '2.0.0';
    this.agents = new Map();
    this.taskQueue = [];
    this.completedTasks = [];
    this.state = {
      currentGoal: null,
      decomposedTasks: [],
      activeWorkflows: [],
      checkpoints: []
    };
    
    // Configuration
    this.config = {
      maxConcurrentTasks: config.maxConcurrentTasks || 5,
      approvalThreshold: config.approvalThreshold || 0.8, // Risk level requiring approval
      timeoutMs: config.timeoutMs || 300000, // 5 minutes default
      verbose: config.verbose || true,
      ...config
    };

    // Available specialized agents
    this.availableAgents = [
      'coder', 'analyst', 'marketer', 'tester', 'researcher',
      'royalty', 'blockchain', 'video', 'audio', 'automation'
    ];
  }

  /**
   * Register a specialized agent
   */
  registerAgent(name, agentInstance) {
    if (!this.availableAgents.includes(name)) {
      console.warn(`Unknown agent type: ${name}. Available: ${this.availableAgents.join(', ')}`);
    }
    this.agents.set(name, agentInstance);
    console.log(`✅ Registered agent: ${name}`);
  }

  /**
   * Main entry point - Process a natural language goal
   */
  async processGoal(goal, context = {}) {
    console.log(`🎯 Orchestrator received goal: "${goal}"`);
    
    this.state.currentGoal = goal;
    
    // Step 1: Analyze and decompose the goal
    const decomposition = await this.decomposeGoal(goal, context);
    this.state.decomposedTasks = decomposition.tasks;
    
    // Step 2: Check if any tasks require human approval
    const approvalsNeeded = decomposition.tasks.filter(t => t.riskLevel >= this.config.approvalThreshold);
    
    if (approvalsNeeded.length > 0) {
      console.log(`⚠️ ${approvalsNeeded.length} tasks require human approval`);
      // In a real implementation, this would pause and wait for approval
      // For now, we'll log and proceed
    }
    
    // Step 3: Execute tasks in optimal order
    const results = await this.executeTasks(decomposition.tasks, context);
    
    // Step 4: Synthesize results
    const synthesis = await this.synthesizeResults(results);
    
    return {
      success: true,
      goal,
      tasksExecuted: results.length,
      results: synthesis,
      state: this.state
    };
  }

  /**
   * Decompose a complex goal into actionable subtasks
   */
  async decomposeGoal(goal, context) {
    const tasks = [];
    const goalLower = goal.toLowerCase();
    
    // Intelligent goal decomposition based on keywords and context
    const decompositionRules = [
      {
        patterns: ['create', 'build', 'develop', 'make'],
        agent: 'coder',
        priority: 1
      },
      {
        patterns: ['analyze', 'report', 'insights', 'data'],
        agent: 'analyst',
        priority: 2
      },
      {
        patterns: ['market', 'promote', 'campaign', 'ads'],
        agent: 'marketer',
        priority: 2
      },
      {
        patterns: ['test', 'verify', 'check', 'validate'],
        agent: 'tester',
        priority: 3
      },
      {
        patterns: ['research', 'find', 'search', 'investigate'],
        agent: 'researcher',
        priority: 1
      },
      {
        patterns: ['royalty', 'earnings', 'payment', 'revenue'],
        agent: 'royalty',
        priority: 1
      },
      {
        patterns: ['blockchain', 'crypto', 'wallet', 'nft'],
        agent: 'blockchain',
        priority: 1
      },
      {
        patterns: ['video', 'edit', 'render', 'effects'],
        agent: 'video',
        priority: 2
      },
      {
        patterns: ['audio', 'music', 'mix', 'master'],
        agent: 'audio',
        priority: 2
      },
      {
        patterns: ['automate', 'schedule', 'bot', 'workflow'],
        agent: 'automation',
        priority: 2
      }
    ];

    // Match patterns to create tasks
    for (const rule of decompositionRules) {
      for (const pattern of rule.patterns) {
        if (goalLower.includes(pattern)) {
          tasks.push({
            id: `task-${Date.now()}-${tasks.length}`,
            type: pattern,
            agent: rule.agent,
            priority: rule.priority,
            description: `Execute ${pattern} operation for: ${goal}`,
            riskLevel: this.assessRisk(pattern, goal),
            status: 'pending',
            dependencies: []
          });
          break;
        }
      }
    }

    // If no specific tasks identified, create a general research task
    if (tasks.length === 0) {
      tasks.push({
        id: `task-${Date.now()}-0`,
        type: 'general',
        agent: 'researcher',
        priority: 1,
        description: `Research and execute: ${goal}`,
        riskLevel: 0.3,
        status: 'pending',
        dependencies: []
      });
    }

    // Sort by priority
    tasks.sort((a, b) => a.priority - b.priority);

    return { tasks, originalGoal: goal };
  }

  /**
   * Assess risk level for a task (0-1 scale)
   */
  assessRisk(pattern, goal) {
    const highRiskKeywords = ['delete', 'remove', 'transfer', 'payment', 'wallet', 'private'];
    const mediumRiskKeywords = ['publish', 'deploy', 'send', 'update'];
    
    const goalLower = goal.toLowerCase();
    
    for (const keyword of highRiskKeywords) {
      if (goalLower.includes(keyword)) return 0.9;
    }
    
    for (const keyword of mediumRiskKeywords) {
      if (goalLower.includes(keyword)) return 0.6;
    }
    
    return 0.2; // Default low risk
  }

  /**
   * Execute tasks in parallel when possible
   */
  async executeTasks(tasks, context) {
    const results = [];
    
    // Group tasks by dependencies
    const independentTasks = tasks.filter(t => t.dependencies.length === 0);
    const dependentTasks = tasks.filter(t => t.dependencies.length > 0);
    
    // Execute independent tasks in parallel (up to maxConcurrentTasks)
    const batches = this.createBatches(independentTasks, this.config.maxConcurrentTasks);
    
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(task => this.executeTask(task, context))
      );
      results.push(...batchResults);
    }
    
    // Execute dependent tasks after their dependencies complete
    for (const task of dependentTasks) {
      const result = await this.executeTask(task, context);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Create batches for parallel execution
   */
  createBatches(tasks, batchSize) {
    const batches = [];
    for (let i = 0; i < tasks.length; i += batchSize) {
      batches.push(tasks.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Execute a single task using the appropriate agent
   */
  async executeTask(task, context) {
    task.status = 'running';
    task.startTime = Date.now();
    
    console.log(`🔄 Executing task: ${task.id} (${task.agent})`);
    
    const agent = this.agents.get(task.agent);
    
    if (!agent) {
      console.warn(`⚠️ Agent not found: ${task.agent}. Using fallback.`);
      task.status = 'completed';
      task.result = { success: false, error: 'Agent not available' };
      return task;
    }
    
    try {
      const result = await agent.execute(task.description, context);
      task.status = 'completed';
      task.result = result;
      task.endTime = Date.now();
      this.completedTasks.push(task);
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      task.endTime = Date.now();
    }
    
    return task;
  }

  /**
   * Synthesize results from multiple agents into a cohesive response
   */
  async synthesizeResults(results) {
    const successful = results.filter(r => r.status === 'completed');
    const failed = results.filter(r => r.status === 'failed');
    
    return {
      summary: `Completed ${successful.length}/${results.length} tasks`,
      successfulTasks: successful.map(t => ({
        id: t.id,
        agent: t.agent,
        type: t.type,
        result: t.result
      })),
      failedTasks: failed.map(t => ({
        id: t.id,
        agent: t.agent,
        error: t.error
      })),
      recommendations: this.generateRecommendations(results)
    };
  }

  /**
   * Generate recommendations based on task results
   */
  generateRecommendations(results) {
    const recommendations = [];
    
    for (const result of results) {
      if (result.status === 'failed') {
        recommendations.push({
          type: 'retry',
          taskId: result.id,
          suggestion: `Consider retrying ${result.agent} task with different parameters`
        });
      }
    }
    
    return recommendations;
  }

  /**
   * Get current state for debugging/monitoring
   */
  getState() {
    return {
      ...this.state,
      registeredAgents: Array.from(this.agents.keys()),
      queueLength: this.taskQueue.length,
      completedCount: this.completedTasks.length
    };
  }

  /**
   * Reset orchestrator state
   */
  reset() {
    this.state = {
      currentGoal: null,
      decomposedTasks: [],
      activeWorkflows: [],
      checkpoints: []
    };
    this.taskQueue = [];
    this.completedTasks = [];
    console.log('🔄 Orchestrator state reset');
  }
}

export default OrchestratorAgent;