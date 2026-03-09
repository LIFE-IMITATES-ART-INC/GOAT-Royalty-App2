# NVIDIA NIM Integration Guide

## Overview

The GOAT Royalty App now integrates NVIDIA's NIM (NVIDIA Inference Microservices) platform, providing access to 215+ state-of-the-art AI models for enhanced functionality.

## Features Implemented

### 1. NVIDIA NIM Hub Page
- Location: /nvidia-nim-hub
- Features:
  - Browse 215+ NVIDIA AI models
  - Filter by category (Code, RAG, Vision, Video, Audio, Reasoning, Safety, Translation)
  - Search functionality
  - Live metrics display
  - GOAT Apps integration showing which models power which features

### 2. Super Shazam - AI Music Recognition
- Location: /super-shazam
- Features:
  - Audio recording and analysis
  - Track identification with confidence scores
  - Royalty estimation breakdown
  - ISRC code detection
  - Copyright information display
- Powered by: Nemotron Audio 2B model

### 3. API Endpoints

All NVIDIA NIM API endpoints are located under /pages/api/nvidia/:

#### General Model Call
- Endpoint: /api/nvidia/nim-call
- Method: POST
- Body: { model, prompt, options }
- Description: Generic endpoint to call any NIM model

#### Royalty Calculation
- Endpoint: /api/nvidia/royalty-calc
- Method: POST
- Body: { salesData, metadata }
- Powered by: DeepSeek V3.2
- Features:
  - Mechanical royalties calculation
  - Performance royalties calculation
  - Synchronization royalties calculation
  - Digital streaming royalties calculation

#### Video Analysis
- Endpoint: /api/nvidia/video-analysis
- Method: POST
- Body: { videoDescription, timestamp }
- Powered by: Kimi K2.5
- Features:
  - Visual element identification
  - Camera movement detection
  - Lighting analysis
  - Color palette extraction
  - Copyrighted content detection
  - Music mood suggestions

#### RAG Query
- Endpoint: /api/nvidia/rag-query
- Method: POST
- Body: { query, context }
- Powered by: Qwen 3.5 397B
- Features:
  - Context-aware responses
  - Source citations
  - Confidence scores

#### Code Generation
- Endpoint: /api/nvidia/code-gen
- Method: POST
- Body: { description, language, model }
- Powered by: Nemotron 3 Nano / GLM 4.7
- Features:
  - Code generation with comments
  - Error handling
  - Multiple language support

#### Audio Recognition
- Endpoint: /api/nvidia/audio-recognition
- Method: POST
- Body: { audioData }
- Powered by: Nemotron Audio 2B
- Features:
  - Track identification
  - Artist and album detection
  - BPM and key detection
  - ISRC code lookup

#### Available Models
- Endpoint: /api/nvidia/models
- Method: GET
- Returns: List of all available NVIDIA NIM models by category

## Configuration

### Environment Variables

Create a .env.local file in the root directory with:

```
NVIDIA_NIM_API_KEY=your_nvidia_nim_api_key_here
```

### Getting Your NVIDIA NIM API Key

1. Visit https://build.nvidia.com/
2. Sign in or create an account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key to your .env.local file

## Models Available

### Code Generation Models
- Nemotron 4 340B - Advanced code generation with 1M context
- MiniMax M2.5 - 230B-parameter coding and reasoning model
- GLM 4.7 - Multilingual agentic coding partner

### Reasoning Models
- DeepSeek V3.2 - 685B reasoning LLM with sparse attention
- GLM-5 - 744B MoE for complex reasoning
- Step 3.5 Flash - Fast reasoning engine

### Vision Models
- Kimi K2.5 - 1T multimodal MoE for video understanding
- Qwen 3.5 397B - Next-gen VLM with advanced vision capabilities

### RAG Models
- Qwen 3.5 397B - Advanced RAG and retrieval capabilities

### Audio Models
- Nemotron Audio 2B - Audio recognition and analysis

## Usage Examples

### Calling the Royalty Calculator

```javascript
const response = await fetch('/api/nvidia/royalty-calc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    salesData: {
      streams: 1000000,
      downloads: 50000,
      physical: 1000
    },
    metadata: {
      artist: 'GOAT Force',
      label: 'FASTASSMAN Publishing Inc',
      isrc: 'US-2025-GOAT-001'
    }
  })
});

const result = await response.json();
```

### Using the Video Analysis

```javascript
const response = await fetch('/api/nvidia/video-analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoDescription: 'Music video with dark lighting and urban setting',
    timestamp: '1:23'
  })
});

const analysis = await response.json();
```

## Live Demo

The app is currently running at: https://00cyw.app.super.myninja.ai

### Pages to Visit
- Homepage: https://00cyw.app.super.myninja.ai/
- NIM Hub: https://00cyw.app.super.myninja.ai/nvidia-nim-hub
- Super Shazam: https://00cyw.app.super.myninja.ai/super-shazam

## Next Steps

1. Add your NVIDIA NIM API key to enable real AI model calls
2. Test each endpoint with your specific use cases
3. Integrate these AI capabilities into your existing workflows
4. Monitor API usage and optimize for cost efficiency

## Support

For issues or questions:
- GitHub: https://github.com/DJSPEEDYGA/GOAT-Royalty-App2
- NVIDIA NIM Documentation: https://build.nvidia.com/docs