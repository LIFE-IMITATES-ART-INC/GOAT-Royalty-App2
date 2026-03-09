/**
 * NVIDIA NIM API Client
 * Handles communication with NVIDIA NIM inference microservices
 */

class NIMClient {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.NVIDIA_NIM_API_KEY;
    this.baseUrl = 'https://integrate.api.nvidia.com/v1';
  }

  /**
   * Generic NIM API call method
   */
  async callModel(model, prompt, options = {}) {
    const endpoint = options.endpoint || '/chat/completions';
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1024,
          top_p: options.topP || 0.9,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`NIM API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('NIM API call failed:', error);
      throw error;
    }
  }

  /**
   * DeepSeek V3.2 - Advanced reasoning for royalty calculations
   */
  async calculateRoyalties(salesData, metadata) {
    const prompt = `
      You are an expert music royalty calculator. Calculate royalty distributions based on the following data:
      
      Sales Data: ${JSON.stringify(salesData)}
      Metadata: ${JSON.stringify(metadata)}
      
      Calculate:
      1. Mechanical royalties
      2. Performance royalties
      3. Synchronization royalties (if applicable)
      4. Digital streaming royalties
      
      Provide breakdown by revenue stream and percentage splits.
    `;

    return this.callModel('deepseek-ai/deepseek-r1:free', prompt, {
      temperature: 0.2,
      maxTokens: 2048
    });
  }

  /**
   * Kimi K2.5 - Video understanding for Cinema Camera
   */
  async analyzeVideo(videoDescription, timestamp) {
    const prompt = `
      Analyze the following video content at timestamp ${timestamp}:
      
      Description: ${videoDescription}
      
      Identify:
      1. Main visual elements
      2. Camera movements
      3. Lighting conditions
      4. Color palette
      5. Any copyrighted content
      6. Suitable music moods
    `;

    return this.callModel('moonshotai/kimi-v1-a3b-thinking:free', prompt, {
      temperature: 0.5,
      maxTokens: 1536
    });
  }

  /**
   * Qwen 3.5 397B - Advanced RAG for Knowledge Engine
   */
  async ragQuery(query, context) {
    const prompt = `
      Use the following context to answer the query:
      
      Context: ${context}
      
      Query: ${query}
      
      Provide a comprehensive answer with citations where possible.
    `;

    return this.callModel('qwen/qwen-2.5-72b-instruct:free', prompt, {
      temperature: 0.3,
      maxTokens: 4096
    });
  }

  /**
   * GLM-5 - Complex reasoning for long-horizon tasks
   */
  async complexReasoning(task, context) {
    const prompt = `
      Task: ${task}
      Context: ${context}
      
      Break down this task into steps and provide a detailed solution.
    `;

    return this.callModel('zhipuai/glm-4-9b-chat:free', prompt, {
      temperature: 0.4,
      maxTokens: 3072
    });
  }

  /**
   * Nemotron 3 Nano - Code generation with 1M context
   */
  async generateCode(description, language = 'javascript') {
    const prompt = `
      Generate ${language} code for the following requirement:
      
      ${description}
      
      Include comments and error handling.
    `;

    return this.callModel('nvidia/nemotron-4-340b-instruct:free', prompt, {
      temperature: 0.6,
      maxTokens: 2048
    });
  }

  /**
   * MiniMax M2.5 - Coding and reasoning
   */
  async codeReview(code, language = 'javascript') {
    const prompt = `
      Review the following ${language} code for:
      1. Bugs and errors
      2. Performance issues
      3. Security vulnerabilities
      4. Best practices
      5. Suggested improvements
      
      Code:
      ${code}
    `;

    return this.callModel('minimax/minimax-01:free', prompt, {
      temperature: 0.5,
      maxTokens: 2048
    });
  }

  /**
   * Step 3.5 Flash - Fast reasoning engine
   */
  async quickReasoning(query, context = '') {
    const prompt = context 
      ? `Context: ${context}\n\nQuery: ${query}`
      : query;

    return this.callModel('meta/llama-3.3-70b-instruct:free', prompt, {
      temperature: 0.3,
      maxTokens: 1024
    });
  }

  /**
   * GLM 4.7 - Multilingual coding and tool use
   */
  async multilingualCode(task, language = 'english') {
    const prompt = `
      Language: ${language}
      Task: ${task}
      
      Provide code solution with explanation.
    `;

    return this.callModel('zhipuai/glm-4-9b-chat:free', prompt, {
      temperature: 0.5,
      maxTokens: 2048
    });
  }
}

// Export singleton instance
export default new NIMClient();