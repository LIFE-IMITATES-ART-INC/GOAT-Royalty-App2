/**
 * NVIDIA NIM - Video Analysis API
 * Uses Kimi K2.5 for video understanding
 */

import nimClient from '../../../lib/nvidia-nim';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoDescription, timestamp } = req.body;

  if (!videoDescription) {
    return res.status(400).json({ error: 'Video description is required' });
  }

  try {
    const result = await nimClient.analyzeVideo(videoDescription, timestamp || 0);
    res.status(200).json({
      success: true,
      model: 'Kimi K2.5',
      analysis: result
    });
  } catch (error) {
    console.error('Video analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze video',
      details: error.message 
    });
  }
}