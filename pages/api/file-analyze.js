/**
 * File Analysis API
 */
import { createApiHandler } from '../../lib/api-handler';
import { callGemini } from '../../lib/ai-providers';

export default createApiHandler({
  methods: 'POST',
  handler: async (req, res) => {
    const { fileName, fileType, fileSize, query = 'Analyze this file' } = req.body;

    const systemPrompt = `You are a file analysis AI assistant. The user has uploaded a file named "${fileName}" (type: ${fileType}, size: ${fileSize} bytes). Provide a detailed analysis based on the file type and the user's query. Be specific and actionable.`;

    const result = await callGemini({
      prompt: `User query: ${query}`,
      systemPrompt,
      temperature: 0.5,
      maxOutputTokens: 4096,
    });

    if (result) {
      return res.status(200).json({ analysis: result.text, provider: 'gemini' });
    }

    return res.status(200).json({
      analysis: `\u{1F4C4}**File Analysis: ${fileName}**\n\nType: ${fileType}\nSize: ${(fileSize / 1024).toFixed(1)} KB\n\nTo perform AI-powered file analysis, configure your API keys (Gemini/OpenAI) in the .env file.\n\nThe File Analyzer can:\n\u2022 Extract text from PDFs\n\u2022 Parse CSV/JSON data\n\u2022 Analyze image content\n\u2022 Summarize documents\n\u2022 Answer questions about file contents`,
      provider: 'local'
    });
  }
});
