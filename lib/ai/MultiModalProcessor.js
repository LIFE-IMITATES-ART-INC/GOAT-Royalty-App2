/**
 * Multi-Modal Processor
 * Handles vision, audio, text, and video processing using NVIDIA AI models
 * Supports LLaVA, Phi-3 Vision, and other multimodal models
 */

class MultiModalProcessor {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.NVIDIA_API_KEY;
    this.baseUrl = options.baseUrl || 'https://integrate.api.nvidia.com/v1';
    
    // Model configurations for different modalities
    this.models = {
      vision: {
        llava: 'llava-v1.6-34b',
        phi3Vision: 'microsoft/phi-3-vision-128k-instruct',
        neva: 'nvidia/neva-22b'
      },
      text: {
        llama: 'meta/llama-3.3-70b-instruct',
        mistral: 'mistralai/mistral-large',
        deepseek: 'deepseek-ai/deepseek-r1'
      },
      embedding: {
        nvidiaEmbed: 'nvidia/nv-embedqa-e5-v5',
        snowflakeArctic: 'Snowflake/snowflake-arctic-embed-l'
      },
      audio: {
        whisper: 'openai/whisper-large-v3',
        canary: 'nvidia/canary-180m-flash'
      }
    };
    
    this.defaultOptions = {
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9
    };
  }

  /**
   * Process an image with vision models
   */
  async processImage(imageInput, options = {}) {
    const model = options.model || this.models.vision.llava;
    const task = options.task || 'describe';
    
    // Handle different image input formats
    let imageContent;
    if (typeof imageInput === 'string') {
      if (imageInput.startsWith('data:') || imageInput.startsWith('http')) {
        imageContent = {
          type: 'image_url',
          image_url: { url: imageInput }
        };
      } else {
        // Assume base64
        imageContent = {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${imageInput}` }
        };
      }
    } else if (Buffer.isBuffer(imageInput)) {
      imageContent = {
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${imageInput.toString('base64')}` }
      };
    }

    const taskPrompts = {
      describe: 'Describe this image in detail.',
      analyze: 'Analyze this image and identify key elements, objects, and their relationships.',
      ocr: 'Extract all text visible in this image. Provide the text exactly as it appears.',
      classify: 'Classify this image into categories. Provide the main category and subcategories.',
      caption: 'Generate a concise caption for this image.',
      detect: 'Detect and list all objects in this image with their approximate positions.',
      compare: 'Compare the elements in this image and highlight differences or similarities.',
      extract: 'Extract structured data from this image (tables, forms, diagrams).'
    };

    const messages = [
      {
        role: 'user',
        content: [
          imageContent,
          { type: 'text', text: options.prompt || taskPrompts[task] || taskPrompts.describe }
        ]
      }
    ];

    try {
      const response = await this.callNVIDIA(model, messages, options);
      
      return {
        modality: 'vision',
        task,
        model,
        result: response.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw error;
    }
  }

  /**
   * Process multiple images together
   */
  async processImages(images, options = {}) {
    const model = options.model || this.models.vision.llava;
    
    const imageContents = images.map(img => {
      if (typeof img === 'string' && (img.startsWith('data:') || img.startsWith('http'))) {
        return { type: 'image_url', image_url: { url: img } };
      } else if (Buffer.isBuffer(img)) {
        return { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${img.toString('base64')}` } };
      }
      return { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${img}` } };
    });

    const messages = [
      {
        role: 'user',
        content: [
          ...imageContents,
          { type: 'text', text: options.prompt || 'Analyze these images and provide insights.' }
        ]
      }
    ];

    const response = await this.callNVIDIA(model, messages, options);
    
    return {
      modality: 'vision',
      task: 'multi-image',
      model,
      imageCount: images.length,
      result: response.content,
      usage: response.usage
    };
  }

  /**
   * Process video (extracted frames)
   */
  async processVideo(frames, options = {}) {
    const model = options.model || this.models.vision.llava;
    const fps = options.fps || 1;
    
    // Process key frames
    const frameAnalysis = [];
    const batchSize = options.batchSize || 5;
    
    for (let i = 0; i < frames.length; i += batchSize) {
      const batch = frames.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((frame, idx) => this.processImage(frame, {
          model,
          prompt: `Analyze frame ${i + idx + 1} of the video. Describe what's happening.`
        }))
      );
      frameAnalysis.push(...batchResults);
    }

    // Synthesize video understanding
    const synthesisPrompt = `Analyze these frame descriptions from a video and provide:
1. A summary of what happens in the video
2. Key events or changes detected
3. Overall themes or patterns
4. Timeline of significant moments

Frame analyses:
${frameAnalysis.map((f, i) => `Frame ${i + 1}: ${f.result}`).join('\n\n')}`;

    const synthesis = await this.processText(synthesisPrompt, {
      model: this.models.text.llama,
      task: 'analyze'
    });

    return {
      modality: 'video',
      model,
      frameCount: frames.length,
      fps,
      frameAnalysis,
      synthesis: synthesis.result,
      usage: synthesis.usage
    };
  }

  /**
   * Process audio (transcription and analysis)
   */
  async processAudio(audioInput, options = {}) {
    const task = options.task || 'transcribe';
    
    // For transcription, we would typically use a dedicated ASR model
    // Here we'll process the transcribed text or analyze audio features
    
    if (task === 'transcribe') {
      // This would connect to Whisper or similar ASR service
      // Placeholder for actual ASR integration
      return {
        modality: 'audio',
        task: 'transcribe',
        status: 'requires_asr_service',
        note: 'Connect to NVIDIA Riva or Whisper for transcription'
      };
    }
    
    if (task === 'analyze' && options.transcription) {
      // Analyze transcribed audio
      const analysis = await this.processText(options.transcription, {
        model: this.models.text.llama,
        task: 'analyze'
      });
      
      return {
        modality: 'audio',
        task: 'analyze',
        result: analysis.result,
        usage: analysis.usage
      };
    }

    return {
      modality: 'audio',
      task,
      status: 'completed'
    };
  }

  /**
   * Process text with advanced language models
   */
  async processText(text, options = {}) {
    const model = options.model || this.models.text.llama;
    const task = options.task || 'process';
    
    const taskPrompts = {
      process: text,
      summarize: `Summarize the following text concisely while preserving key information:\n\n${text}`,
      analyze: `Analyze the following text and provide insights:\n\n${text}`,
      translate: `Translate the following text to ${options.targetLanguage || 'English'}:\n\n${text}`,
      sentiment: `Analyze the sentiment of the following text. Provide sentiment (positive/negative/neutral), confidence, and key emotional indicators:\n\n${text}`,
      extract: `Extract key information from the following text:\n\n${text}\n\nProvide:\n- Main topics\n- Key entities\n- Important facts\n- Action items (if any)`,
      rewrite: `Rewrite the following text to be ${options.style || 'more clear and concise'}:\n\n${text}`,
      expand: `Expand on the following text with additional details and examples:\n\n${text}`,
      classify: `Classify the following text into appropriate categories:\n\n${text}`,
      qa: `Answer the following question based on the context provided.\n\nContext: ${options.context || text}\n\nQuestion: ${options.question || 'What are the key points?'}`
    };

    const messages = [
      { role: 'user', content: taskPrompts[task] || text }
    ];

    if (options.systemPrompt) {
      messages.unshift({ role: 'system', content: options.systemPrompt });
    }

    try {
      const response = await this.callNVIDIA(model, messages, options);
      
      return {
        modality: 'text',
        task,
        model,
        result: response.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('Text processing error:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(text, options = {}) {
    const model = options.model || this.models.embedding.nvidiaEmbed;
    
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: model,
        input: Array.isArray(text) ? text : [text],
        encoding_format: 'float'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Embedding API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    return {
      modality: 'embedding',
      model,
      embeddings: data.data.map(d => d.embedding),
      dimensions: data.data[0]?.embedding?.length || 0,
      usage: data.usage
    };
  }

  /**
   * Multi-modal fusion - combine multiple modalities
   */
  async fuse(inputs, options = {}) {
    const results = {};
    
    // Process each modality
    for (const [modality, input] of Object.entries(inputs)) {
      switch (modality) {
        case 'image':
          results.image = await this.processImage(input, options.image || {});
          break;
        case 'images':
          results.images = await this.processImages(input, options.images || {});
          break;
        case 'text':
          results.text = await this.processText(input, options.text || {});
          break;
        case 'audio':
          results.audio = await this.processAudio(input, options.audio || {});
          break;
        case 'video':
          results.video = await this.processVideo(input, options.video || {});
          break;
      }
    }

    // Synthesize multi-modal understanding
    const fusionPrompt = `Synthesize the following multi-modal analysis:\n\n${JSON.stringify(results, null, 2)}\n\nProvide an integrated understanding that combines insights from all modalities.`;

    const fusion = await this.processText(fusionPrompt, {
      model: this.models.text.llama,
      task: 'analyze'
    });

    return {
      modality: 'fusion',
      inputs: Object.keys(inputs),
      results,
      synthesis: fusion.result,
      usage: fusion.usage
    };
  }

  /**
   * Visual Question Answering
   */
  async visualQA(image, question, options = {}) {
    const model = options.model || this.models.vision.llava;
    
    const messages = [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}` } },
          { type: 'text', text: question }
        ]
      }
    ];

    const response = await this.callNVIDIA(model, messages, options);
    
    return {
      modality: 'vqa',
      model,
      question,
      answer: response.content,
      usage: response.usage
    };
  }

  /**
   * Document understanding (images of documents)
   */
  async understandDocument(documentImage, options = {}) {
    const model = options.model || this.models.vision.phi3Vision;
    const extractType = options.extractType || 'all';
    
    const extractPrompts = {
      all: 'Analyze this document. Extract all text, identify the document type, summarize key information, and identify any tables or structured data.',
      text: 'Extract all text from this document, preserving the layout and structure as much as possible.',
      tables: 'Identify and extract all tables from this document in a structured format.',
      forms: 'Extract form fields and their values from this document.',
      summary: 'Provide a comprehensive summary of this document, including its purpose, key points, and any action items.'
    };

    const result = await this.processImage(documentImage, {
      model,
      prompt: extractPrompts[extractType]
    });

    return {
      modality: 'document',
      extractType,
      model,
      result: result.result,
      usage: result.usage
    };
  }

  /**
   * Batch processing for multiple inputs
   */
  async batchProcess(items, options = {}) {
    const results = [];
    const concurrency = options.concurrency || 3;
    
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(item => {
          switch (item.modality) {
            case 'image':
              return this.processImage(item.input, item.options || {});
            case 'text':
              return this.processText(item.input, item.options || {});
            case 'audio':
              return this.processAudio(item.input, item.options || {});
            default:
              return this.processText(item.input, item.options || {});
          }
        })
      );
      results.push(...batchResults);
    }

    return {
      modality: 'batch',
      itemCount: items.length,
      results
    };
  }

  // NVIDIA API Call
  async callNVIDIA(model, messages, options = {}) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: options.temperature || this.defaultOptions.temperature,
        max_tokens: options.maxTokens || this.defaultOptions.maxTokens,
        top_p: options.topP || this.defaultOptions.topP,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NVIDIA API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    };
  }

  // Get available models for a modality
  getAvailableModels(modality) {
    return this.models[modality] || {};
  }

  // Get all supported modalities
  getSupportedModalities() {
    return ['image', 'text', 'audio', 'video', 'embedding', 'fusion'];
  }
}

// Export for use in other modules
module.exports = MultiModalProcessor;
module.exports.default = MultiModalProcessor;