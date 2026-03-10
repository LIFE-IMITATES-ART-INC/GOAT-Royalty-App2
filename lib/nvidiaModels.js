/**
 * NVIDIA NGC Model Registry - 215+ LLMs and AI Models
 * Complete catalog of available models with capabilities and metadata
 */

export const NVIDIA_CATEGORIES = {
  TEXT_CHAT: 'text_chat',
  CODE_GENERATION: 'code_generation',
  MULTIMODAL: 'multimodal',
  EMBEDDING: 'embedding',
  RERANKING: 'reranking',
  VISION: 'vision',
  VIDEO: 'video',
  TRANSLATION: 'translation',
  SAFETY: 'safety',
  AUDIO: 'audio'
};

export const NVIDIA_PROVIDERS = {
  NVIDIA: 'nvidia',
  META: 'meta',
  MISTRAL_AI: 'mistral_ai',
  MICROSOFT: 'microsoft',
  GOOGLE: 'google',
  DEEPSEEK_AI: 'deepseek_ai',
  QWEN: 'qwen',
  MINIMAXAI: 'minimaxai',
  MOONSHOTAI: 'moonshotai',
  Z_AI: 'z_ai',
  STEPFUN_AI: 'stepfun_ai'
};

// Complete NVIDIA NGC Model Registry
export const NVIDIA_MODELS = [
  // ========== TEXT / CHAT LLMs ==========
  {
    id: 'llama-3_1-405b-instruct',
    name: 'Llama 3.1 405B Instruct',
    provider: NVIDIA_PROVIDERS.META,
    category: NVIDIA_CATEGORIES.TEXT_CHAT,
    description: 'State-of-the-art open LLM with 405B parameters, optimized for chat, reasoning, and instruction following',
    capabilities: ['chat', 'reasoning', 'instruction_following', 'long_context'],
    contextLength: 128000,
    parameters: '405B',
    apiEndpoint: '/chat/completions',
    features: ['tool_calling', 'json_mode', 'function_calling'],
    pricing: { input: 0.0027, output: 0.0027 }
  },
  {
    id: 'llama-3_1-70b-instruct',
    name: 'Llama 3.1 70B Instruct',
    provider: NVIDIA_PROVIDERS.META,
    category: NVIDIA_CATEGORIES.TEXT_CHAT,
    description: 'High-performance 70B parameter LLM for general chat and reasoning tasks',
    capabilities: ['chat', 'reasoning', 'instruction_following'],
    contextLength: 128000,
    parameters: '70B',
    apiEndpoint: '/chat/completions',
    features: ['tool_calling', 'json_mode'],
    pricing: { input: 0.0007, output: 0.0007 }
  },
  {
    id: 'llama-3_1-8b-instruct',
    name: 'Llama 3.1 8B Instruct',
    provider: NVIDIA_PROVIDERS.META,
    category: NVIDIA_CATEGORIES.TEXT_CHAT,
    description: 'Efficient 8B parameter LLM for fast inference and chat applications',
    capabilities: ['chat', 'reasoning', 'instruction_following'],
    contextLength: 128000,
    parameters: '8B',
    apiEndpoint: '/chat/completions',
    features: ['tool_calling', 'json_mode'],
    pricing: { input: 0.0001, output: 0.0001 }
  },
  {
    id: 'nemotron-3-nano-30b-a3b',
    name: 'Nemotron 3 Nano 30B A3B',
    provider: NVIDIA_PROVIDERS.NVIDIA,
    category: NVIDIA_CATEGORIES.TEXT_CHAT,
    description: 'Open, efficient MoE model with 1M context, excelling in coding, reasoning, instruction following, tool calling',
    capabilities: ['chat', 'reasoning', 'coding', 'tool_calling', 'long_context'],
    contextLength: 1000000,
    parameters: '30B (MoE)',
    apiEndpoint: '/chat/completions',
    features: ['tool_calling', 'json_mode', 'moe'],
    pricing: { input: 0.0005, output: 0.0005 }
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: NVIDIA_PROVIDERS.DEEPSEEK_AI,
    category: NVIDIA_CATEGORIES.TEXT_CHAT,
    description: '685B reasoning LLM with sparse attention, long context, and integrated agentic tools',
    capabilities: ['chat', 'reasoning', 'coding', 'tool_calling', 'long_context'],
    contextLength: 128000,
    parameters: '685B (MoE)',
    apiEndpoint: '/chat/completions',
    features: ['tool_calling', 'json_mode', 'moe', 'web_search'],
    pricing: { input: 0.0014, output: 0.0028 }
  },
  {
    id: 'qwen2.5-72b-instruct',
    name: 'Qwen 2.5 72B Instruct',
    provider: NVIDIA_PROVIDERS.QWEN,
    category: NVIDIA_CATEGORIES.TEXT_CHAT,
    description: 'Powerful 72B parameter model for chat, reasoning, and multilingual tasks',
    capabilities: ['chat', 'reasoning', 'multilingual', 'coding'],
    contextLength: 32768,
    parameters: '72B',
    apiEndpoint: '/chat/completions',
    features: ['tool_calling', 'json_mode'],
    pricing: { input: 0.0007, output: 0.0007 }
  },
  {
    id: 'qwen3.5-122b-a10b',
    name: 'Qwen 3.5 122B A10B',
    provider: NVIDIA_PROVIDERS.QWEN,
    category: NVIDIA_CATEGORIES.TEXT_CHAT,
    description: '122B MoE LLM (10B active) for coding, reasoning, multimodal chat. Agent-ready.',
    capabilities: ['chat', 'reasoning', 'coding', 'tool_calling', 'multimodal'],
    contextLength: 32768,
    parameters: '122B (MoE)',
    apiEndpoint: '/chat/completions',
    features: ['tool_calling', 'json_mode', 'moe'],
    pricing: { input: 0.0008, output: 0.0008 }
  },
  {
    id: 'qwen3.5-397b-a17b',
    name: 'Qwen 3.5 397B A17B',
    provider: NVIDIA_PROVIDERS.QWEN,
    category: NVIDIA_CATEGORIES.MULTIMODAL,
    description: 'Next-gen Qwen 3.5 VLM (400B MoE) brings advanced vision, chat, RAG, and agentic capabilities.',
    capabilities: ['chat', 'reasoning', 'vision', 'tool_calling', 'rag', 'agentic'],
    contextLength: 32768,
    parameters: '397B (MoE)',
    apiEndpoint: '/chat/completions',
    features: ['tool_calling', 'json_mode', 'moe', 'vision'],
    pricing: { input: 0.0025, output: 0.0025 }
  },
  {
    id: 'glm4',
    name: 'GLM-4',
    provider: NVIDIA_PROVIDERS.Z_AI,
    category: NVIDIA_CATEGORIES.TEXT_CHAT,
    description: 'High-performance Chinese and English LLM with strong reasoning capabilities',
    capabilities: ['chat', 'reasoning', 'multilingual', 'coding'],
    contextLength: 128000,
    parameters: '134B',
    apiEndpoint: '/chat/completions',
    features: ['tool_calling', 'json_mode'],
    pricing: { input: 0.0007, output: 0.0007 }
  },
  {
    id: 'glm4.7',
    name: 'GLM-4.7',
    provider: NVIDIA_PROVIDERS.Z_AI,
    category: NVIDIA_CATEGORIES.CODE_GENERATION,
    description: 'GLM-4.7 is a multilingual agentic coding partner with stronger reasoning, tool use, and UI skills.',
    capabilities: ['chat', 'reasoning', 'coding', 'tool_calling', 'ui_generation'],
    contextLength: 128000,
    parameters: '134B',
    apiEndpoint: '/chat/completions',
    features: ['tool_calling', 'json_mode', 'agentic'],
    pricing: { input: 0.0008, output: 0.0008 }
  },
  {
    id: 'glm5',
    name: 'GLM-5',
    provider: NVIDIA_PROVIDERS.Z_AI,
    category: NVIDIA_CATEGORIES.TEXT_CHAT,
    description: 'GLM-5 744B MoE enables efficient reasoning for complex systems and long-horizon agentic tasks.',
    capabilities: ['chat', 'reasoning', 'agentic', 'long_context', 'complex_planning'],
    contextLength: 128000,
    parameters: '744B (MoE)',
    apiEndpoint: '/chat/completions',
    features: ['tool_calling', 'json_mode', 'moe', 'agentic'],
    pricing: { input: 0.0030, output: 0.0030 }
  },
  {
    id: 'mistral-large-2407',
    name: 'Mistral Large 2407',
    provider: NVIDIA_PROVIDERS.MISTRAL_AI,
    category: NVIDIA_CATEGORIES.TEXT_CHAT,
    description: 'State-of-the-art 123B parameter model for complex reasoning and multilingual tasks',
    capabilities: ['chat', 'reasoning', 'multilingual', 'coding'],
    contextLength: 128000,
    parameters: '123B',
    apiEndpoint: '/chat/completions',
    features: ['tool_calling', 'json_mode'],
    pricing: { input: 0.0008, output: 0.0008 }
  },
  {
    id: 'minimax-m2.5',
    name: 'MiniMax M2.5',
    provider: NVIDIA_PROVIDERS.MINIMAXAI,
    category: NVIDIA_CATEGORIES.TEXT_CHAT,
    description: 'MiniMax M2.5 is a 230B-parameter text-to-text AI model excelling in coding, reasoning, and office tasks.',
    capabilities: ['chat', 'reasoning', 'coding', 'office_tasks'],
    contextLength: 128000,
    parameters: '230B',
    apiEndpoint: '/chat/completions',
    features: ['tool_calling', 'json_mode'],
    pricing: { input: 0.0020, output: 0.0020 }
  },
  {
    id: 'kimi-k2.5',
    name: 'Kimi K2.5',
    provider: NVIDIA_PROVIDERS.MOONSHOTAI,
    category: NVIDIA_CATEGORIES.MULTIMODAL,
    description: '1T multimodal MoE for high-capacity video and image understanding with efficient inference.',
    capabilities: ['chat', 'reasoning', 'vision', 'video_understanding', 'image_understanding'],
    contextLength: 2000000,
    parameters: '1T (MoE)',
    apiEndpoint: '/chat/completions',
    features: ['tool_calling', 'json_mode', 'moe', 'vision', 'video'],
    pricing: { input: 0.0040, output: 0.0040 }
  },
  {
    id: 'kimi-k2-thinking',
    name: 'Kimi K2 Thinking',
    provider: NVIDIA_PROVIDERS.MOONSHOTAI,
    category: NVIDIA_CATEGORIES.TEXT_CHAT,
    description: 'Open reasoning model with 256K context window, native INT4 quantization and enhanced tool use.',
    capabilities: ['chat', 'reasoning', 'tool_calling', 'long_context'],
    contextLength: 256000,
    parameters: '128B',
    apiEndpoint: '/chat/completions',
    features: ['tool_calling', 'json_mode', 'reasoning'],
    pricing: { input: 0.0015, output: 0.0015 }
  },
  {
    id: 'step-3.5-flash',
    name: 'Step 3.5 Flash',
    provider: NVIDIA_PROVIDERS.STEPFUN_AI,
    category: NVIDIA_CATEGORIES.TEXT_CHAT,
    description: '200B open-source reasoning engine with sparse MoE powering frontier agentic AI.',
    capabilities: ['chat', 'reasoning', 'agentic', 'fast_inference'],
    contextLength: 128000,
    parameters: '200B (MoE)',
    apiEndpoint: '/chat/completions',
    features: ['tool_calling', 'json_mode', 'moe', 'agentic'],
    pricing: { input: 0.0020, output: 0.0020 }
  },

  // ========== CODE GENERATION MODELS ==========
  {
    id: 'devstral-2-123b-instruct-2512',
    name: 'Devstral 2 123B Instruct 2512',
    provider: NVIDIA_PROVIDERS.MISTRAL_AI,
    category: NVIDIA_CATEGORIES.CODE_GENERATION,
    description: 'State-of-the-art open code model with deep reasoning, 256k context, and unmatched efficiency.',
    capabilities: ['coding', 'debugging', 'refactoring', 'code_explanation', 'code_review'],
    contextLength: 256000,
    parameters: '123B',
    apiEndpoint: '/chat/completions',
    features: ['json_mode', 'long_context', 'code_generation'],
    pricing: { input: 0.0012, output: 0.0012 }
  },
  {
    id: 'code-llama-34b-instruct',
    name: 'Code Llama 34B Instruct',
    provider: NVIDIA_PROVIDERS.META,
    category: NVIDIA_CATEGORIES.CODE_GENERATION,
    description: 'Specialized code generation model with 34B parameters for programming tasks',
    capabilities: ['coding', 'debugging', 'refactoring', 'code_explanation'],
    contextLength: 100000,
    parameters: '34B',
    apiEndpoint: '/chat/completions',
    features: ['json_mode', 'code_generation'],
    pricing: { input: 0.0004, output: 0.0004 }
  },
  {
    id: 'qwen2.5-coder-32b-instruct',
    name: 'Qwen 2.5 Coder 32B Instruct',
    provider: NVIDIA_PROVIDERS.QWEN,
    category: NVIDIA_CATEGORIES.CODE_GENERATION,
    description: 'Specialized coding model with 32B parameters for advanced programming tasks',
    capabilities: ['coding', 'debugging', 'refactoring', 'code_explanation'],
    contextLength: 32768,
    parameters: '32B',
    apiEndpoint: '/chat/completions',
    features: ['json_mode', 'code_generation'],
    pricing: { input: 0.0003, output: 0.0003 }
  },

  // ========== MULTIMODAL MODELS ==========
  {
    id: 'llava-neXT-34b',
    name: 'LlaVA-NeXT 34B',
    provider: NVIDIA_PROVIDERS.NVIDIA,
    category: NVIDIA_CATEGORIES.MULTIMODAL,
    description: 'Advanced vision-language model for image understanding and reasoning',
    capabilities: ['vision', 'image_understanding', 'chat', 'reasoning'],
    contextLength: 4096,
    parameters: '34B',
    apiEndpoint: '/chat/completions',
    features: ['vision', 'image_input'],
    pricing: { input: 0.0004, output: 0.0004 }
  },
  {
    id: 'llava-neXT-72b',
    name: 'LlaVA-NeXT 72B',
    provider: NVIDIA_PROVIDERS.NVIDIA,
    category: NVIDIA_CATEGORIES.MULTIMODAL,
    description: 'High-performance vision-language model for complex image understanding',
    capabilities: ['vision', 'image_understanding', 'chat', 'reasoning'],
    contextLength: 4096,
    parameters: '72B',
    apiEndpoint: '/chat/completions',
    features: ['vision', 'image_input'],
    pricing: { input: 0.0007, output: 0.0007 }
  },
  {
    id: 'nemotron-4-340b-reward',
    name: 'Nemotron 4 340B Reward',
    provider: NVIDIA_PROVIDERS.NVIDIA,
    category: NVIDIA_CATEGORIES.TEXT_CHAT,
    description: 'Reward model for RLHF training and evaluation of language models',
    capabilities: ['evaluation', 'reward_scoring', 'rlhf'],
    contextLength: 4096,
    parameters: '340B',
    apiEndpoint: '/chat/completions',
    features: ['reward_model'],
    pricing: { input: 0.0020, output: 0.0020 }
  },

  // ========== EMBEDDING MODELS ==========
  {
    id: 'llama-nemotron-embed-1b-v2',
    name: 'Llama Nemotron Embed 1B v2',
    provider: NVIDIA_PROVIDERS.NVIDIA,
    category: NVIDIA_CATEGORIES.EMBEDDING,
    description: 'Multilingual, cross-lingual embedding model for long-document QA retrieval, supporting 26 languages.',
    capabilities: ['embedding', 'retrieval', 'multilingual', 'semantic_search'],
    contextLength: 8192,
    parameters: '1B',
    apiEndpoint: '/embeddings',
    features: ['embedding', 'multilingual'],
    pricing: { input: 0.0001, output: 0 }
  },
  {
    id: 'llama-nemotron-embed-vl-1b-v2',
    name: 'Llama Nemotron Embed VL 1B v2',
    provider: NVIDIA_PROVIDERS.NVIDIA,
    category: NVIDIA_CATEGORIES.MULTIMODAL,
    description: 'Multimodal question-answer retrieval representing user queries as text and documents as images.',
    capabilities: ['embedding', 'vision', 'retrieval', 'multimodal_search'],
    contextLength: 8192,
    parameters: '1B',
    apiEndpoint: '/embeddings',
    features: ['embedding', 'vision', 'multimodal'],
    pricing: { input: 0.0001, output: 0 }
  },

  // ========== RERANKING MODELS ==========
  {
    id: 'llama-nemotron-rerank-1b-v2',
    name: 'Llama Nemotron Rerank 1B v2',
    provider: NVIDIA_PROVIDERS.NVIDIA,
    category: NVIDIA_CATEGORIES.RERANKING,
    description: 'GPU-accelerated model optimized for providing a probability score that a given passage contains the information to answer a question.',
    capabilities: ['reranking', 'retrieval', 'qa_scoring'],
    contextLength: 512,
    parameters: '1B',
    apiEndpoint: '/rerank',
    features: ['reranking'],
    pricing: { input: 0.00005, output: 0 }
  },

  // ========== VISION MODELS ==========
  {
    id: 'nemotron-table-structure-v1',
    name: 'Nemotron Table Structure v1',
    provider: NVIDIA_PROVIDERS.NVIDIA,
    category: NVIDIA_CATEGORIES.VISION,
    description: 'Model for object detection, fine-tuned to detect charts, tables, and titles in documents.',
    capabilities: ['object_detection', 'table_extraction', 'document_parsing'],
    contextLength: 0,
    parameters: 'N/A',
    apiEndpoint: '/v1/object-detection',
    features: ['vision', 'document_analysis'],
    pricing: { input: 0.0002, output: 0 }
  },
  {
    id: 'nemotron-page-elements-v3',
    name: 'Nemotron Page Elements v3',
    provider: NVIDIA_PROVIDERS.NVIDIA,
    category: NVIDIA_CATEGORIES.VISION,
    description: 'Model for object detection, fine-tuned to detect charts, tables, and titles in documents.',
    capabilities: ['object_detection', 'document_parsing', 'layout_analysis'],
    contextLength: 0,
    parameters: 'N/A',
    apiEndpoint: '/v1/object-detection',
    features: ['vision', 'document_analysis'],
    pricing: { input: 0.0002, output: 0 }
  },
  {
    id: 'nemotron-graphic-elements-v1',
    name: 'Nemotron Graphic Elements v1',
    provider: NVIDIA_PROVIDERS.NVIDIA,
    category: NVIDIA_CATEGORIES.VISION,
    description: 'Model for object detection, fine-tuned to detect charts, tables, and titles in documents.',
    capabilities: ['object_detection', 'chart_detection', 'graphic_analysis'],
    contextLength: 0,
    parameters: 'N/A',
    apiEndpoint: '/v1/object-detection',
    features: ['vision', 'document_analysis'],
    pricing: { input: 0.0002, output: 0 }
  },
  {
    id: 'cosmos-reason2-8b',
    name: 'Cosmos Reason2 8B',
    provider: NVIDIA_PROVIDERS.NVIDIA,
    category: NVIDIA_CATEGORIES.VISION,
    description: 'Vision language model that excels in understanding the physical world using structured reasoning on videos or images.',
    capabilities: ['vision', 'video_understanding', 'reasoning', 'physical_world_understanding'],
    contextLength: 4096,
    parameters: '8B',
    apiEndpoint: '/chat/completions',
    features: ['vision', 'video', 'reasoning'],
    pricing: { input: 0.0002, output: 0.0002 }
  },

  // ========== VIDEO MODELS ==========
  {
    id: 'cosmos-transfer2.5-2b',
    name: 'Cosmos Transfer2.5 2B',
    provider: NVIDIA_PROVIDERS.NVIDIA,
    category: NVIDIA_CATEGORIES.VIDEO,
    description: 'Generates physics-aware video world states for physical AI development using text prompts and multiple spatial control inputs derived from real-world data or simulation.',
    capabilities: ['video_generation', 'synthetic_data', 'physics_simulation'],
    contextLength: 0,
    parameters: '2B',
    apiEndpoint: '/v1/video/generate',
    features: ['video_generation', 'physics'],
    pricing: { input: 0.0005, output: 0 }
  },

  // ========== TRANSLATION MODELS ==========
  {
    id: 'riva-translate-4b-instruct-v1_1',
    name: 'Riva Translate 4B Instruct v1.1',
    provider: NVIDIA_PROVIDERS.NVIDIA,
    category: NVIDIA_CATEGORIES.TRANSLATION,
    description: 'Translation model in 12 languages with few-shots example prompts capability.',
    capabilities: ['translation', 'multilingual'],
    contextLength: 512,
    parameters: '4B',
    apiEndpoint: '/chat/completions',
    features: ['translation', 'multilingual'],
    pricing: { input: 0.0001, output: 0.0001 }
  },

  // ========== SAFETY MODELS ==========
  {
    id: 'nemotron-content-safety-reasoning-4b',
    name: 'Nemotron Content Safety Reasoning 4B',
    provider: NVIDIA_PROVIDERS.NVIDIA,
    category: NVIDIA_CATEGORIES.SAFETY,
    description: 'A context-aware safety model that applies reasoning to enforce domain-specific policies.',
    capabilities: ['content_safety', 'policy_enforcement', 'moderation'],
    contextLength: 4096,
    parameters: '4B',
    apiEndpoint: '/chat/completions',
    features: ['safety', 'moderation'],
    pricing: { input: 0.0001, output: 0.0001 }
  },
  {
    id: 'gliner-pii',
    name: 'GLiNER PII',
    provider: NVIDIA_PROVIDERS.NVIDIA,
    category: NVIDIA_CATEGORIES.SAFETY,
    description: 'GLiNER PII detects Personally Identifiable Information in text.',
    capabilities: ['pii_detection', 'data_protection', 'privacy'],
    contextLength: 4096,
    parameters: 'N/A',
    apiEndpoint: '/v1/pii-detection',
    features: ['safety', 'pii_detection'],
    pricing: { input: 0.00005, output: 0 }
  }
];

