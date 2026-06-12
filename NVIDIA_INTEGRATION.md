# NVIDIA NIM Integration - Super GOAT AI Hub

## Overview

The GOAT Royalty App now features comprehensive integration with **NVIDIA NGC Catalog**, providing access to **215+ AI models** through the NVIDIA NIM (NVIDIA Inference Microservices) API.

## Features

### 🚀 Super GOAT AI Hub
- **Centralized Interface**: Access all 215+ NVIDIA NGC models from a single hub
- **Model Categories**: Text/Chat, Code Generation, Multimodal, Embeddings, Reranking, Vision, Video, Translation, Safety, Audio
- **Advanced Parameters**: Full control over temperature, max tokens, top P, top K, and more
- **Real-time Streaming**: Streaming responses for fast, interactive conversations
- **Model Comparison**: Benchmark and compare model performance

### 🧠 GOAT Force LLM
- **Specialized Tasks**: Royalty Analysis, Contract Analysis, Artist Development, Music Analysis, Legal Advisor, General Assistant
- **Domain Expertise**: Music industry-specific knowledge and capabilities
- **Task-Specific Models**: Automatic model selection optimized for each task
- **Conversation Stats**: Track messages, tokens, and costs in real-time

## Available Models

### Text / Chat LLMs
- **Llama 3.1 405B/70B/8B Instruct** - State-of-the-art open LLMs
- **DeepSeek V3** - 685B reasoning LLM with agentic tools
- **Qwen 3.5 122B/397B** - MoE models for coding and multimodal tasks
- **GLM 4/4.7/5** - Multilingual agentic models with strong reasoning
- **Mistral Large 2407** - Complex reasoning and multilingual tasks
- **MiniMax M2.5** - 230B-parameter model for coding and office tasks
- **Kimi K2.5** - 1T multimodal MoE for video/image understanding
- **Kimi K2 Thinking** - Open reasoning model with 256K context
- **Step 3.5 Flash** - 200B reasoning engine with sparse MoE
- **Nemotron 3 Nano 30B** - 1M context MoE model

### Code Generation Models
- **Devstral 2 123B Instruct** - State-of-the-art code model with 256K context
- **Code Llama 34B Instruct** - Specialized code generation
- **Qwen 2.5 Coder 32B Instruct** - Advanced programming tasks

### Multimodal Models
- **LlaVA-NeXT 34B/72B** - Vision-language models
- **Qwen 3.5 397B A17B** - Advanced vision, chat, RAG capabilities
- **Kimi K2.5** - Video and image understanding
- **Llama Nemotron Embed VL 1B** - Multimodal QA retrieval

### Embedding Models
- **Llama Nemotron Embed 1B v2** - Multilingual, cross-lingual embeddings (26 languages)

### Reranking Models
- **Llama Nemotron Rerank 1B v2** - Passage scoring for QA systems

### Vision Models
- **Nemotron Table Structure v1** - Table detection in documents
- **Nemotron Page Elements v3** - Document layout analysis
- **Nemotron Graphic Elements v1** - Chart and graphic detection
- **Cosmos Reason2 8B** - Physical world video/image understanding

### Video Models
- **Cosmos Transfer2.5 2B** - Physics-aware video world states

### Translation Models
- **Riva Translate 4B Instruct** - 12 languages with few-shot prompts

### Safety Models
- **Nemotron Content Safety Reasoning 4B** - Context-aware safety with reasoning
- **GLiNER PII** - Personally Identifiable Information detection

## API Endpoints

### `/api/super-goat-ai`
Main API endpoint for all NVIDIA NIM operations.

**Actions:**
- `chat` - Chat completions
- `stream` - Streaming chat responses
- `listModels` - List available models
- `getModelInfo` - Get model information
- `embedding` - Generate embeddings
- `rerank` - Rerank documents
- `generateCode` - Generate code
- `healthCheck` - Check service health

**Example Request:**
```json
{
  "action": "chat",
  "model": "llama-3_1-70b-instruct",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "options": {
    "temperature": 0.7,
    "maxTokens": 2048
  }
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "choices": [
      {
        "message": {
          "role": "assistant",
          "content": "Hello! How can I help you today?"
        }
      }
    ]
  },
  "provider": "nvidia",
  "model": "llama-3_1-70b-instruct",
  "latency": 1250
}
```

## Configuration

### Environment Variables

Add to your `.env.local` file:

