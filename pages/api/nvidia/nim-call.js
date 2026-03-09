/**
 * NVIDIA NIM Model API Endpoint
 * Proxy for calling NVIDIA NIM models
 */

import nimClient from '../../../lib/nvidia-nim';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { model, prompt, options } = req.body;

  if (!model || !prompt) {
    return res.status(400).json({ error: 'Model and prompt are required' });
  }

  try {
    const result = await nimClient.callModel(model, prompt, options || {});
    res.status(200).json(result);
  } catch (error) {
    console.error('NIM call error:', error);
    res.status(500).json({ 
      error: 'Failed to call NIM model',
      details: error.message 
    });
  }
}