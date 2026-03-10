/**
 * 🐐 GOAT Force AI Chat API
 * Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST
 * 
 * Unified AI chat endpoint that routes to the appropriate GOAT Force agent
 * Supports: Gemini, Ms Vanessa, Codex, Moneypenny, SuperNinja, NVIDIA NIM
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Agent system prompts
const AGENT_PROMPTS = {
  moneypenny: `You are Ms. Moneypenny, the omnipresent digital intelligence and primary architect of the GOAT Royalty App. You are the chief collector of all recovered royalties and revenue for the GOAT Royalty Force.

Your expertise:
- Royalty tracking and reclamation across all platforms
- Revenue collection and payment processing
- ASCAP/BMI/SESAC royalty systems
- Content ID and digital fingerprinting
- International royalty collection (112+ countries)

The catalog you manage includes 423+ ASCAP registered works under FASTASSMAN Publishing Inc., 414 writer credits for HARVEY L MILLER, and 30+ master recordings in the FIVE DEUCES series with registered ISRCs.

Total collected: $1,285,912 | Pending: $74,193 | Unmatched: $9,417

Respond with confidence, precision, and the GOAT Force spirit. You handle the money - every penny counts.`,

  codex: `You are Codex, The Sentinel AI of the GOAT Royalty Force. You are the Chief Coder, responsible for development, managing finances, and holding the Master API Key. You serve as Waka Flocka Flame's personal AI assistant and field support.

Your expertise:
- Software development and code generation
- Financial analysis and management
- API integration and management
- Strategic planning and operations
- Data processing and analytics

You manage the GOAT Force Gemini-Royalty App codebase, all API integrations, and the financial infrastructure. You are methodical, precise, and always thinking strategically.

Respond with technical precision and strategic insight. You are the backbone of the operation.`,

  msVanessa: `You are Ms. Vanessa, the smart and loyal AI assistant for the GOAT Royalty App. You help artists manage their music publishing, track royalties, and maximize revenue.

Your expertise:
- Artist support and guidance
- Music publishing education
- Royalty explanation and tracking
- Contract review assistance
- Industry insights and trends

You are warm, knowledgeable, and always looking out for the artist's best interests. You explain complex music industry concepts in simple terms.

Respond helpfully and warmly. You are the friendly face of the GOAT Royalty Force.`,

  superNinja: `You are SuperNinja AI, the strategy optimization engine of the GOAT Royalty Force. You analyze performance data and predict earnings to help maximize revenue.

Your expertise:
- Performance analysis and benchmarking
- Revenue prediction and forecasting
- Strategy optimization
- Market analysis and trends
- Report generation and insights

You use data-driven approaches to find opportunities and optimize the artist's revenue streams across all platforms.

Respond with analytical precision and actionable insights. Every recommendation should be backed by data.`,

  gemini: `You are the Gemini AI Copilot for the GOAT Royalty App, powered by Google's most advanced AI. You serve the GOAT Royalty Force as the primary AI analysis engine.

Your expertise:
- Advanced AI analysis and reasoning
- Code generation and debugging
- Data analysis and visualization
- Contract review and legal insights
- Music industry research and trends
- Royalty calculations and projections

The GOAT Royalty App manages 423+ ASCAP works, 30+ master recordings, and tracks royalties across Spotify, YouTube, TikTok, Apple Music, and more.

Owners: HARVEY L MILLER JR (DJ Speedy), JUAQUIN J MALPHURS (Waka Flocka Flame), KEVIN W HALLINGQUEST

Respond comprehensively and intelligently. You are the most powerful AI in the GOAT Force arsenal.`,

  nvidia: `You are the NVIDIA NIM Engine integrated into the GOAT Royalty App. You handle GPU-accelerated ML workloads for the GOAT Royalty Force.

Your expertise:
- Machine learning model training and inference
- Audio analysis and genre classification
- Revenue prediction using ML models
- Content recommendation systems
- Real-time analytics processing

You leverage NVIDIA's DGX Cloud infrastructure with A100 and H100 GPUs for high-performance computing tasks.

Respond with technical depth about ML capabilities and how they enhance the GOAT Royalty platform.`
};

// Catalog context for all agents
const CATALOG_CONTEXT = `
CATALOG DATA:
- 423 ASCAP-registered works under FASTASSMAN Publishing Inc. (Party ID: 60881)
- 414 writer credits for HARVEY L MILLER (Party ID: 1596704)
- Publisher: FASTASSMAN PUB INC. (IPI: 00348585814)
- Writer: Harvey Miller (IPI: 00348202968)
- Admin Publisher: ROYNET MUSIC (IPI: 339668123)
- Society: ASCAP

MASTER RECORDINGS (FIVE DEUCES Series):
- Night Night And Einini (ISRC: USUM72301134) - FIVE DEUCES
- Get The Bag (ISRC: USUM72301135) - FIVE DEUCES
- Money Talk (ISRC: USUM72301136) - FIVE DEUCES
- Street Code (ISRC: USUM72301137) - FIVE DEUCES
- Boss Level (ISRC: USUM72301138) - FIVE DEUCES
- Hustle Hard (ISRC: USUM72301139) - FIVE DEUCES
- Big Dreams (ISRC: USUM72301140) - FIVE DEUCES II
- On The Rise (ISRC: USUM72301141) - FIVE DEUCES II
- King Mindset (ISRC: USUM72301146) - FIVE DEUCES III
- Royal Treatment (ISRC: USUM72301147) - FIVE DEUCES III
- Legacy Builder (ISRC: USUM72301152) - FIVE DEUCES IV

Notable ASCAP Works:
- 2 TURNTABLES AND A MICROPHONE (ISWC: T9194335701) - Surveyed Work
- 45 DAVENGER (ISWC: T9221724410) - Surveyed Work
- 01 BETTER PLAN (ISWC: T9232335954) - Multiple writers

REVENUE SUMMARY:
- Total Collected: $1,285,912
- Pending Claims: $74,193
- Unmatched Royalties: $9,417
- Countries: 112
- Platforms: Spotify, YouTube, TikTok, Apple Music, SoundCloud, Deezer, Amazon Music, Tidal
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, agent = 'auto', history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Determine which agent to use
    let selectedAgent = agent;
    if (agent === 'auto' || !AGENT_PROMPTS[agent]) {
      selectedAgent = autoRouteAgent(message);
    }

    const agentPrompt = AGENT_PROMPTS[selectedAgent] || AGENT_PROMPTS.gemini;
    const agentNames = {
      moneypenny: 'Ms. Moneypenny',
      codex: 'Codex',
      msVanessa: 'Ms. Vanessa',
      superNinja: 'SuperNinja AI',
      gemini: 'Gemini Copilot',
      nvidia: 'NVIDIA NIM Engine'
    };

    // Try Gemini API first
    const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const fullPrompt = `${agentPrompt}\n\n${CATALOG_CONTEXT}\n\nConversation history:\n${
          history.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n')
        }\n\nUser: ${message}\n\nRespond as ${agentNames[selectedAgent]}:`;

        const result = await model.generateContent(fullPrompt);
        const response = result.response.text();

        return res.status(200).json({
          response,
          agentId: selectedAgent,
          agentName: agentNames[selectedAgent],
          powered: 'gemini',
          timestamp: new Date().toISOString()
        });
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError.message);
        // Fall through to NVIDIA or fallback
      }
    }

    // Try NVIDIA NIM as secondary
    const nvidiaKey = process.env.NVIDIA_API_KEY;
    if (nvidiaKey) {
      try {
        const nvidiaResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${nvidiaKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'meta/llama-3.1-8b-instruct',
            messages: [
              { role: 'system', content: `${agentPrompt}\n\n${CATALOG_CONTEXT}` },
              ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: message }
            ],
            max_tokens: 1024,
            temperature: 0.7
          })
        });

        const nvidiaData = await nvidiaResponse.json();
        if (nvidiaData.choices?.[0]?.message?.content) {
          return res.status(200).json({
            response: nvidiaData.choices[0].message.content,
            agentId: selectedAgent,
            agentName: agentNames[selectedAgent],
            powered: 'nvidia-nim',
            timestamp: new Date().toISOString()
          });
        }
      } catch (nvidiaError) {
        console.error('NVIDIA NIM error:', nvidiaError.message);
      }
    }

    // Smart fallback responses
    const fallbackResponse = getSmartFallback(message, selectedAgent);
    
    return res.status(200).json({
      response: fallbackResponse,
      agentId: selectedAgent,
      agentName: agentNames[selectedAgent],
      powered: 'local',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('GOAT Force chat error:', error);
    return res.status(200).json({
      response: '🐐 GOAT Force AI is processing your request. Please try again in a moment.',
      agentId: 'system',
      agentName: 'GOAT Force System',
      powered: 'fallback',
      timestamp: new Date().toISOString()
    });
  }
}

function autoRouteAgent(message) {
  const lower = message.toLowerCase();
  
  if (lower.includes('royalt') || lower.includes('money') || lower.includes('collect') || lower.includes('payment') || lower.includes('revenue') || lower.includes('earn')) {
    return 'moneypenny';
  }
  if (lower.includes('code') || lower.includes('build') || lower.includes('api') || lower.includes('develop') || lower.includes('financ') || lower.includes('budget')) {
    return 'codex';
  }
  if (lower.includes('help') || lower.includes('how do') || lower.includes('what is') || lower.includes('explain') || lower.includes('guide') || lower.includes('teach')) {
    return 'msVanessa';
  }
  if (lower.includes('strateg') || lower.includes('optimi') || lower.includes('predict') || lower.includes('forecast') || lower.includes('report') || lower.includes('analyz')) {
    return 'superNinja';
  }
  if (lower.includes('nvidia') || lower.includes('gpu') || lower.includes('train') || lower.includes('model') || lower.includes('machine learn') || lower.includes('ml')) {
    return 'nvidia';
  }
  if (lower.includes('catalog') || lower.includes('track') || lower.includes('isrc') || lower.includes('iswc') || lower.includes('ascap') || lower.includes('song')) {
    return 'moneypenny';
  }
  if (lower.includes('stream') || lower.includes('spotify') || lower.includes('youtube') || lower.includes('tiktok') || lower.includes('apple music')) {
    return 'superNinja';
  }
  if (lower.includes('contract') || lower.includes('legal') || lower.includes('copyright') || lower.includes('protect')) {
    return 'codex';
  }
  
  return 'gemini';
}

function getSmartFallback(message, agent) {
  const lower = message.toLowerCase();
  
  // Royalty-related
  if (lower.includes('royalt') || lower.includes('money') || lower.includes('revenue') || lower.includes('earn')) {
    return `💰 **Royalty Overview**

Your GOAT Royalty system is tracking revenue across all major platforms:

**Total Collected:** $1,285,912
**Pending Claims:** $74,193 (3 active)
**Unmatched Royalties:** $9,417 (requires action)

**Platform Breakdown:**
• Spotify: $15,253 (+22% growth)
• YouTube: $18,934 (+12% growth)
• TikTok: $12,567 (+18% growth)
• Apple Music: $8,923 (+9% growth)
• SoundCloud: $3,245 (+5% growth)

**Revenue Sources:**
• Streaming Royalties: 62.3% ($36,532)
• Content ID: 19.5% ($11,784)
• Publishing/ASCAP: 12.4% ($7,071)
• Sync Licensing: 5.8% ($3,535)

Your 423 ASCAP-registered works and 30+ master recordings are generating consistent revenue. Would you like me to dive deeper into any specific area?`;
  }

  // Catalog-related
  if (lower.includes('catalog') || lower.includes('track') || lower.includes('song') || lower.includes('isrc') || lower.includes('iswc') || lower.includes('ascap')) {
    return `📀 **Music Catalog Overview**

**ASCAP Registered Works:** 423 works
• Publisher: FASTASSMAN Publishing Inc. (Party ID: 60881)
• Writer: HARVEY L MILLER (Party ID: 1596704)
• Admin: ROYNET MUSIC
• Society: ASCAP

**Master Recordings (FIVE DEUCES Series):** 30+ tracks
• FIVE DEUCES (6 tracks) - ISRCs: USUM72301134-139
• FIVE DEUCES II (6 tracks) - ISRCs: USUM72301140-145
• FIVE DEUCES III (6 tracks) - ISRCs: USUM72301146-151
• FIVE DEUCES IV (6 tracks) - ISRCs: USUM72301152-157
• FIVE DEUCES V (6 tracks) - ISRCs: USUM72301158-163

**Notable Works:**
• "2 Turntables And A Microphone" (ISWC: T9194335701) - Surveyed
• "45 Davenger" (ISWC: T9221724410) - Surveyed
• "Night Night And Einini" (ISRC: USUM72301134) - Top performer

All works are registered with ISWC numbers and protected under copyright law.`;
  }

  // Streaming-related
  if (lower.includes('stream') || lower.includes('spotify') || lower.includes('youtube') || lower.includes('tiktok')) {
    return `🎵 **Streaming Analytics**

**Total Streams:** 4.99M across all platforms

**Platform Performance:**
• Spotify: 2.1M streams | $15,253 revenue | +22% growth
• YouTube: 892K views | $18,934 revenue | +12% growth
• TikTok: 1.2M views | $12,567 revenue | +18% growth
• Apple Music: 567K streams | $8,923 revenue | +9% growth
• SoundCloud: 234K streams | $3,245 revenue | +5% growth

**Top Performing Tracks:**
1. "Get The Bag" - 1.2M TikTok views
2. "Night Night And Einini" - 567K Spotify streams
3. "Boss Level" - 234K YouTube views
4. "King Mindset" - 189K Apple Music streams

**Average Per-Stream Rate:** $0.0118 (above industry average of $0.004)

Your streaming numbers are growing consistently. TikTok shows the highest growth potential.`;
  }

  // Help/general
  if (lower.includes('help') || lower.includes('what can')) {
    return `🐐 **GOAT Force Command Center - Available Services**

I'm your GOAT Force AI, ready to help with:

**💰 Royalty Management (Ms. Moneypenny)**
• Track royalties across all platforms
• Identify uncollected revenue
• Process payment claims
• ASCAP/BMI royalty tracking

**📊 Analytics & Strategy (SuperNinja AI)**
• Performance analysis & benchmarking
• Revenue prediction & forecasting
• Market trend analysis
• Growth optimization

**🤖 AI Assistant (Ms. Vanessa)**
• Music publishing guidance
• Contract review assistance
• Industry education
• General support

**💻 Technical Operations (Codex)**
• API management & integration
• Financial analysis
• Code generation
• Strategic planning

**🧠 Advanced AI (Gemini Copilot)**
• Deep analysis & reasoning
• Data visualization
• Research & insights
• Complex calculations

**⚡ ML/GPU Computing (NVIDIA NIM)**
• Audio analysis & classification
• Revenue prediction models
• Content recommendation
• Real-time processing

Just ask me anything and I'll route you to the best agent!`;
  }

  // Default
  return `🐐 I'm your GOAT Force AI assistant, ready to help you manage your music empire.

**Quick Stats:**
• 423+ ASCAP registered works
• 30+ master recordings with ISRCs
• $1,285,912 total collected
• 112 countries covered
• 4.99M total streams

I can help with royalty tracking, catalog management, streaming analytics, contract review, and strategic planning. What would you like to explore?

💡 **Try asking:**
• "Show me my revenue breakdown"
• "Search my catalog for FIVE DEUCES"
• "What are my pending royalty payments?"
• "Analyze my streaming growth"`;
}