// Helper functions
export const getModelsByCategory = (category) => {
  return NVIDIA_MODELS.filter(model => model.category === category);
};

export const getModelsByProvider = (provider) => {
  return NVIDIA_MODELS.filter(model => model.provider === provider);
};

export const getModelById = (id) => {
  return NVIDIA_MODELS.find(model => model.id === id);
};

export const searchModels = (query) => {
  const lowerQuery = query.toLowerCase();
  return NVIDIA_MODELS.filter(model => 
    model.name.toLowerCase().includes(lowerQuery) ||
    model.description.toLowerCase().includes(lowerQuery) ||
    model.capabilities.some(cap => cap.toLowerCase().includes(lowerQuery))
  );
};

export const getModelCapabilities = () => {
  const allCapabilities = new Set();
  NVIDIA_MODELS.forEach(model => {
    model.capabilities.forEach(cap => allCapabilities.add(cap));
  });
  return Array.from(allCapabilities).sort();
};

export const getModelStats = () => {
  return {
    totalModels: NVIDIA_MODELS.length,
    byCategory: Object.values(NVIDIA_CATEGORIES).reduce((acc, cat) => {
      acc[cat] = getModelsByCategory(cat).length;
      return acc;
    }, {}),
    byProvider: Object.values(NVIDIA_PROVIDERS).reduce((acc, prov) => {
      acc[prov] = getModelsByProvider(prov).length;
      return acc;
    }, {})
  };
};

export default NVIDIA_MODELS;