/**
 * 🐐 SUPER GOAT AI - Index
 * Export all AI capabilities
 */

// NVIDIA Reasoning Engine
export { default as NVIDIAReasoningEngine } from './NVIDIAReasoningEngine';

// Advanced Reasoning Engine
export { default as AdvancedReasoningEngine } from './AdvancedReasoningEngine';

// Multi-Modal Processor
export { default as MultiModalProcessor } from './MultiModalProcessor';

// Self-Improving System
export { default as SelfImprovingSystem } from './SelfImprovingSystem';

// Local LLM Manager
export { default as LocalLLMManager } from './LocalLLMManager';

// AI Agents
export * from '../agents';

/**
 * AI Capabilities Summary:
 * 
 * NVIDIA Reasoning Engine:
 * - 25+ flagship reasoning models from build.nvidia.com
 * - DeepSeek R1 for advanced reasoning
 * - Llama 3.3 70B for general tasks
 * - Mistral Large for enterprise
 * - Vision models for image analysis
 * - Embedding models for retrieval
 * - Reward models for evaluation
 * 
 * Advanced Reasoning Engine:
 * - Chain-of-Thought reasoning
 * - Tree-of-Thought exploration
 * - Reflection pattern for iterative improvement
 * - Multi-agent debate for consensus building
 * - Multi-path reasoning (deductive, inductive, abductive)
 * - Analogical and causal reasoning
 * 
 * Multi-Modal Processor:
 * - Vision processing (images, documents)
 * - Video analysis (frame-by-frame)
 * - Audio transcription support
 * - Text processing with multiple models
 * - Embedding generation
 * - Multi-modal fusion
 * - Visual Question Answering
 * 
 * Self-Improving System:
 * - Code analysis and optimization
 * - Behavior learning from experience
 * - Performance tracking and optimization
 * - Strategy evolution
 * - Self-diagnosis and repair
 * - Safe modification with rollbacks
 * 
 * Agent Types:
 * - OrchestratorAgent: Hierarchical task delegation
 * - AutonomousAgent: Self-directed execution
 * - MultiAgentSystem: Collaborative problem solving
 * - LearningAgent: Self-improving capabilities
 * - UtilityBasedAgent: Optimal decision making
 * - GoalBasedAgent: Multi-step planning
 * - AIAgentManager: Unified management
 */

export const VERSION = '6.0.0';