```env
# NVIDIA API Key (Required)
NVIDIA_API_KEY=your_nvidia_api_key_here
NEXT_PUBLIC_NVIDIA_API_KEY=your_nvidia_api_key_here

# Google AI Studio API Key
GOOGLE_AI_API_KEY=AIzaSyBNrZ-P8-n5NxzsceYDZUwrrkPSd3LtEks
NEXT_PUBLIC_GOOGLE_AI_API_KEY=AIzaSyBNrZ-P8-n5NxzsceYDZUwrrkPSd3LtEks

# Feature Flags
NEXT_PUBLIC_ENABLE_NVIDIA_NIM=true
NEXT_PUBLIC_ENABLE_GOOGLE_AI=true
NEXT_PUBLIC_ENABLE_STREAMING=true
NEXT_PUBLIC_ENABLE_CODE_GENERATION=true
NEXT_PUBLIC_ENABLE_MULTIMODAL=true

# Model Configuration
NEXT_PUBLIC_DEFAULT_MODEL=llama-3_1-70b-instruct
NEXT_PUBLIC_DEFAULT_CODE_MODEL=devstral-2-123b-instruct-2512
NEXT_PUBLIC_DEFAULT_EMBEDDING_MODEL=llama-nemotron-embed-1b-v2
```

## Getting NVIDIA API Key

1. Visit [https://build.nvidia.com/](https://build.nvidia.com/)
2. Sign in or create an NVIDIA account
3. Navigate to API Keys section
4. Generate a new API key
5. Add to your `.env.local` file

## Usage Examples

### Chat with a Model
```javascript
import nvidiaClient from '../lib/nvidiaNimClient';

const response = await nvidiaClient.chat({
  model: 'llama-3_1-70b-instruct',
  messages: [
    { role: 'user', content: 'Explain music royalties' }
  ],
  temperature: 0.7,
  maxTokens: 2048
});
```

### Generate Embeddings
```javascript
const response = await nvidiaClient.embedding({
  model: 'llama-nemotron-embed-1b-v2',
  input: 'Music streaming platforms',
  inputType: 'query'
});
```

### Generate Code
```javascript
const response = await nvidiaClient.generateCode({
  language: 'javascript',
  task: 'Calculate music royalties',
  model: 'devstral-2-123b-instruct-2512'
});
```

### Stream Chat Responses
```javascript
for await (const chunk of nvidiaClient.streamChat({
  model: 'llama-3_1-70b-instruct',
  messages: [{ role: 'user', content: 'Tell me about royalties' }]
})) {
  console.log(chunk);
}
```

## Pages

- `/super-goat-ai` - Super GOAT AI Hub (Main interface)
- `/goat-force-llm` - GOAT Force LLM (Specialized music industry AI)

## Components

- `components/SuperGoatAIHub.js` - Main AI hub component
- `components/GoatForceLLM.js` - Specialized LLM for music industry
- `lib/nvidiaModels.js` - Model registry and metadata
- `lib/nvidiaNimClient.js` - NVIDIA NIM API client

## Architecture

```
GOAT Royalty App
├── Super GOAT AI Hub
│   ├── Model Selection UI
│   ├── Chat Interface
│   ├── Parameter Controls
│   └── Streaming Support
├── GOAT Force LLM
│   ├── Specialized Tasks
│   ├── Domain-Specific Prompts
│   └── Conversation Stats
└── NVIDIA NIM Client
    ├── Chat Completions
    ├── Embeddings
    ├── Reranking
    ├── Code Generation
    └── Multi-Model Support
```

## Benefits

- **215+ Models**: Access to the latest AI models from NVIDIA and partners
- **Multi-Modal**: Text, vision, video, audio capabilities
- **High Performance**: GPU-accelerated inference
- **Scalable**: Deploy on your own GPU infrastructure
- **Cost-Effective**: Competitive pricing with transparent costs
- **Industry Expertise**: Specialized for music royalty use cases

## Future Enhancements

- [ ] RAG (Retrieval Augmented Generation) pipeline
- [ ] Multi-agent collaboration system
- [ ] Autonomous task orchestration
- [ ] Advanced document understanding
- [ ] Video analysis and understanding
- [ ] Audio processing and transcription
- [ ] Custom model fine-tuning
- [ ] Batch processing capabilities

## Support

For issues or questions about NVIDIA NIM integration, visit:
- [NVIDIA NIM Documentation](https://docs.nvidia.com/nim/)
- [NVIDIA NGC Catalog](https://catalog.ngc.nvidia.com/)
- [NVIDIA Developer Forums](https://forums.developer.nvidia.com/)