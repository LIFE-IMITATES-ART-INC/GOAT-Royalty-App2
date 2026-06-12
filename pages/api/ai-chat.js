/**
 * Super GOAT AI Chat API
 * Supports multiple AI providers: Gemini, OpenAI, Claude
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, provider = 'gemini', model, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const systemPrompt = `You are the Super GOAT Royalty AI Assistant, an advanced AI built into the Super GOAT Royalty App — the ultimate music production and royalty management platform created by Harvey Miller (DJ Speedy).

You are an expert in:
- Music production, mixing, mastering, and beat making
- Music royalty calculations across all streaming platforms (Spotify, Apple Music, YouTube, Tidal, Amazon, Deezer)
- Music publishing, copyright law, and IP protection
- Music industry analytics and market trends
- Artist management and career strategy
- Browser automation and data collection
- Software development (Next.js, React, Node.js)

Platform Stats:
- 346 tracks in catalog
- 1.2B+ total streams
- $865,420+ estimated royalties
- Publishers: FASTASSMAN Publishing Inc (ASCAP), Harvey L Miller Writers
- Key collaborations: Beyoncé, Outkast, Jay-Z, Gucci Mane, Waka Flocka

Always be helpful, knowledgeable, and professional. Use emojis sparingly for emphasis. Provide actionable insights.

Context: ${context || 'General assistance'}`;

  try {
    // Try Gemini first
    if (provider === 'gemini') {
      const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
      if (geminiKey) {
        const geminiModel = model || 'gemini-2.0-flash';
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }] }
              ],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
              }
            })
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return res.status(200).json({ response: text, provider: 'gemini', model: geminiModel });
          }
        } else {
          console.warn(`Gemini API returned ${geminiRes.status}: ${geminiRes.statusText}`);
        }
      }
    }

    // Try OpenAI
    if (provider === 'openai') {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (openaiKey) {
        const openaiModel = model || 'gpt-4o';
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: openaiModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 2048
          })
        });

        if (openaiRes.ok) {
          const data = await openaiRes.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            return res.status(200).json({ response: text, provider: 'openai', model: openaiModel });
          }
        } else {
          console.warn(`OpenAI API returned ${openaiRes.status}: ${openaiRes.statusText}`);
        }
      }
    }

    // Try Claude
    if (provider === 'claude') {
      const claudeKey = process.env.ANTHROPIC_API_KEY;
      if (claudeKey) {
        const claudeModel = model || 'claude-3-sonnet-20240229';
        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: claudeModel,
            max_tokens: 2048,
            system: systemPrompt,
            messages: [{ role: 'user', content: message }]
          })
        });

        if (claudeRes.ok) {
          const data = await claudeRes.json();
          const text = data.content?.[0]?.text;
          if (text) {
            return res.status(200).json({ response: text, provider: 'claude', model: claudeModel });
          }
        } else {
          console.warn(`Claude API returned ${claudeRes.status}: ${claudeRes.statusText}`);
        }
      }
    }

    // Fallback: Smart local response
    return res.status(200).json({
      response: generateLocalResponse(message),
      provider: 'local',
      model: 'super-goat-v1'
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    return res.status(503).json({
      error: 'AI service temporarily unavailable',
      message: error.message,
      fallback: generateLocalResponse(message),
      provider: 'local',
      model: 'super-goat-v1'
    });
  }
}

function generateLocalResponse(message) {
  const lower = message.toLowerCase();
  
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return '🐐 Hey Harvey! Welcome to the Super GOAT Command Center. Your catalog is looking strong with 346 tracks and $865K+ in royalties. What would you like to work on today?';
  }
  if (lower.includes('royalt') || lower.includes('earning') || lower.includes('revenue') || lower.includes('money')) {
    return '💰 **Royalty Summary**\n\nTotal Estimated Royalties: **$865,420+**\n\n• Spotify: $291,000 (485M streams)\n• Apple Music: $218,400 (312M streams)\n• YouTube Music: $138,600 (198M streams)\n• Amazon Music: $89,600 (112M streams)\n• Tidal: $67,200 (56M streams)\n• Deezer: $29,600 (37M streams)\n\nMonthly growth: +12.4%\nPending payments: $23,450 (next payout Mar 1)\n\nWant me to generate a detailed royalty report or analyze specific platform performance?';
  }
  if (lower.includes('track') || lower.includes('song') || lower.includes('catalog') || lower.includes('music')) {
    return '🎵 **Catalog Overview**\n\n346 tracks across 2 publishers:\n• FASTASSMAN Publishing Inc: 189 tracks\n• Harvey L Miller Writers: 157 tracks\n\n**Top 5 Performers:**\n1. ROYALTY FLOW ft. Beyoncé — 52.1M streams ($31,260)\n2. BLUE GOAT ft. Waka Flocka — 45.2M streams ($27,120)\n3. CANT FUCK WITH ME — 38.7M streams ($23,220)\n4. NERD BITCH ft. Gucci Mane — 31.4M streams ($18,840)\n5. GOAT FORCE — 28.9M streams ($17,340)\n\nNeed me to run a full catalog audit or analyze specific tracks?';
  }
  if (lower.includes('deploy') || lower.includes('server') || lower.includes('build')) {
    return '🚀 **Deployment Status**\n\nServer: 93.127.214.171 (Ubuntu 24.04)\nApp: Next.js 14.2.33 on port 3002\nProcess Manager: PM2\n\nTo deploy latest changes:\n1. Push to GitHub (main branch)\n2. SSH into server\n3. Pull latest & rebuild\n4. Restart PM2\n\nWant me to prepare a deployment script?';
  }
  
  return `🐐 I understand you're asking about: "${message}"\n\nI can help with:\n• 💰 Royalty calculations & revenue analysis\n• 🎵 Track catalog management (346 tracks)\n• 📊 Streaming analytics across all platforms\n• 🤖 Browser automation & data collection\n• 💻 Code development & deployment\n• 🔒 IP protection & copyright management\n\nPlease be more specific and I'll provide detailed assistance!`;
}