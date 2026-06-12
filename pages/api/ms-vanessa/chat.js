/**
 * GOAT Royalty App - Ms Vanessa Chat API Endpoint
 * Proxy to the Ms Vanessa backend service
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call the Ms Vanessa backend service
    // The backend should be running on port 4000 based on your index.js file
    const response = await fetch('http://localhost:4000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Ms Vanessa service responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('Ms Vanessa API error:', error);
    
    const fallbackResponse = "I'm Ms Vanessa, your AI assistant. I'm currently having trouble connecting to my backend service. Please try again in a moment.";
    
    return res.status(503).json({
      error: 'Ms Vanessa backend service unavailable',
      message: error.message,
      reply: fallbackResponse
    });
  }
}