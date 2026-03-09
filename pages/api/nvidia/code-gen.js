/**
 * NVIDIA NIM - Code Generation API
 * Uses Nemotron 3 Nano and GLM 4.7 for code generation
 */

import nimClient from '../../../lib/nvidia-nim';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { description, language, model } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    const selectedModel = model || 'nemotron';
    let result;

    if (selectedModel === 'glm') {
      result = await nimClient.multilingualCode(description, language || 'english');
    } else {
      result = await nimClient.generateCode(description, language || 'javascript');
    }

    res.status(200).json({
      success: true,
      model: selectedModel === 'glm' ? 'GLM 4.7' : 'Nemotron 3 Nano',
      code: result
    });
  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate code',
      details: error.message 
    });
  }
}