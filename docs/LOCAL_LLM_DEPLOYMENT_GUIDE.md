# Complete Guide: Saving and Deploying LLM Data Locally

## Overview

This guide covers how to save, store, and deploy Large Language Models (LLMs) on your local computer or server, giving you full control over your AI data without relying on cloud services.

---

## Part 1: LLM Storage Formats

### 1. GGUF (GPT-Optimized Unified Format) - **RECOMMENDED**
The most popular format for local LLM deployment. GGUF files are optimized for CPU inference and work with most local AI tools.

**Advantages:**
- Single file contains model + metadata
- Efficient memory usage
- Works on CPU, GPU, and Apple Silicon
- Wide compatibility

**Where to get GGUF models:**
- [Hugging Face - GGUF models](https://huggingface.co/models?search=gguf)
- [TheBloke quantized models](https://huggingface.co/TheBloke)

### 2. GGML (Legacy Format)
Older format, being replaced by GGUF. Still works with older tools but lacks some optimizations.

### 3. ONNX (Open Neural Network Exchange)
Cross-framework format for maximum compatibility. Good for production deployments.

```python
# Convert to ONNX
from transformers import AutoModelForCausalLM
from optimum.onnxruntime import ORTModelForCausalLM

model = AutoModelForCausalLM.from_pretrained("model-name")
ort_model = ORTModelForCausalLM.from_pretrained(model, export=True)
ort_model.save_pretrained("./onnx-model")
```

### 4. PyTorch/SafeTensors
Native format for PyTorch models. Best for training and fine-tuning.

### 5. Pickle/HDF5
Python serialization formats. Simple but less efficient for large models.

---

## Part 2: Tools for Running LLMs Locally

### 1. Ollama - **EASIEST OPTION**

**Installation:**
```bash
# Linux/macOS
curl -fsSL https://ollama.com/install.sh | sh

# Windows - Download from https://ollama.com/download
```

**Usage:**
```bash
# Download and run a model
ollama run llama3
ollama run mistral
ollama run deepseek-r1

# List downloaded models
ollama list

# Create custom model from GGUF
echo "FROM ./your-model.gguf" > Modelfile
ollama create mymodel -f Modelfile
ollama run mymodel
```

**OpenAI-Compatible API:**
```bash
# Start Ollama server (runs automatically)
# API endpoint: http://localhost:11434

# Use with OpenAI SDK
curl http://localhost:11434/v1/chat/completions \
  -d '{"model": "llama3", "messages": [{"role": "user", "content": "Hello"}]}'
```

### 2. LM Studio - **BEST GUI OPTION**

**Features:**
- Beautiful desktop application
- Model browser for Hugging Face
- GPU acceleration
- Local API server
- Multi-model support

**Download:** https://lmstudio.ai/

**Setup:**
1. Download and install LM Studio
2. Search for models in the app
3. Download your preferred model
4. Start chatting or launch API server

### 3. vLLM - **BEST FOR PRODUCTION**

**Installation:**
```bash
pip install vllm
```

**Usage:**
```bash
# Start OpenAI-compatible server
vllm serve meta-llama/Llama-2-7b-hf --port 8000

# Multi-GPU support
vllm serve meta-llama/Llama-2-70b-hf --tensor-parallel-size 2
```

**Python API:**
```python
from vllm import LLM, SamplingParams

llm = LLM(model="meta-llama/Llama-2-7b-hf")
outputs = llm.generate(["Hello, how are you?"], SamplingParams())
```

### 4. llama.cpp - **MOST FLEXIBLE**

**Installation:**
```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make  # Linux/macOS
# Windows: use Visual Studio or w64devkit
```

**Running a model:**
```bash
# Start server
./server -m model.gguf -ngl 99 -c 4096 --port 8080

# CLI inference
./main -m model.gguf -p "Your prompt here"
```

### 5. Jan - **PRIVACY-FOCUSED**

**Download:** https://jan.ai/

**Features:**
- 100% offline capable
- Import GGUF models
- Extension support
- Local API server

### 6. llamafile - **SINGLE EXECUTABLE**

**Download pre-built llamafiles:**
- https://github.com/Mozilla-Ocho/llamafile

**Usage:**
```bash
# Make executable (Linux/macOS)
chmod +x model.llamafile
./model.llamafile

# Windows - just run the .exe file
```

---

## Part 3: Saving Your Own LLM Data

### 1. Downloading Models from Hugging Face

```python
from huggingface_hub import hf_hub_download

# Download GGUF model
model_path = hf_hub_download(
    repo_id="TheBloke/Llama-2-7B-GGUF",
    filename="llama-2-7b.Q4_K_M.gguf",
    local_dir="./models"
)
print(f"Model saved to: {model_path}")
```

### 2. Saving Fine-Tuned Models

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load and fine-tune your model
model = AutoModelForCausalLM.from_pretrained("base-model")
tokenizer = AutoTokenizer.from_pretrained("base-model")

# ... fine-tuning code ...

# Save model locally
model.save_pretrained("./my-finetuned-model")
tokenizer.save_pretrained("./my-finetuned-model")

# Save in GGUF format for Ollama
# Use llama.cpp's convert script
```

### 3. Saving Training Data & Embeddings

```python
import json
import numpy as np

# Save training data
training_data = {
    "conversations": [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there!"}
    ]
}

with open("training_data.json", "w") as f:
    json.dump(training_data, f)

# Save embeddings
embeddings = np.array([...])  # Your embedding vectors
np.save("embeddings.npy", embeddings)

# Load embeddings later
loaded_embeddings = np.load("embeddings.npy")
```

---

## Part 4: Setting Up a Local LLM Server

### Complete Server Setup Script

```bash
#!/bin/bash
# setup-local-llm.sh

# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Download models
ollama pull llama3
ollama pull mistral
ollama pull deepseek-r1

# 3. Create API wrapper (Python)
cat > llm_server.py << 'EOF'
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

OLLAMA_URL = "http://localhost:11434"

@app.route("/v1/chat/completions", methods=["POST"])
def chat():
    data = request.json
    response = requests.post(
        f"{OLLAMA_URL}/api/chat",
        json={
            "model": data.get("model", "llama3"),
            "messages": data.get("messages", []),
            "stream": False
        }
    )
    return jsonify(response.json())

@app.route("/v1/models", methods=["GET"])
def list_models():
    response = requests.get(f"{OLLAMA_URL}/api/tags")
    return jsonify(response.json())

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
EOF

# 4. Install dependencies
pip install flask requests

# 5. Start services
ollama serve &
python llm_server.py
```

### Docker Setup

```dockerfile
# Dockerfile
FROM ollama/ollama:latest

# Pre-download models
RUN ollama pull llama3

EXPOSE 11434
CMD ["ollama", "serve"]
```

```yaml
# docker-compose.yml
version: '3'
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

volumes:
  ollama_data:
```

---

## Part 5: Storage Requirements

| Model Size | Parameters | RAM Required | Disk Space |
|------------|------------|--------------|------------|
| Small      | 7B         | 8GB          | 4-8GB      |
| Medium     | 13B        | 16GB         | 8-12GB     |
| Large      | 70B        | 64GB         | 40-48GB    |
| X-Large    | 120B+      | 128GB+       | 80GB+      |

### Quantization Impact

| Quantization | Model Size | Quality Loss |
|--------------|------------|--------------|
| Q4_K_M       | ~25% of FP16 | Minimal |
| Q5_K_M       | ~30% of FP16 | Very Low |
| Q6_K         | ~35% of FP16 | Negligible |
| Q8_0         | ~50% of FP16 | None |

---

## Part 6: GPU vs CPU Considerations

### GPU Requirements
- **NVIDIA:** RTX 3060 (12GB) minimum for 7B models
- **AMD:** RX 6800 XT (16GB) for good performance
- **Apple Silicon:** M1/M2/M3 with unified memory

### CPU-Only Setup
- Use GGUF format with Q4 quantization
- Expect 2-10 tokens/second on modern CPUs
- Use llama.cpp for best CPU performance

---

## Quick Start Commands

```bash
# Option 1: Ollama (Easiest)
curl -fsSL https://ollama.com/install.sh | sh
ollama run llama3

# Option 2: LM Studio (GUI)
# Download from https://lmstudio.ai

# Option 3: llamafile (Portable)
wget https://huggingface.co/Mozilla/llava-v1.5-7b-q4.llamafile
chmod +x llava-v1.5-7b-q4.llamafile
./llava-v1.5-7b-q4.llamafile

# Option 4: vLLM (Production)
pip install vllm
vllm serve meta-llama/Llama-2-7b-hf
```

---

## Security & Privacy Best Practices

1. **Firewall:** Block external access to local LLM ports
2. **Encryption:** Encrypt stored model files with sensitive data
3. **Access Control:** Use authentication for API endpoints
4. **Data Sanitization:** Clean prompts of PII before processing
5. **Audit Logs:** Keep logs of all model interactions

---

## Resources

- [Ollama Documentation](https://ollama.com/docs)
- [Hugging Face Models](https://huggingface.co/models)
- [llama.cpp GitHub](https://github.com/ggerganov/llama.cpp)
- [vLLM Documentation](https://vllm.readthedocs.io)
- [LocalLLaMA Reddit](https://reddit.com/r/LocalLLaMA)

---

*This guide is part of the SUPER GOAT ROYALTY APP documentation.*