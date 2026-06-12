/**
 * 🐐 SUPER GOAT AI AGENTS - Index
 * Export all AI agent types for easy importing
 */

// Core Agent Types
export { default as OrchestratorAgent } from './OrchestratorAgent';
export { default as AutonomousAgent } from './AutonomousAgent';
export { default as MultiAgentSystem } from './MultiAgentSystem';
export { default as LearningAgent } from './LearningAgent';
export { default as UtilityBasedAgent } from './UtilityBasedAgent';
export { default as GoalBasedAgent } from './GoalBasedAgent';

// Manager
import AIAgentManager from './AIAgentManager';
export { AIAgentManager };

// Factory for goat-brain.js API endpoint
export function getAgentManager(config = {}) {
  return new AIAgentManager(config);
}

/**
 * Agent Capabilities Summary:
 * 
 * 1. OrchestratorAgent - Hierarchical task delegation and coordination
 *    - Manages worker agents
 *    - Distributes tasks based on capabilities
 *    - Monitors progress and handles failures
 * 
 * 2. AutonomousAgent - Self-directed task execution
 *    - Plans and executes with minimal intervention
 *    - Self-monitoring and self-correction
 *    - Adaptive behavior based on outcomes
 * 
 * 3. MultiAgentSystem - Collaborative problem solving
 *    - Multiple specialized agents
 *    - Team-based execution
 *    - Consensus building
 *    - Competitive and cooperative modes
 * 
 * 4. LearningAgent - Self-improving capabilities
 *    - Reinforcement learning
 *    - Memory systems (short-term, long-term, episodic)
 *    - Skill improvement over time
 *    - Knowledge transfer
 * 
 * 5. UtilityBasedAgent - Optimal decision making
 *    - Utility function maximization
 *    - Risk-adjusted decisions
 *    - Multi-objective optimization
 *    - Resource allocation
 * 
 * 6. GoalBasedAgent - Multi-step planning
 *    - Goal decomposition
 *    - Hierarchical planning
 *    - BDI architecture (Beliefs, Desires, Intentions)
 *    - Automatic replanning
 * 
 * 7. AIAgentManager - Unified agent management
 *    - Task routing to appropriate agents
 *    - Multi-agent coordination
 *    - Result integration
 *    - Performance tracking
 */

// Version info
export const VERSION = '5.0.0';
export const AGENT_TYPES = [
  'orchestrator',
  'autonomous',
  'multiAgent',
  'learning',
  'utilityBased',
  'goalBased'
];

// Quick factory function
export function createAgent(type, config = {}) {
  switch (type) {
    case 'orchestrator':
      return new OrchestratorAgent(config);
    case 'autonomous':
      return new AutonomousAgent(config);
    case 'multiAgent':
      return new MultiAgentSystem(config);
    case 'learning':
      return new LearningAgent(config);
    case 'utilityBased':
      return new UtilityBasedAgent(config);
    case 'goalBased':
      return new GoalBasedAgent(config);
    case 'manager':
      return new AIAgentManager(config);
    default:
      throw new Error(`Unknown agent type: ${type}`);
  }
}