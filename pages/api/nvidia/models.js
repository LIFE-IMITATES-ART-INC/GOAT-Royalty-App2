/**
 * NVIDIA NIM - Available Models API
 * Returns list of available NVIDIA NIM models
 */

import nimClient from '../../../lib/nvidia-nim';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const models = nimClient.getAvailableModels();
    res.status(200).json({
      success: true,
      configured: nimClient.isConfigured(),
      models: models
    });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ 
      error: 'Failed to get available models',
      details: error.message 
    });
  }
}