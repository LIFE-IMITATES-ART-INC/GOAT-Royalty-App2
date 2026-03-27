/**
 * GOAT Brain API Endpoint
 * 
 * Main API endpoint for the conversational AI execution engine.
 * Handles natural language queries and routes them to the appropriate agents.
 */

import { getAgentManager } from '../../lib/agents';
import { getLLMRouter } from '../../lib/llm/LLMRouter';

// Initialize agent manager and LLM router
let agentManager = null;
let llmRouter = null;

function initializeSystems() {
  if (!agentManager) {
    agentManager = getAgentManager({
      orchestrator: {
        maxConcurrentTasks: 5,
        approvalThreshold: 0.8
      }
    });
  }
  
  if (!llmRouter) {
    llmRouter = getLLMRouter({
      nvidiaApiKey: process.env.NVIDIA_API_KEY,
      enableSuperLLM: true
    });
    
    // Set LLM provider for agents
    agentManager.setLLMProvider(llmRouter);
  }
}

export default async function handler(req, res) {
  // Initialize on first request
  initializeSystems();
  
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    // Return system status
    return res.status(200).json({
      success: true,
      name: 'GOAT Brain API',
      version: '2.0.0',
      status: 'online',
      agents: agentManager.getStatus(),
      llm: llmRouter.getStatus()
    });
  }
  
  if (req.method === 'POST') {
    try {
      const { message, context = {}, action } = req.body;
      
      if (!message && !action) {
        return res.status(400).json({
          success: false,
          error: 'Message or action required'
        });
      }
      
      let response;
      
      // Handle different action types
      if (action === 'status') {
        response = {
          success: true,
          status: agentManager.getStatus()
        };
      } else if (action === 'capabilities') {
        response = {
          success: true,
          capabilities: agentManager.getCapabilities()
        };
      } else if (action === 'models') {
        response = {
          success: true,
          models: llmRouter.getAvailableModels()
        };
      } else if (action === 'super-query') {
        // Use Super LLM ensemble
        response = await llmRouter.superQuery([
          { role: 'user', content: message }
        ], context);
      } else if (action === 'agent') {
        // Execute with specific agent
        const { agent } = req.body;
        response = await agentManager.executeWithAgent(agent, message, context);
      } else {
        // Default: process through conversation interface
        response = await agentManager.chat(message, context);
      }
      
      return res.status(200).json(response);
      
    } catch (error) {
      console.error('GOAT Brain API Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  }
  
  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}