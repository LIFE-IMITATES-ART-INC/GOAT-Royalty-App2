/**
 * Super GOAT AI Hub API Endpoint
 * Handles all requests to NVIDIA NIM models with multi-provider fallback
 */

import nvidiaClient from '../../lib/nvidiaNimClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, model, messages, options = {} } = req.body;

  try {
    switch (action) {
      case 'chat':
        return await handleChat(req, res);
      case 'stream':
        return await handleStream(req, res);
      case 'listModels':
        return await handleListModels(req, res);
      case 'getModelInfo':
        return await handleGetModelInfo(req, res);
      case 'embedding':
        return await handleEmbedding(req, res);
      case 'rerank':
        return await handleRerank(req, res);
      case 'generateCode':
        return await handleGenerateCode(req, res);
      case 'healthCheck':
        return await handleHealthCheck(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Super GOAT AI API Error:', error);
    return res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Handle chat completion requests
 */
async function handleChat(req, res) {
  const { model, messages, options = {} } = req.body;

  if (!model || !messages) {
    return res.status(400).json({ error: 'Model and messages are required' });
  }

  const response = await nvidiaClient.chat({
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens ?? 2048,
    topP: options.topP ?? 1,
    topK: options.topK ?? 1,
    frequencyPenalty: options.frequencyPenalty ?? 0,
    presencePenalty: options.presencePenalty ?? 0,
    stop: options.stop,
    stream: false,
    tools: options.tools,
    toolChoice: options.toolChoice,
    responseFormat: options.responseFormat,
    seed: options.seed,
    echo: options.echo
  });

  return res.json({
    success: true,
    data: response,
    provider: 'nvidia',
    model,
    latency: response._metadata?.latency
  });
}

/**
 * Handle streaming chat requests
 */
async function handleStream(req, res) {
  const { model, messages, options = {} } = req.body;

  if (!model || !messages) {
    return res.status(400).json({ error: 'Model and messages are required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    for await (const chunk of nvidiaClient.streamChat({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? 2048,
      topP: options.topP ?? 1,
      topK: options.topK ?? 1,
      frequencyPenalty: options.frequencyPenalty ?? 0,
      presencePenalty: options.presencePenalty ?? 0
    })) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}

/**
 * Handle list models requests
 */
async function handleListModels(req, res) {
  const { category, provider } = req.body;

  const models = nvidiaClient.listModels(category, provider);

  return res.json({
    success: true,
    data: models,
    count: models.length
  });
}

/**
 * Handle get model info requests
 */
async function handleGetModelInfo(req, res) {
  const { modelId } = req.body;

  if (!modelId) {
    return res.status(400).json({ error: 'Model ID is required' });
  }

  const modelInfo = nvidiaClient.getModelInfo(modelId);

  if (!modelInfo) {
    return res.status(404).json({ error: 'Model not found' });
  }

  return res.json({
    success: true,
    data: modelInfo
  });
}

/**
 * Handle embedding requests
 */
async function handleEmbedding(req, res) {
  const { model, input, options = {} } = req.body;

  if (!model || !input) {
    return res.status(400).json({ error: 'Model and input are required' });
  }

  const response = await nvidiaClient.embedding({
    model,
    input,
    inputType: options.inputType || 'query',
    truncate: options.truncate || 'END',
    encodingFormat: options.encodingFormat || 'float'
  });

  return res.json({
    success: true,
    data: response,
    latency: response._metadata?.latency
  });
}

/**
 * Handle rerank requests
 */
async function handleRerank(req, res) {
  const { model, query, documents, options = {} } = req.body;

  if (!model || !query || !documents) {
    return res.status(400).json({ error: 'Model, query, and documents are required' });
  }

  const response = await nvidiaClient.rerank({
    model,
    query,
    documents,
    topN: options.topN,
    rankFields: options.rankFields,
    truncate: options.truncate || 'END'
  });

  return res.json({
    success: true,
    data: response,
    latency: response._metadata?.latency
  });
}

/**
 * Handle code generation requests
 */
async function handleGenerateCode(req, res) {
  const { language, task, code, model = 'devstral-2-123b-instruct-2512', options = {} } = req.body;

  if (!language || !task) {
    return res.status(400).json({ error: 'Language and task are required' });
  }

  const response = await nvidiaClient.generateCode({
    language,
    task,
    code,
    model,
    temperature: options.temperature ?? 0.2,
    maxTokens: options.maxTokens ?? 4096
  });

  return res.json({
    success: true,
    data: response,
    latency: response._metadata?.latency
  });
}

/**
 * Handle health check requests
 */
async function handleHealthCheck(req, res) {
  const health = await nvidiaClient.healthCheck();

  return res.json({
    success: true,
    data: health
  });
}