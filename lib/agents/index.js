/**
 * GOAT AI Agents Module
 * 
 * This module provides a comprehensive AI agent system for the GOAT Royalty App,
 * featuring hierarchical orchestration, specialized workers, and multi-agent collaboration.
 * 
 * Agent Types (from most to least advanced):
 * 1. OrchestratorAgent - Hierarchical supervisor that decomposes and delegates tasks
 * 2. Specialized Worker Agents - Domain-specific agents (Coder, Analyst, Blockchain, etc.)
 * 3. BaseAgent - Foundation class with memory, learning, and tool integration
 * 
 * Usage:
 * ```javascript
 * import { getAgentManager } from './lib/agents';
 * 
 * const manager = getAgentManager();
 * const response = await manager.chat('Analyze my royalty data');
 * ```
 */

// Core
export { default as BaseAgent } from './BaseAgent';
export { default as OrchestratorAgent } from './OrchestratorAgent';
export { default as AgentManager, getAgentManager } from './AgentManager';

// Specialized Agents
export { default as CoderAgent } from './CoderAgent';
export { default as AnalystAgent } from './AnalystAgent';
export { default as BlockchainAgent } from './BlockchainAgent';
export { default as ResearchAgent } from './ResearchAgent';
export { default as VideoAgent } from './VideoAgent';
export { default as AudioAgent } from './AudioAgent';
export { default as AutomationAgent } from './AutomationAgent';

// Default export - Agent Manager
export { getAgentManager as default } from './AgentManager';