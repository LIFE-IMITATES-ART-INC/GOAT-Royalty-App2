/**
 * 🐐 SUPER GOAT LEARNING AGENT
 * Self-improving AI agent with memory and reinforcement learning
 * Learns from interactions to improve performance over time
 */

import { EventEmitter } from 'events';

class LearningAgent extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.name = 'GOAT Learning Agent';
    this.version = '5.0.0';
    
    // Memory systems
    this.shortTermMemory = [];
    this.longTermMemory = new Map();
    this.episodicMemory = [];
    this.semanticMemory = new Map();
    
    // Learning parameters
    this.learningRate = config.learningRate || 0.1;
    this.discountFactor = config.discountFactor || 0.95;
    this.explorationRate = config.explorationRate || 0.2;
    this.minExplorationRate = 0.01;
    this.explorationDecay = 0.995;
    
    // Q-Table for reinforcement learning
    this.qTable = new Map();
    
    // Experience replay buffer
    this.experienceBuffer = [];
    this.maxBufferSize = config.maxBufferSize || 10000;
    
    // Neural network-like weights (simplified)
    this.weights = {
      input: new Map(),
      hidden: new Map(),
      output: new Map()
    };
    
    // Performance tracking
    this.performanceHistory = [];
    this.successRate = 0;
    this.totalTasks = 0;
    this.successfulTasks = 0;
    
    // Knowledge base
    this.knowledgeBase = new Map();
    this.skillRatings = new Map();
    
    // Configuration
    this.config = {
      maxMemorySize: config.maxMemorySize || 1000,
      memoryConsolidationThreshold: config.memoryConsolidationThreshold || 100,
      learningEnabled: config.learningEnabled !== false,
      adaptiveness: config.adaptiveness || 0.8,
      ...config
    };
    
    // Initialize default skills
    this.initializeDefaultSkills();
  }

  initializeDefaultSkills() {
    const skills = [
      { name: 'web_search', rating: 0.5, experience: 0 },
      { name: 'data_analysis', rating: 0.5, experience: 0 },
      { name: 'content_creation', rating: 0.5, experience: 0 },
      { name: 'coding', rating: 0.5, experience: 0 },
      { name: 'reasoning', rating: 0.5, experience: 0 },
      { name: 'planning', rating: 0.5, experience: 0 },
      { name: 'communication', rating: 0.5, experience: 0 },
      { name: 'royalty_tracking', rating: 0.5, experience: 0 },
      { name: 'blockchain_verification', rating: 0.5, experience: 0 },
      { name: 'video_editing', rating: 0.5, experience: 0 },
      { name: 'audio_production', rating: 0.5, experience: 0 },
      { name: 'financial_analysis', rating: 0.5, experience: 0 }
    ];
    
    for (const skill of skills) {
      this.skillRatings.set(skill.name, {
        rating: skill.rating,
        experience: skill.experience,
        lastUsed: null,
        improvementHistory: []
      });
    }
  }

  /**
   * Learn from an experience
   */
  learn(experience) {
    if (!this.config.learningEnabled) return;
    
    // Store in experience buffer
    this.addToExperienceBuffer(experience);
    
    // Process based on learning type
    switch (experience.type) {
      case 'success':
        this.learnFromSuccess(experience);
        break;
      case 'failure':
        this.learnFromFailure(experience);
        break;
      case 'feedback':
        this.learnFromFeedback(experience);
        break;
      case 'observation':
        this.learnFromObservation(experience);
        break;
      default:
        this.learnFromInteraction(experience);
    }
    
    // Update Q-values
    this.updateQValues(experience);
    
    // Consolidate memories if needed
    if (this.shortTermMemory.length >= this.config.memoryConsolidationThreshold) {
      this.consolidateMemories();
    }
    
    // Decay exploration rate
    this.explorationRate = Math.max(
      this.minExplorationRate,
      this.explorationRate * this.explorationDecay
    );
    
    this.emit('learning_occurred', {
      type: experience.type,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Learn from successful action
   */
  learnFromSuccess(experience) {
    const { action, context, reward } = experience;
    
    // Strengthen the action-context association
    const key = this.getStateActionKey(context, action);
    const currentValue = this.qTable.get(key) || 0;
    const newValue = currentValue + this.learningRate * (reward - currentValue);
    this.qTable.set(key, newValue);
    
    // Update skill ratings
    if (action.skill) {
      this.improveSkill(action.skill, 0.1);
    }
    
    // Store in episodic memory
    this.episodicMemory.push({
      type: 'success',
      action,
      context,
      reward,
      timestamp: new Date().toISOString()
    });
    
    // Track performance
    this.successfulTasks++;
    this.totalTasks++;
    this.updateSuccessRate();
  }

  /**
   * Learn from failure
   */
  learnFromFailure(experience) {
    const { action, context, penalty } = experience;
    
    // Weaken the action-context association
    const key = this.getStateActionKey(context, action);
    const currentValue = this.qTable.get(key) || 0;
    const newValue = currentValue - this.learningRate * (penalty || 0.1);
    this.qTable.set(key, newValue);
    
    // Update skill ratings (slight decrease)
    if (action.skill) {
      this.improveSkill(action.skill, -0.05);
    }
    
    // Store in episodic memory for avoidance learning
    this.episodicMemory.push({
      type: 'failure',
      action,
      context,
      penalty,
      timestamp: new Date().toISOString()
    });
    
    // Track performance
    this.totalTasks++;
    this.updateSuccessRate();
  }

  /**
   * Learn from user feedback
   */
  learnFromFeedback(experience) {
    const { action, feedback, rating } = experience;
    
    // Adjust based on rating (1-5 scale)
    const normalizedRating = (rating - 3) / 2; // -1 to 1
    
    if (normalizedRating > 0) {
      this.learnFromSuccess({
        type: 'success',
        action,
        context: experience.context,
        reward: normalizedRating
      });
    } else if (normalizedRating < 0) {
      this.learnFromFailure({
        type: 'failure',
        action,
        context: experience.context,
        penalty: Math.abs(normalizedRating)
      });
    }
    
    // Store feedback in semantic memory
    const feedbackKey = `feedback_${action.type || 'general'}`;
    const existingFeedback = this.semanticMemory.get(feedbackKey) || [];
    existingFeedback.push({
      feedback,
      rating,
      timestamp: new Date().toISOString()
    });
    this.semanticMemory.set(feedbackKey, existingFeedback);
  }

  /**
   * Learn from observation (imitation learning)
   */
  learnFromObservation(experience) {
    const { observedAction, observedContext, observedOutcome } = experience;
    
    // Store the observed pattern
    const key = this.getStateActionKey(observedContext, observedAction);
    const value = observedOutcome.success ? 0.8 : 0.2;
    this.qTable.set(key, value);
    
    // Add to knowledge base
    this.addToKnowledgeBase(observedAction, observedOutcome);
    
    // Update semantic memory with patterns
    this.updateSemanticMemory(observedAction, observedContext, observedOutcome);
  }

  /**
   * Learn from general interaction
   */
  learnFromInteraction(experience) {
    const { action, context, outcome } = experience;
    
    // Calculate reward based on outcome
    const reward = this.calculateReward(outcome);
    
    // Update Q-values
    const key = this.getStateActionKey(context, action);
    const currentValue = this.qTable.get(key) || 0;
    const newValue = currentValue + this.learningRate * (reward + this.discountFactor * this.getMaxQValue(context) - currentValue);
    this.qTable.set(key, newValue);
    
    // Add to short-term memory
    this.addToShortTermMemory(experience);
  }

  /**
   * Select best action based on learned values
   */
  selectAction(context, availableActions) {
    // Epsilon-greedy exploration
    if (Math.random() < this.explorationRate) {
      // Explore: random action
      return availableActions[Math.floor(Math.random() * availableActions.length)];
    }
    
    // Exploit: best known action
    let bestAction = null;
    let bestValue = -Infinity;
    
    for (const action of availableActions) {
      const key = this.getStateActionKey(context, action);
      const value = this.qTable.get(key) || 0;
      
      // Add skill bonus
      const skillBonus = action.skill ? (this.skillRatings.get(action.skill)?.rating || 0) * 0.1 : 0;
      const totalValue = value + skillBonus;
      
      if (totalValue > bestValue) {
        bestValue = totalValue;
        bestAction = action;
      }
    }
    
    return bestAction || availableActions[0];
  }

  /**
   * Predict outcome of an action
   */
  predictOutcome(context, action) {
    const key = this.getStateActionKey(context, action);
    const qValue = this.qTable.get(key) || 0;
    
    // Find similar past experiences
    const similarExperiences = this.findSimilarExperiences(context, action);
    
    // Calculate prediction
    const prediction = {
      successProbability: Math.max(0, Math.min(1, qValue)),
      confidence: similarExperiences.length > 5 ? 0.8 : similarExperiences.length / 5,
      similarCases: similarExperiences.length,
      expectedReward: qValue
    };
    
    return prediction;
  }

  /**
   * Recall relevant information from memory
   */
  recall(query) {
    const results = {
      shortTerm: [],
      longTerm: [],
      episodic: [],
      semantic: []
    };
    
    // Search short-term memory
    results.shortTerm = this.shortTermMemory.filter(memory => 
      this.matchesQuery(memory, query)
    ).slice(-10);
    
    // Search long-term memory
    for (const [key, value] of this.longTermMemory) {
      if (this.matchesQuery({ key, value }, query)) {
        results.longTerm.push({ key, value });
      }
    }
    
    // Search episodic memory
    results.episodic = this.episodicMemory.filter(episode =>
      this.matchesQuery(episode, query)
    ).slice(-20);
    
    // Search semantic memory
    for (const [key, value] of this.semanticMemory) {
      if (key.toLowerCase().includes(query.toLowerCase())) {
        results.semantic.push({ key, value });
      }
    }
    
    return results;
  }

  /**
   * Get recommendations based on learning
   */
  getRecommendations(context) {
    const recommendations = [];
    
    // Find best actions for this context
    const relevantActions = [];
    for (const [key, value] of this.qTable) {
      if (key.startsWith(this.getContextKey(context))) {
        relevantActions.push({ action: key.split('_').pop(), value });
      }
    }
    
    // Sort by value and get top recommendations
    relevantActions.sort((a, b) => b.value - a.value);
    
    for (const { action, value } of relevantActions.slice(0, 5)) {
      recommendations.push({
        action,
        confidence: value,
        reason: `Historical success rate: ${(value * 100).toFixed(1)}%`
      });
    }
    
    // Add skill-based recommendations
    for (const [skill, data] of this.skillRatings) {
      if (data.rating > 0.7 && data.experience > 10) {
        recommendations.push({
          action: `use_${skill}`,
          confidence: data.rating,
          reason: `High proficiency in ${skill} (${data.experience} uses)`
        });
      }
    }
    
    return recommendations;
  }

  /**
   * Adapt behavior based on context
   */
  adapt(context) {
    const adaptation = {
      strategy: 'default',
      parameters: {},
      reasoning: ''
    };
    
    // Check past performance in similar contexts
    const similarExperiences = this.episodicMemory.filter(episode =>
      this.contextSimilarity(episode.context, context) > 0.7
    );
    
    if (similarExperiences.length > 0) {
      const successRate = similarExperiences.filter(e => e.type === 'success').length / similarExperiences.length;
      
      if (successRate > 0.8) {
        adaptation.strategy = 'continue';
        adaptation.reasoning = 'High success rate in similar contexts';
      } else if (successRate < 0.3) {
        adaptation.strategy = 'pivot';
        adaptation.reasoning = 'Low success rate, trying alternative approach';
        adaptation.parameters.explorationBoost = 0.3;
      } else {
        adaptation.strategy = 'refine';
        adaptation.reasoning = 'Moderate success, fine-tuning approach';
      }
    }
    
    // Adjust exploration rate based on context familiarity
    if (similarExperiences.length < 5) {
      adaptation.parameters.explorationRate = this.explorationRate * 2;
      adaptation.reasoning = 'Unfamiliar context, increasing exploration';
    }
    
    return adaptation;
  }

  /**
   * Transfer learning from one domain to another
   */
  transferLearning(sourceDomain, targetDomain) {
    const transferableKnowledge = [];
    
    // Find patterns that can be transferred
    for (const [key, value] of this.qTable) {
      if (key.includes(sourceDomain)) {
        const targetKey = key.replace(sourceDomain, targetDomain);
        // Transfer with reduced confidence
        this.qTable.set(targetKey, value * 0.7);
        transferableKnowledge.push({ from: key, to: targetKey, value: value * 0.7 });
      }
    }
    
    // Transfer skill ratings
    const sourceSkill = this.skillRatings.get(sourceDomain);
    if (sourceSkill) {
      this.skillRatings.set(targetDomain, {
        ...sourceSkill,
        rating: sourceSkill.rating * 0.7, // Reduced confidence
        experience: 0
      });
    }
    
    this.emit('knowledge_transferred', {
      sourceDomain,
      targetDomain,
      transferredItems: transferableKnowledge.length
    });
    
    return transferableKnowledge;
  }

  // Helper methods

  getStateActionKey(context, action) {
    const contextKey = this.getContextKey(context);
    const actionKey = action.name || action.type || JSON.stringify(action);
    return `${contextKey}_${actionKey}`;
  }

  getContextKey(context) {
    if (typeof context === 'string') return context;
    return JSON.stringify(context).slice(0, 50);
  }

  getMaxQValue(context) {
    let maxValue = 0;
    const prefix = this.getContextKey(context);
    
    for (const [key, value] of this.qTable) {
      if (key.startsWith(prefix) && value > maxValue) {
        maxValue = value;
      }
    }
    
    return maxValue;
  }

  calculateReward(outcome) {
    if (outcome.success) return 1;
    if (outcome.partial) return 0.5;
    if (outcome.failure) return -0.5;
    return 0;
  }

  updateQValues(experience) {
    const { context, action, reward, nextContext } = experience;
    const key = this.getStateActionKey(context, action);
    
    const currentQ = this.qTable.get(key) || 0;
    const maxNextQ = this.getMaxQValue(nextContext || context);
    
    const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);
    this.qTable.set(key, newQ);
  }

  improveSkill(skillName, amount) {
    const skill = this.skillRatings.get(skillName);
    if (skill) {
      skill.rating = Math.max(0, Math.min(1, skill.rating + amount * this.learningRate));
      skill.experience++;
      skill.lastUsed = new Date().toISOString();
      skill.improvementHistory.push({
        amount,
        newRating: skill.rating,
        timestamp: new Date().toISOString()
      });
    }
  }

  addToExperienceBuffer(experience) {
    this.experienceBuffer.push({
      ...experience,
      timestamp: new Date().toISOString()
    });
    
    if (this.experienceBuffer.length > this.maxBufferSize) {
      this.experienceBuffer.shift();
    }
  }

  addToShortTermMemory(experience) {
    this.shortTermMemory.push({
      ...experience,
      timestamp: new Date().toISOString()
    });
    
    if (this.shortTermMemory.length > this.config.maxMemorySize) {
      this.shortTermMemory.shift();
    }
  }

  consolidateMemories() {
    // Move important short-term memories to long-term
    const significantMemories = this.shortTermMemory.filter(memory =>
      memory.reward > 0.5 || memory.type === 'success' || memory.type === 'failure'
    );
    
    for (const memory of significantMemories) {
      const key = `consolidated_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      this.longTermMemory.set(key, memory);
    }
    
    // Clear short-term memory
    this.shortTermMemory = [];
    
    this.emit('memories_consolidated', {
      consolidatedCount: significantMemories.length
    });
  }

  addToKnowledgeBase(action, outcome) {
    const key = `knowledge_${action.type || 'general'}`;
    const existing = this.knowledgeBase.get(key) || [];
    existing.push({
      action,
      outcome,
      learned: new Date().toISOString()
    });
    this.knowledgeBase.set(key, existing);
  }

  updateSemanticMemory(action, context, outcome) {
    const key = `pattern_${action.type || 'general'}`;
    const patterns = this.semanticMemory.get(key) || [];
    
    patterns.push({
      contextFeatures: this.extractFeatures(context),
      outcome: outcome.success ? 'success' : 'failure',
      timestamp: new Date().toISOString()
    });
    
    this.semanticMemory.set(key, patterns);
  }

  extractFeatures(context) {
    const features = [];
    
    if (typeof context === 'object') {
      for (const [key, value] of Object.entries(context)) {
        if (typeof value === 'string' || typeof value === 'number') {
          features.push({ key, value });
        }
      }
    }
    
    return features;
  }

  findSimilarExperiences(context, action) {
    return this.episodicMemory.filter(episode => {
      const contextMatch = this.contextSimilarity(episode.context, context) > 0.5;
      const actionMatch = !action || episode.action?.type === action.type;
      return contextMatch && actionMatch;
    });
  }

  contextSimilarity(context1, context2) {
    if (!context1 || !context2) return 0;
    
    const str1 = JSON.stringify(context1).toLowerCase();
    const str2 = JSON.stringify(context2).toLowerCase();
    
    // Simple Jaccard similarity
    const words1 = new Set(str1.split(/\W+/));
    const words2 = new Set(str2.split(/\W+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  matchesQuery(item, query) {
    const itemStr = JSON.stringify(item).toLowerCase();
    return itemStr.includes(query.toLowerCase());
  }

  updateSuccessRate() {
    this.successRate = this.totalTasks > 0 ? this.successfulTasks / this.totalTasks : 0;
    this.performanceHistory.push({
      successRate: this.successRate,
      totalTasks: this.totalTasks,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Export learned knowledge
   */
  exportKnowledge() {
    return {
      qTable: Object.fromEntries(this.qTable),
      skills: Object.fromEntries(this.skillRatings),
      knowledgeBase: Object.fromEntries(this.knowledgeBase),
      semanticMemory: Object.fromEntries(this.semanticMemory),
      performance: {
        successRate: this.successRate,
        totalTasks: this.totalTasks,
        successfulTasks: this.successfulTasks
      },
      config: {
        learningRate: this.learningRate,
        explorationRate: this.explorationRate
      }
    };
  }

  /**
   * Import learned knowledge
   */
  importKnowledge(knowledge) {
    if (knowledge.qTable) {
      for (const [key, value] of Object.entries(knowledge.qTable)) {
        this.qTable.set(key, value);
      }
    }
    
    if (knowledge.skills) {
      for (const [key, value] of Object.entries(knowledge.skills)) {
        this.skillRatings.set(key, value);
      }
    }
    
    if (knowledge.knowledgeBase) {
      for (const [key, value] of Object.entries(knowledge.knowledgeBase)) {
        this.knowledgeBase.set(key, value);
      }
    }
    
    this.emit('knowledge_imported', {
      qTableSize: this.qTable.size,
      skillsCount: this.skillRatings.size
    });
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      name: this.name,
      version: this.version,
      learning: {
        enabled: this.config.learningEnabled,
        rate: this.learningRate,
        explorationRate: this.explorationRate
      },
      memory: {
        shortTerm: this.shortTermMemory.length,
        longTerm: this.longTermMemory.size,
        episodic: this.episodicMemory.length,
        semantic: this.semanticMemory.size
      },
      skills: Object.fromEntries(this.skillRatings),
      performance: {
        successRate: this.successRate,
        totalTasks: this.totalTasks,
        successfulTasks: this.successfulTasks
      },
      qTableSize: this.qTable.size
    };
  }
}

export default LearningAgent;