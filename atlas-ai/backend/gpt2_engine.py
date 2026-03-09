"""
Atlas AI — Local GPT-2 Engine
Runs entirely on your machine. No API keys, no cloud, full privacy.
Supports streaming token-by-token generation.
Apple Silicon (MPS), CUDA, and CPU all supported.
"""

import os
import threading
from typing import Generator
from dotenv import load_dotenv

load_dotenv()

MODEL_NAME = os.getenv("MODEL_NAME", "gpt2-medium")
AGENT_NAME = os.getenv("AGENT_NAME", "Atlas")

# Lazy-load to avoid slow startup
_model = None
_tokenizer = None
_lock = threading.Lock()


def _load_model():
    """Load GPT-2 model and tokenizer (cached after first call)."""
    global _model, _tokenizer
    if _model is not None:
        return _model, _tokenizer

    with _lock:
        if _model is not None:
            return _model, _tokenizer

        print(f"🧠 Loading {MODEL_NAME}... (first run downloads ~500MB)")
        from transformers import AutoModelForCausalLM, AutoTokenizer
        import torch

        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        _model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            torch_dtype=torch.float32,
        )

        # Device selection: MPS > CUDA > CPU
        if torch.backends.mps.is_available():
            _model = _model.to("mps")
            print("⚡ Using Apple Silicon GPU (MPS)")
        elif torch.cuda.is_available():
            _model = _model.to("cuda")
            print("⚡ Using CUDA GPU")
        else:
            print("🖥️  Using CPU")

        if _tokenizer.pad_token is None:
            _tokenizer.pad_token = _tokenizer.eos_token

        _model.eval()
        print(f"✅ {MODEL_NAME} loaded successfully")
        return _model, _tokenizer


SYSTEM_CONTEXT = f"""You are {AGENT_NAME}, an intelligent AI assistant for GOAT Royalty — a music production and royalty management platform. You help music producers, artists, and rights holders with:
- Royalty calculations and music publishing
- Track catalog management and analytics
- Music industry insights and trends
- Communication management (calls, texts, video)
- Creative assistance for music production

You are direct, knowledgeable, and conversational. You have access to communication logs and music catalog data."""


class GPT2Engine:
    """Local GPT-2 text generation with conversation memory."""

    def __init__(self):
        self.conversation_histories: dict[str, list[dict]] = {}

    def _build_prompt(self, conversation_id: str, user_message: str) -> str:
        """Build a chat-formatted prompt from conversation history."""
        if conversation_id not in self.conversation_histories:
            self.conversation_histories[conversation_id] = []

        history = self.conversation_histories[conversation_id]
        history.append({"role": "user", "content": user_message})

        lines = [f"System: {SYSTEM_CONTEXT}\n"]
        # Keep last 6 exchanges to fit in GPT-2's 1024 token window
        recent = history[-12:]
        for msg in recent:
            role = "User" if msg["role"] == "user" else AGENT_NAME
            lines.append(f"{role}: {msg['content']}")
        lines.append(f"{AGENT_NAME}:")

        return "\n".join(lines)

    def generate(
        self,
        message: str,
        conversation_id: str = "default",
        max_new_tokens: int = 200,
        temperature: float = 0.8,
        top_p: float = 0.92,
    ) -> str:
        """Generate a complete response."""
        import torch

        model, tokenizer = _load_model()
        prompt = self._build_prompt(conversation_id, message)

        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=800
        )
        device = next(model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}

        with torch.no_grad():
            output = model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                temperature=temperature,
                top_p=top_p,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
                repetition_penalty=1.3,
                no_repeat_ngram_size=3,
            )

        generated = output[0][inputs["input_ids"].shape[1]:]
        text = tokenizer.decode(generated, skip_special_tokens=True)

        # Stop at next speaker turn
        for stop in ["\nUser:", f"\n{AGENT_NAME}:", "\nSystem:", "\n\n"]:
            if stop in text:
                text = text[:text.index(stop)]

        text = text.strip()

        if conversation_id in self.conversation_histories:
            self.conversation_histories[conversation_id].append(
                {"role": "assistant", "content": text}
            )

        return text

    def generate_stream(
        self,
        message: str,
        conversation_id: str = "default",
        max_new_tokens: int = 200,
        temperature: float = 0.8,
    ) -> Generator[str, None, None]:
        """Stream tokens one by one for real-time UI updates."""
        import torch
        from transformers import TextIteratorStreamer

        model, tokenizer = _load_model()
        prompt = self._build_prompt(conversation_id, message)

        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=800
        )
        device = next(model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}

        streamer = TextIteratorStreamer(
            tokenizer,
            skip_prompt=True,
            skip_special_tokens=True
        )

        generation_kwargs = dict(
            **inputs,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            top_p=0.92,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
            repetition_penalty=1.3,
            no_repeat_ngram_size=3,
            streamer=streamer,
        )

        thread = threading.Thread(target=model.generate, kwargs=generation_kwargs)
        thread.start()

        full_response = []
        stop_tokens = ["User:", f"{AGENT_NAME}:", "System:"]

        for token_text in streamer:
            should_stop = False
            for stop in stop_tokens:
                if stop in token_text:
                    token_text = token_text[:token_text.index(stop)]
                    should_stop = True

            if token_text:
                full_response.append(token_text)
                yield token_text

            if should_stop:
                break

        thread.join()

        complete = "".join(full_response).strip()
        if conversation_id in self.conversation_histories:
            self.conversation_histories[conversation_id].append(
                {"role": "assistant", "content": complete}
            )

    def summarize(self, text: str) -> str:
        """Generate a quick summary of text (for comm logs)."""
        prompt = f"Summarize this briefly:\n{text[:500]}\n\nSummary:"
        import torch

        model, tokenizer = _load_model()
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=600)
        device = next(model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}

        with torch.no_grad():
            output = model.generate(
                **inputs,
                max_new_tokens=80,
                temperature=0.5,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
            )

        generated = output[0][inputs["input_ids"].shape[1]:]
        summary = tokenizer.decode(generated, skip_special_tokens=True)
        for stop in [".", "\n"]:
            if stop in summary:
                summary = summary[:summary.index(stop) + 1]
                break
        return summary.strip()

    def clear_history(self, conversation_id: str):
        self.conversation_histories.pop(conversation_id, None)

    def get_history(self, conversation_id: str) -> list[dict]:
        return self.conversation_histories.get(conversation_id, [])


# Singleton
gpt2 = GPT2Engine()


def preload_model():
    """Call this at startup to pre-download/load the model."""
    _load_model()