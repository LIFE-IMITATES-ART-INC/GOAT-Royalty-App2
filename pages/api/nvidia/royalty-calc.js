/**
 * NVIDIA NIM - Royalty Calculation API
 * Uses DeepSeek V3.2 for advanced royalty calculations
 */

import nimClient from '../../../lib/nvidia-nim';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { salesData, metadata } = req.body;

  if (!salesData) {
    return res.status(400).json({ error: 'Sales data is required' });
  }

  try {
    const result = await nimClient.calculateRoyalties(salesData, metadata);
    res.status(200).json({
      success: true,
      model: 'DeepSeek V3.2',
      calculation: result
    });
  } catch (error) {
    console.error('Royalty calculation error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate royalties',
      details: error.message 
    });
  }
}