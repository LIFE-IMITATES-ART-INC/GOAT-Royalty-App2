/**
 * AI Code Generation API
 */
import { createApiHandler } from '../../lib/api-handler';
import { callAIWithFallback } from '../../lib/ai-providers';

export default createApiHandler({
  methods: 'POST',
  handler: async (req, res) => {
    const { prompt, code, language = 'javascript', action = 'generate' } = req.body;

    if (!prompt && !code) {
      return res.status(400).json({ error: 'Prompt or code is required' });
    }

    const actionPrompts = {
      generate: `Generate production-ready ${language} code for: ${prompt}\n\nRequirements:\n- Clean, well-structured code\n- Proper error handling\n- Comments explaining key logic\n- Follow best practices for ${language}`,
      debug: `Debug and fix the following ${language} code. Issue: ${prompt}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide the fixed code and explain what was wrong.`,
      refactor: `Refactor the following ${language} code for better quality: ${prompt}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nImprove readability, performance, and maintainability.`,
      explain: `Explain the following ${language} code in detail:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide a line-by-line explanation.`,
      optimize: `Optimize the following ${language} code for performance: ${prompt}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nFocus on speed, memory usage, and efficiency.`,
      test: `Write comprehensive unit tests for the following ${language} code:\n\n\`\`\`${language}\n${code || prompt}\n\`\`\`\n\nInclude edge cases and assertions.`,
      document: `Add comprehensive documentation to the following ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nInclude JSDoc/docstrings, parameter descriptions, and usage examples.`,
      convert: `Convert the following code to ${language}:\n\n\`\`\`\n${code}\n\`\`\`\n\nMaintain the same functionality and follow ${language} best practices.`
    };

    const systemPrompt = `You are an expert ${language} developer. Provide clean, production-ready code. Return ONLY the code in a code block, followed by a brief explanation. Do not include unnecessary commentary.`;

    const result = await callAIWithFallback({
      prompt: actionPrompts[action] || actionPrompts.generate,
      systemPrompt,
      geminiOptions: { temperature: 0.3, maxOutputTokens: 4096 },
      openaiOptions: { temperature: 0.3, maxTokens: 4096 },
    });

    if (result) {
      const codeMatch = result.text.match(/```[\w]*\n([\s\S]*?)```/);
      const extractedCode = codeMatch ? codeMatch[1].trim() : result.text;
      const explanation = result.text.replace(/```[\w]*\n[\s\S]*?```/g, '').trim();
      return res.status(200).json({ code: extractedCode, explanation, provider: result.provider });
    }

    return res.status(200).json({
      code: generateLocalCode(language, action, prompt),
      explanation: 'Generated using local templates. Connect an AI API key for advanced code generation.',
      provider: 'local'
    });
  }
});

function generateLocalCode(language, action, prompt) {
  const templates = {
    javascript: `// Generated Code - ${prompt || 'Component'}
// Language: JavaScript

/**
 * ${prompt || 'Auto-generated function'}
 * @description Production-ready implementation
 */
function main() {
  console.log('GOAT Royalty App - Code Generator');
  
  // TODO: Implement your logic here
  // Connect an AI API key (Gemini/OpenAI) for 
  // intelligent code generation
  
  return {
    status: 'ready',
    message: 'Code generated successfully'
  };
}

module.exports = { main };`,
    python: `# Generated Code - ${prompt || 'Module'}
# Language: Python

"""
${prompt || 'Auto-generated module'}
Production-ready implementation
"""

def main():
    """Main entry point"""
    print('GOAT Royalty App - Code Generator')
    
    # TODO: Implement your logic here
    # Connect an AI API key for intelligent generation
    
    return {
        'status': 'ready',
        'message': 'Code generated successfully'
    }

if __name__ == '__main__':
    main()`,
    react: `// Generated React Component - ${prompt || 'Component'}
import React, { useState, useEffect } from 'react';

/**
 * ${prompt || 'Auto-generated React component'}
 */
export default function GeneratedComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement data fetching
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-gray-900 rounded-xl">
      <h2 className="text-xl font-bold text-white">
        Generated Component
      </h2>
      <p className="text-gray-400 mt-2">
        Connect an AI API key for intelligent code generation.
      </p>
    </div>
  );
}`,
  };
  return templates[language] || templates.javascript;
}
