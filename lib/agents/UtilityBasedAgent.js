/**
 * 🐐 SUPER GOAT UTILITY-BASED AGENT
 * Optimal decision-making through utility function maximization
 * Selects actions that maximize expected utility
 */

import { EventEmitter } from 'events';

class UtilityBasedAgent extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.name = 'GOAT Utility-Based Agent';
    this.version = '5.0.0';
    
    // Utility functions
    this.utilityFunctions = new Map();
    this.actionEffects = new Map();
    
    // Decision cache
    this.decisionCache = new Map();
    this.cacheExpiry = config.cacheExpiry || 300000; // 5 minutes
    
    // Optimization parameters
    this.riskTolerance = config.riskTolerance || 0.5; // 0 = risk-averse, 1 = risk-seeking
    this.timePreference = config.timePreference || 0.9; // Discount factor for future utility
    this.certaintyEquivalent = config.certaintyEquivalent || 0.8;
    
    // Performance tracking
    this.decisionHistory = [];
    this.utilityRealized = 0;
    this.utilityExpected = 0;
    
    // Configuration
    this.config = {
      maxHistorySize: config.maxHistorySize || 1000,
      optimizationMethod: config.optimizationMethod || 'expected-utility',
      multiObjectiveWeights: config.multiObjectiveWeights || {
        profit: 0.3,
        time: 0.2,
        quality: 0.25,
        risk: 0.15,
        satisfaction: 0.1
      },
      ...config
    };
    
    // Initialize default utility functions
    this.initializeDefaultUtilities();
  }

  initializeDefaultUtilities() {
    // Royalty optimization utilities
    this.registerUtilityFunction('royalty_maximization', (state, action) => {
      const revenue = state.projectedRevenue || 0;
      const costs = state.projectedCosts || 0;
      const risk = state.risk || 0;
      return (revenue - costs) * (1 - risk * this.riskTolerance);
    });

    // Time efficiency utility
    this.registerUtilityFunction('time_efficiency', (state, action) => {
      const timeSaved = action.timeSaved || 0;
      const deadline = state.deadline ? new Date(state.deadline) - new Date() : Infinity;
      const urgency = deadline < 86400000 ? 2 : 1; // Double utility if deadline < 24h
      return timeSaved * urgency * this.timePreference;
    });

    // Quality optimization utility
    this.registerUtilityFunction('quality_optimization', (state, action) => {
      const qualityGain = action.qualityGain || 0;
      const effort = action.effort || 1;
      return qualityGain / Math.sqrt(effort); // Diminishing returns on effort
    });

    // Risk-adjusted utility
    this.registerUtilityFunction('risk_adjusted', (state, action) => {
      const expectedValue = action.expectedValue || 0;
      const variance = action.variance || 0;
      const riskFreeRate = 0.02; // 2% risk-free rate
      
      // Sharpe-like ratio
      const sharpe = variance > 0 ? (expectedValue - riskFreeRate) / Math.sqrt(variance) : expectedValue;
      return sharpe * (1 - this.riskTolerance);
    });

    // Customer satisfaction utility
    this.registerUtilityFunction('satisfaction', (state, action) => {
      const satisfactionGain = action.satisfactionGain || 0;
      const retentionImpact = action.retentionImpact || 0;
      return satisfactionGain * 0.6 + retentionImpact * 0.4;
    });

    // Blockchain verification utility
    this.registerUtilityFunction('blockchain_verification', (state, action) => {
      const trustScore = action.trustScore || 0;
      const verificationSpeed = action.verificationSpeed || 1;
      const cost = action.gasCost || 0;
      return (trustScore * 100) / (verificationSpeed * (1 + cost * 0.001));
    });

    // Content creation utility
    this.registerUtilityFunction('content_creation', (state, action) => {
      const reach = action.projectedReach || 0;
      const engagement = action.expectedEngagement || 0;
      const effort = action.effort || 1;
      return (reach * 0.3 + engagement * 0.7) / effort;
    });

    // Multi-objective utility
    this.registerUtilityFunction('multi_objective', (state, action) => {
      const weights = this.config.multiObjectiveWeights;
      let totalUtility = 0;
      
      for (const [objective, weight] of Object.entries(weights)) {
        const objectiveUtility = this.calculateObjectiveUtility(objective, state, action);
        totalUtility += weight * objectiveUtility;
      }
      
      return totalUtility;
    });
  }

  /**
   * Register a new utility function
   */
  registerUtilityFunction(name, fn) {
    this.utilityFunctions.set(name, fn);
    this.emit('utility_function_registered', { name });
  }

  /**
   * Calculate utility of an action in a given state
   */
  calculateUtility(state, action, functionName = 'multi_objective') {
    const fn = this.utilityFunctions.get(functionName);
    if (!fn) {
      console.warn(`Utility function '${functionName}' not found, using multi_objective`);
      return this.utilityFunctions.get('multi_objective')(state, action);
    }
    
    return fn(state, action);
  }

  /**
   * Select the best action based on utility maximization
   */
  selectBestAction(state, actions, options = {}) {
    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = this.getCacheKey(state, actions);
    const cached = this.decisionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      this.emit('cache_hit', { state, actionCount: actions.length });
      return cached.result;
    }
    
    // Calculate utilities for all actions
    const actionUtilities = actions.map(action => {
      const expectedUtility = this.calculateExpectedUtility(state, action, options);
      const utilityVariance = this.calculateUtilityVariance(state, action, options);
      const riskAdjustedUtility = this.applyRiskAdjustment(expectedUtility, utilityVariance);
      
      return {
        action,
        expectedUtility,
        utilityVariance,
        riskAdjustedUtility,
        confidence: this.calculateConfidence(action, state)
      };
    });
    
    // Sort by risk-adjusted utility
    actionUtilities.sort((a, b) => b.riskAdjustedUtility - a.riskAdjustedUtility);
    
    // Select best action based on optimization method
    let selectedAction;
    switch (this.config.optimizationMethod) {
      case 'maximin':
        selectedAction = this.maximinSelection(actionUtilities);
        break;
      case 'maximax':
        selectedAction = this.maximaxSelection(actionUtilities);
        break;
      case 'satisficing':
        selectedAction = this.satisficingSelection(actionUtilities, options.threshold || 0.5);
        break;
      case 'expected-utility':
      default:
        selectedAction = actionUtilities[0];
    }
    
    // Cache the result
    this.decisionCache.set(cacheKey, {
      result: selectedAction,
      timestamp: Date.now()
    });
    
    // Record decision
    this.recordDecision(state, selectedAction, actionUtilities);
    
    const decisionTime = Date.now() - startTime;
    this.emit('action_selected', {
      action: selectedAction.action,
      utility: selectedAction.riskAdjustedUtility,
      decisionTime,
      alternatives: actionUtilities.length - 1
    });
    
    return selectedAction;
  }

  /**
   * Calculate expected utility with probabilities
   */
  calculateExpectedUtility(state, action, options = {}) {
    const outcomes = action.possibleOutcomes || [{ probability: 1, state: {} }];
    let expectedUtility = 0;
    
    for (const outcome of outcomes) {
      const outcomeState = { ...state, ...outcome.state };
      const utility = this.calculateUtility(outcomeState, action, options.utilityFunction);
      expectedUtility += outcome.probability * utility;
    }
    
    return expectedUtility;
  }

  /**
   * Calculate utility variance for risk assessment
   */
  calculateUtilityVariance(state, action, options = {}) {
    const outcomes = action.possibleOutcomes || [{ probability: 1, state: {} }];
    
    if (outcomes.length === 1) return 0;
    
    // Calculate expected utility
    const expectedUtility = this.calculateExpectedUtility(state, action, options);
    
    // Calculate variance
    let variance = 0;
    for (const outcome of outcomes) {
      const outcomeState = { ...state, ...outcome.state };
      const utility = this.calculateUtility(outcomeState, action, options.utilityFunction);
      variance += outcome.probability * Math.pow(utility - expectedUtility, 2);
    }
    
    return variance;
  }

  /**
   * Apply risk adjustment to utility
   */
  applyRiskAdjustment(expectedUtility, variance) {
    // Certainty equivalent: CE = E[U] - 0.5 * A * Var[U]
    // where A is the Arrow-Pratt coefficient of absolute risk aversion
    const riskAversion = 1 - this.riskTolerance;
    const riskPenalty = 0.5 * riskAversion * variance;
    
    return expectedUtility - riskPenalty;
  }

  /**
   * Calculate confidence in utility estimate
   */
  calculateConfidence(action, state) {
    const factors = [];
    
    // Historical accuracy
    const historicalAccuracy = this.getHistoricalAccuracy(action.type);
    factors.push(historicalAccuracy);
    
    // Information completeness
    const infoCompleteness = this.assessInformationCompleteness(state, action);
    factors.push(infoCompleteness);
    
    // Outcome predictability
    const predictability = this.assessPredictability(action);
    factors.push(predictability);
    
    return factors.reduce((a, b) => a + b, 0) / factors.length;
  }

  /**
   * Maximin selection (pessimistic - maximize minimum outcome)
   */
  maximinSelection(actionUtilities) {
    let bestAction = actionUtilities[0];
    let bestMinUtility = Infinity;
    
    for (const au of actionUtilities) {
      const minUtility = au.action.possibleOutcomes
        ? Math.min(...au.action.possibleOutcomes.map(o => 
            this.calculateUtility({}, au.action) * (o.probability || 1)))
        : au.expectedUtility;
      
      if (minUtility > bestMinUtility) {
        bestMinUtility = minUtility;
        bestAction = au;
      }
    }
    
    return bestAction;
  }

  /**
   * Maximax selection (optimistic - maximize maximum outcome)
   */
  maximaxSelection(actionUtilities) {
    let bestAction = actionUtilities[0];
    let bestMaxUtility = -Infinity;
    
    for (const au of actionUtilities) {
      const maxUtility = au.action.possibleOutcomes
        ? Math.max(...au.action.possibleOutcomes.map(o => 
            this.calculateUtility({}, au.action) * (o.probability || 1)))
        : au.expectedUtility;
      
      if (maxUtility > bestMaxUtility) {
        bestMaxUtility = maxUtility;
        bestAction = au;
      }
    }
    
    return bestAction;
  }

  /**
   * Satisficing selection (meet minimum threshold)
   */
  satisficingSelection(actionUtilities, threshold) {
    // Find first action that meets threshold
    for (const au of actionUtilities) {
      if (au.riskAdjustedUtility >= threshold) {
        return au;
      }
    }
    
    // If none meet threshold, return best
    return actionUtilities[0];
  }

  /**
   * Optimize resource allocation across multiple actions
   */
  optimizeResourceAllocation(state, resources, actions, constraints = {}) {
    const allocation = {
      actions: [],
      totalUtility: 0,
      resourceUsage: {},
      efficiency: 0
    };
    
    // Sort actions by utility per resource
    const sortedActions = actions.map(action => {
      const utility = this.calculateExpectedUtility(state, action);
      const resourceCost = this.calculateResourceCost(action, resources);
      return {
        action,
        utility,
        resourceCost,
        utilityPerResource: utility / (resourceCost || 1)
      };
    }).sort((a, b) => b.utilityPerResource - a.utilityPerResource);
    
    // Greedy allocation
    let remainingResources = { ...resources };
    
    for (const item of sortedActions) {
      if (this.canAllocate(item.action, remainingResources, constraints)) {
        allocation.actions.push(item);
        allocation.totalUtility += item.utility;
        
        // Deduct resources
        for (const [resource, amount] of Object.entries(item.action.resourceRequirements || {})) {
          remainingResources[resource] = (remainingResources[resource] || 0) - amount;
          allocation.resourceUsage[resource] = (allocation.resourceUsage[resource] || 0) + amount;
        }
      }
    }
    
    // Calculate efficiency
    const totalAvailable = Object.values(resources).reduce((a, b) => a + b, 0);
    const totalUsed = Object.values(allocation.resourceUsage).reduce((a, b) => a + b, 0);
    allocation.efficiency = totalUsed / totalAvailable;
    
    return allocation;
  }

  /**
   * Perform sensitivity analysis on utility calculations
   */
  sensitivityAnalysis(state, action, parameters = {}) {
    const results = {
      baseUtility: 0,
      sensitivities: {},
      criticalParameters: []
    };
    
    // Calculate base utility
    results.baseUtility = this.calculateExpectedUtility(state, action);
    
    // Vary each parameter
    for (const [param, range] of Object.entries(parameters)) {
      const variations = [];
      
      for (let delta = -range; delta <= range; delta += range / 5) {
        const modifiedState = { ...state, [param]: (state[param] || 0) + delta };
        const utility = this.calculateExpectedUtility(modifiedState, action);
        variations.push({ delta, utility });
      }
      
      // Calculate sensitivity coefficient
      const utilityRange = Math.max(...variations.map(v => v.utility)) - 
                          Math.min(...variations.map(v => v.utility));
      
      results.sensitivities[param] = {
        utilityRange,
        variations,
        sensitivity: utilityRange / results.baseUtility
      };
      
      // Identify critical parameters
      if (results.sensitivities[param].sensitivity > 0.2) {
        results.criticalParameters.push(param);
      }
    }
    
    return results;
  }

  /**
   * Generate optimal policy for a sequence of decisions
   */
  generateOptimalPolicy(states, availableActions, horizon = 10) {
    const policy = [];
    let currentState = states;
    
    for (let t = 0; t < horizon; t++) {
      const bestAction = this.selectBestAction(currentState, availableActions);
      
      policy.push({
        step: t,
        state: currentState,
        action: bestAction.action,
        expectedUtility: bestAction.riskAdjustedUtility,
        confidence: bestAction.confidence
      });
      
      // Update state based on action
      currentState = this.simulateStateTransition(currentState, bestAction.action);
    }
    
    return policy;
  }

  // Helper methods

  calculateObjectiveUtility(objective, state, action) {
    switch (objective) {
      case 'profit':
        return (state.projectedRevenue || 0) - (state.projectedCosts || 0);
      case 'time':
        return -(action.timeRequired || 0); // Negative because less time is better
      case 'quality':
        return action.qualityScore || 0.5;
      case 'risk':
        return 1 - (action.riskLevel || 0.5); // Inverse risk
      case 'satisfaction':
        return action.satisfactionScore || 0.5;
      default:
        return 0;
    }
  }

  getCacheKey(state, actions) {
    const stateKey = JSON.stringify(state).slice(0, 100);
    const actionsKey = actions.map(a => a.type || a.name).join(',');
    return `${stateKey}_${actionsKey}`;
  }

  recordDecision(state, selectedAction, allUtilities) {
    this.decisionHistory.push({
      timestamp: new Date().toISOString(),
      state: { ...state },
      selectedAction: selectedAction.action,
      utility: selectedAction.riskAdjustedUtility,
      confidence: selectedAction.confidence,
      alternatives: allUtilities.slice(1, 5).map(au => ({
        action: au.action.type || au.action.name,
        utility: au.riskAdjustedUtility
      }))
    });
    
    // Limit history size
    if (this.decisionHistory.length > this.config.maxHistorySize) {
      this.decisionHistory.shift();
    }
    
    // Track utility
    this.utilityExpected += selectedAction.riskAdjustedUtility;
  }

  updateActualUtility(decisionId, actualUtility) {
    const decision = this.decisionHistory.find(d => d.id === decisionId);
    if (decision) {
      decision.actualUtility = actualUtility;
      this.utilityRealized += actualUtility;
    }
  }

  getHistoricalAccuracy(actionType) {
    const relevant = this.decisionHistory.filter(d => 
      d.selectedAction?.type === actionType && d.actualUtility !== undefined
    );
    
    if (relevant.length === 0) return 0.5;
    
    const errors = relevant.map(d => 
      Math.abs(d.actualUtility - d.utility) / Math.abs(d.utility || 1)
    );
    
    return 1 - (errors.reduce((a, b) => a + b, 0) / errors.length);
  }

  assessInformationCompleteness(state, action) {
    const requiredFields = ['projectedRevenue', 'projectedCosts', 'riskLevel', 'timeRequired'];
    const presentFields = requiredFields.filter(f => 
      state[f] !== undefined || action[f] !== undefined
    );
    
    return presentFields.length / requiredFields.length;
  }

  assessPredictability(action) {
    if (!action.possibleOutcomes) return 0.5;
    
    // Entropy-based predictability
    const probabilities = action.possibleOutcomes.map(o => o.probability || 0);
    const entropy = -probabilities.reduce((sum, p) => 
      sum + (p > 0 ? p * Math.log2(p) : 0), 0
    );
    
    const maxEntropy = Math.log2(action.possibleOutcomes.length);
    return 1 - (entropy / maxEntropy);
  }

  calculateResourceCost(action, resources) {
    const requirements = action.resourceRequirements || {};
    return Object.entries(requirements).reduce((sum, [resource, amount]) => {
      const scarcity = resources[resource] ? 1 / resources[resource] : 1;
      return sum + amount * scarcity;
    }, 0);
  }

  canAllocate(action, remainingResources, constraints) {
    const requirements = action.resourceRequirements || {};
    
    for (const [resource, amount] of Object.entries(requirements)) {
      if ((remainingResources[resource] || 0) < amount) {
        return false;
      }
      
      // Check constraints
      if (constraints.maxPerResource?.[resource] && amount > constraints.maxPerResource[resource]) {
        return false;
      }
    }
    
    return true;
  }

  simulateStateTransition(state, action) {
    // Simple state transition simulation
    return {
      ...state,
      step: (state.step || 0) + 1,
      lastAction: action.type,
      resources: {
        ...state.resources,
        ...(action.resourceRequirements || {})
      }
    };
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      name: this.name,
      version: this.version,
      utilityFunctions: Array.from(this.utilityFunctions.keys()),
      decisions: this.decisionHistory.length,
      expectedUtility: this.utilityExpected,
      realizedUtility: this.utilityRealized,
      accuracy: this.utilityExpected > 0 ? this.utilityRealized / this.utilityExpected : 0,
      cacheSize: this.decisionCache.size,
      riskTolerance: this.riskTolerance
    };
  }

  /**
   * Export utility model
   */
  exportModel() {
    return {
      utilityFunctions: Array.from(this.utilityFunctions.entries()).map(([name, fn]) => ({
        name,
        type: typeof fn
      })),
      config: this.config,
      decisionHistory: this.decisionHistory.slice(-100),
      performance: {
        expectedUtility: this.utilityExpected,
        realizedUtility: this.utilityRealized
      }
    };
  }
}

export default UtilityBasedAgent;