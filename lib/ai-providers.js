/**
 * Shared AI Provider Utilities
 * Centralized interface for calling Gemini, OpenAI, and Claude APIs
 * Eliminates duplicated fetch logic across API routes.
 */

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Get the Gemini API key from environment variables.
 */
export function getGeminiKey() {
  return process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
}

/**
 * Get the OpenAI API key from environment variables.
 */
export function getOpenAIKey() {
  return process.env.OPENAI_API_KEY;
}

/**
 * Get the Anthropic (Claude) API key from environment variables.
 */
export function getAnthropicKey() {
  return process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
}

/**
 * Call Google Gemini API.
 * @param {Object} options
 * @param {string} options.prompt - The user prompt text
 * @param {string} [options.systemPrompt] - System prompt to prepend
 * @param {string} [options.model] - Gemini model name (default: gemini-2.0-flash)
 * @param {number} [options.temperature] - Temperature (default: 0.7)
 * @param {number} [options.maxOutputTokens] - Max tokens (default: 2048)
 * @param {number} [options.topK] - Top K (default: 40)
 * @param {number} [options.topP] - Top P (default: 0.95)
 * @param {Array} [options.contents] - Custom contents array (overrides prompt/systemPrompt)
 * @returns {Promise<{text: string, provider: string, model: string} | null>}
 */
export async function callGemini({
  prompt,
  systemPrompt = '',
  model = 'gemini-2.0-flash',
  temperature = 0.7,
  maxOutputTokens = 2048,
  topK = 40,
  topP = 0.95,
  contents = null,
}) {
  const apiKey = getGeminiKey();
  if (!apiKey) return null;

  const requestContents = contents || [
    { role: 'user', parts: [{ text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt }] }
  ];

  try {
    const response = await fetch(
      `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: requestContents,
          generationConfig: { temperature, maxOutputTokens, topK, topP },
        }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    return { text, provider: 'gemini', model };
  } catch (error) {
    console.error('Gemini API error:', error.message);
    return null;
  }
}

/**
 * Call OpenAI API.
 * @param {Object} options
 * @param {string} options.prompt - The user message
 * @param {string} [options.systemPrompt] - System prompt
 * @param {string} [options.model] - Model name (default: gpt-4o)
 * @param {number} [options.temperature] - Temperature (default: 0.7)
 * @param {number} [options.maxTokens] - Max tokens (default: 2048)
 * @param {Array} [options.messages] - Custom messages array (overrides prompt/systemPrompt)
 * @returns {Promise<{text: string, provider: string, model: string} | null>}
 */
export async function callOpenAI({
  prompt,
  systemPrompt = '',
  model = 'gpt-4o',
  temperature = 0.7,
  maxTokens = 2048,
  messages = null,
}) {
  const apiKey = getOpenAIKey();
  if (!apiKey) return null;

  const requestMessages = messages || [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    { role: 'user', content: prompt },
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: requestMessages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;

    return { text, provider: 'openai', model };
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    return null;
  }
}

/**
 * Call Anthropic Claude API.
 * @param {Object} options
 * @param {string} options.prompt - The user message
 * @param {string} [options.systemPrompt] - System prompt
 * @param {string} [options.model] - Model name (default: claude-sonnet-4-20250514)
 * @param {number} [options.maxTokens] - Max tokens (default: 2048)
 * @param {Array} [options.messages] - Custom messages array (overrides prompt)
 * @returns {Promise<{text: string, provider: string, model: string} | null>}
 */
export async function callClaude({
  prompt,
  systemPrompt = '',
  model = 'claude-sonnet-4-20250514',
  maxTokens = 2048,
  messages = null,
}) {
  const apiKey = getAnthropicKey();
  if (!apiKey) return null;

  const requestMessages = messages || [{ role: 'user', content: prompt }];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        ...(systemPrompt && { system: systemPrompt }),
        messages: requestMessages,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) return null;

    return { text, provider: 'claude', model };
  } catch (error) {
    console.error('Claude API error:', error.message);
    return null;
  }
}

/**
 * Call AI providers in fallback order until one succeeds.
 * @param {Object} options
 * @param {string} options.prompt - The user prompt
 * @param {string} [options.systemPrompt] - System prompt
 * @param {Array<'gemini'|'openai'|'claude'>} [options.providers] - Provider order
 * @param {Object} [options.geminiOptions] - Extra Gemini options
 * @param {Object} [options.openaiOptions] - Extra OpenAI options
 * @param {Object} [options.claudeOptions] - Extra Claude options
 * @returns {Promise<{text: string, provider: string, model: string} | null>}
 */
export async function callAIWithFallback({
  prompt,
  systemPrompt = '',
  providers = ['gemini', 'openai', 'claude'],
  geminiOptions = {},
  openaiOptions = {},
  claudeOptions = {},
}) {
  for (const provider of providers) {
    let result = null;

    switch (provider) {
      case 'gemini':
        result = await callGemini({ prompt, systemPrompt, ...geminiOptions });
        break;
      case 'openai':
        result = await callOpenAI({ prompt, systemPrompt, ...openaiOptions });
        break;
      case 'claude':
        result = await callClaude({ prompt, systemPrompt, ...claudeOptions });
        break;
    }

    if (result) return result;
  }

  return null;
}
