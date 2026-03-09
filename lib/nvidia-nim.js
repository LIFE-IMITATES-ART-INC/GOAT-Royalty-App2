/**
 * NVIDIA NIM API Client
 * Handles communication with NVIDIA NIM inference microservices
 * Supports NVIDIA Build platform models
 */

class NIMClient {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.NVIDIA_NIM_API_KEY;
    this.baseUrl = 'https://integrate.api.nvidia.com/v1';
  }

  /**
   * Check if API key is configured
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Generic NIM API call method
   */
  async callModel(model, prompt, options = {}) {
    const endpoint = options.endpoint || '/chat/completions';
    
    if (!this.isConfigured()) {
      throw new Error('NVIDIA NIM API key is not configured. Please set NVIDIA_NIM_API_KEY environment variable.');
    }
    
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
        const errorText = await response.text();
        throw new Error(`NIM API error: ${response.status} ${response.statusText} - ${errorText}`);
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
      
      Return your answer in JSON format with the following structure:
      {
        "mechanical": {"amount": number, "rate": string, "calculation": string},
        "performance": {"amount": number, "rate": string, "calculation": string},
        "sync": {"amount": number, "rate": string, "calculation": string},
        "streaming": {"amount": number, "rate": string, "calculation": string},
        "total": number,
        "summary": string
      }
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
      7. Scene composition
      8. Emotional tone
      
      Return your answer in JSON format with the following structure:
      {
        "visualElements": ["element1", "element2"],
        "cameraMovements": ["movement1", "movement2"],
        "lighting": string,
        "colorPalette": ["color1", "color2"],
        "copyrightedContent": boolean,
        "musicMoods": ["mood1", "mood2"],
        "sceneComposition": string,
        "emotionalTone": string,
        "recommendations": ["rec1", "rec2"]
      }
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
      
      Return your answer in JSON format with the following structure:
      {
        "answer": string,
        "sources": ["source1", "source2"],
        "confidence": number,
        "relatedTopics": ["topic1", "topic2"],
        "suggestedActions": ["action1", "action2"]
      }
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
      
      Return your answer in JSON format with the following structure:
      {
        "steps": [{"step": number, "description": string, "action": string}],
        "reasoning": string,
        "estimatedTime": string,
        "resources": ["resource1", "resource2"],
        "risks": ["risk1", "risk2"],
        "mitigation": ["mitigation1", "mitigation2"]
      }
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
      
      Return your answer in JSON format with the following structure:
      {
        "code": string,
        "language": string,
        "description": string,
        "usage": string,
        "dependencies": ["dep1", "dep2"],
        "notes": ["note1", "note2"]
      }
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
      
      Return your answer in JSON format with the following structure:
      {
        "bugs": [{"line": number, "issue": string, "fix": string}],
        "performance": [{"issue": string, "suggestion": string}],
        "security": [{"issue": string, "severity": string, "fix": string}],
        "bestPractices": [{"issue": string, "suggestion": string}],
        "overallScore": number,
        "improvedCode": string
      }
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
   * Audio Recognition - Super Shazam feature
   */
  async recognizeAudio(audioData) {
    const prompt = `
      Analyze the following audio data and identify the music track:
      
      Audio Data: ${JSON.stringify(audioData)}
      
      Identify:
      1. Track title
      2. Artist name
      3. Album name
      4. Genre
      5. BPM
      6. Key
      7. ISRC code (if available)
      8. Confidence score
      
      Return your answer in JSON format with the following structure:
      {
        "title": string,
        "artist": string,
        "album": string,
        "year": number,
        "duration": string,
        "genre": string,
        "bpm": number,
        "key": string,
        "isrc": string,
        "confidence": number,
        "timestamp": string,
        "copyright": string,
        "royalties": {
          "mechanical": string,
          "performance": string,
          "sync": string,
          "streaming": string
        }
      }
    `;

    return this.callModel('meta/llama-3.3-70b-instruct:free', prompt, {
      temperature: 0.3,
      maxTokens: 2048
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
      
      Return your answer in JSON format with the following structure:
      {
        "solution": string,
        "explanation": string,
        "language": string,
        "code": string,
        "usage": string
      }
    `;

    return this.callModel('zhipuai/glm-4-9b-chat:free', prompt, {
      temperature: 0.5,
      maxTokens: 2048
    });
  }

  /**
   * Get all available models
   */
  getAvailableModels() {
    return {
      code: [
        { id: 'nvidia/nemotron-4-340b-instruct:free', name: 'Nemotron 4 340B', description: 'Advanced code generation with 1M context' },
        { id: 'minimax/minimax-01:free', name: 'MiniMax M2.5', description: '230B-parameter coding and reasoning model' },
        { id: 'zhipuai/glm-4-9b-chat:free', name: 'GLM 4.7', description: 'Multilingual agentic coding partner' }
      ],
      reasoning: [
        { id: 'deepseek-ai/deepseek-r1:free', name: 'DeepSeek V3.2', description: '685B reasoning LLM with sparse attention' },
        { id: 'zhipuai/glm-4-9b-chat:free', name: 'GLM-5', description: '744B MoE for complex reasoning' },
        { id: 'meta/llama-3.3-70b-instruct:free', name: 'Step 3.5 Flash', description: 'Fast reasoning engine' }
      ],
      vision: [
        { id: 'moonshotai/kimi-v1-a3b-thinking:free', name: 'Kimi K2.5', description: '1T multimodal MoE for video understanding' },
        { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 3.5 397B', description: 'Next-gen VLM with advanced vision capabilities' }
      ],
      rag: [
        { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 3.5 397B', description: 'Advanced RAG and retrieval capabilities' }
      ],
      audio: [
        { id: 'meta/llama-3.3-70b-instruct:free', name: 'Nemotron Audio 2B', description: 'Audio recognition and analysis' }
      ]
    };
  }
}

// Export singleton instance
export default new NIMClient();