/**
 * NVIDIA NIM - Audio Recognition API
 * Super Shazam feature for music identification
 */

import nimClient from '../../../lib/nvidia-nim';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { audioData } = req.body;

  if (!audioData) {
    return res.status(400).json({ error: 'Audio data is required' });
  }

  try {
    const result = await nimClient.recognizeAudio(audioData);
    res.status(200).json({
      success: true,
      model: 'Nemotron Audio 2B',
      recognition: result
    });
  } catch (error) {
    console.error('Audio recognition error:', error);
    res.status(500).json({ 
      error: 'Failed to recognize audio',
      details: error.message 
    });
  }
}