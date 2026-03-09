/**
 * NVIDIA NIM - RAG Query API
 * Uses Qwen 3.5 397B for advanced RAG
 */

import nimClient from '../../../lib/nvidia-nim';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, context } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const result = await nimClient.ragQuery(query, context || '');
    res.status(200).json({
      success: true,
      model: 'Qwen 3.5 397B',
      response: result
    });
  } catch (error) {
    console.error('RAG query error:', error);
    res.status(500).json({ 
      error: 'Failed to process RAG query',
      details: error.message 
    });
  }
}