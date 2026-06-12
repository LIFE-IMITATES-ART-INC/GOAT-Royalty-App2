/**
 * AI Image Generation API
 */
import { createApiHandler, validateRequiredFields } from '../../lib/api-handler';
import { getOpenAIKey, callGemini } from '../../lib/ai-providers';

export default createApiHandler({
  methods: 'POST',
  handler: async (req, res) => {
    if (!validateRequiredFields(req, res, ['prompt'])) return;

    const { prompt, negativePrompt, style, aspectRatio, numImages = 1, quality, seed } = req.body;

    // Try OpenAI DALL-E
    const openaiKey = getOpenAIKey();
    if (openaiKey) {
      try {
        const size = aspectRatio === '16:9' ? '1792x1024' : aspectRatio === '9:16' ? '1024x1792' : '1024x1024';
        const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: `${prompt}${style ? `, ${style} style` : ''}${negativePrompt ? `. Avoid: ${negativePrompt}` : ''}`,
            n: 1, size, quality: quality === 'high' ? 'hd' : 'standard'
          })
        });
        if (openaiRes.ok) {
          const data = await openaiRes.json();
          const images = data.data.map((img, i) => ({
            id: Date.now() + i, url: img.url, prompt, style, timestamp: new Date().toISOString()
          }));
          return res.status(200).json({ images, provider: 'openai' });
        }
      } catch (error) {
        console.error('OpenAI image generation error:', error.message);
      }
    }

    // Try Gemini for image description
    const geminiResult = await callGemini({
      prompt: `Create a detailed visual description for an image: ${prompt}. Style: ${style || 'digital art'}. Describe colors, composition, lighting, and mood in vivid detail.`,
      temperature: 0.8,
      maxOutputTokens: 1024,
    });

    if (geminiResult) {
      return res.status(200).json({
        images: [{ id: Date.now(), url: `https://picsum.photos/seed/${seed || Date.now()}/1024/1024`, prompt, style, description: geminiResult.text, timestamp: new Date().toISOString() }],
        provider: 'gemini-description', description: geminiResult.text
      });
    }

    // Fallback with placeholder
    const images = Array(numImages).fill(null).map((_, i) => ({
      id: Date.now() + i,
      url: `https://picsum.photos/seed/${(seed || Date.now()) + i}/1024/1024`,
      prompt, style, timestamp: new Date().toISOString()
    }));
    return res.status(200).json({ images, provider: 'placeholder' });
  }
});
