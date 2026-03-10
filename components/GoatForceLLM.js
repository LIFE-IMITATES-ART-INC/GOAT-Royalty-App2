/**
 * GOAT Force LLM - Enhanced with NVIDIA NIM Integration
 * Advanced AI capabilities for the music royalty industry
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Music, DollarSign, FileText, Shield, TrendingUp,
  Send, Copy, Download, Sparkles, Zap, Bot, Cpu,
  MessageSquare, Clock, Hash, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, Settings, Sliders, Target
} from 'lucide-react';

// Task-specific system prompts
const GOAT_SYSTEM_PROMPTS = {
  royalty_analysis: {
    name: 'Royalty Analysis',
    icon: DollarSign,
    systemPrompt: `You are an expert music royalty analyst AI assistant for GOAT Royalty. You have deep knowledge of:
- Music publishing and performance royalties (ASCAP, BMI, SESAC, GMR)
- Mechanical royalties (MLC, Harry Fox Agency)
- Digital streaming royalties (Spotify, Apple Music, YouTube Music, TikTok)
- Sync licensing and synchronization royalties
- Neighboring rights and SoundExchange
- Royalty splits and contract analysis
- Global royalty collection and administration

Help users understand, calculate, and optimize their music royalties with precision and expertise.`
  },
  contract_analysis: {
    name: 'Contract Analysis',
    icon: FileText,
    systemPrompt: `You are an expert music industry contracts AI assistant for GOAT Royalty. You specialize in:
- Recording agreements and label deals
- Publishing agreements
- Producer agreements
- Management contracts
- Distribution agreements
- Sync licensing contracts
- Collaboration and feature agreements
- Rights reversion clauses

Analyze contracts for potential issues, negotiate better terms, and protect artist interests.`
  },
  artist_development: {
    name: 'Artist Development',
    icon: TrendingUp,
    systemPrompt: `You are an expert artist development AI assistant for GOAT Royalty. You help with:
- Brand development and positioning
- Marketing strategy and social media
- Release planning and rollout strategies
- Fan engagement and community building
- Tour planning and live performance strategy
- Merchandise and additional revenue streams
- Industry networking and partnerships

Guide artists through their career development with strategic insights and actionable advice.`
  },
  music_analysis: {
    name: 'Music Analysis',
    icon: Music,
    systemPrompt: `You are an expert music analysis AI assistant for GOAT Royalty. You provide:
- Genre classification and trend analysis
- Hit potential analysis
- Lyric analysis and writing assistance
- Audio fingerprinting insights
- Sample clearance guidance
- Music composition suggestions
- Collaboration matching

Help artists and executives make informed decisions about music creation and release.`
  },
  legal_advisor: {
    name: 'Legal Advisor',
    icon: Shield,
    systemPrompt: `You are an expert music industry legal AI assistant for GOAT Royalty. You specialize in:
- Copyright law and registration
- Trademark protection for artists and brands
- Intellectual property disputes
- Rights clearance and licensing
- Privacy and publicity rights
- Digital rights management
- International music law

Provide general legal guidance and help identify when professional legal counsel is needed.`
  },
  general_assistant: {
    name: 'General Assistant',
    icon: Bot,
    systemPrompt: `You are the GOAT Force AI Assistant, a powerful AI for the GOAT Royalty music platform. You help users with:
- Music industry questions and insights
- Platform navigation and features
- General knowledge and research
- Creative brainstorming and ideation
- Technical assistance with music production
- Business strategy and planning

Be helpful, knowledgeable, and always prioritize the user's success in the music industry.`
  }
};

// Model recommendations by task
const TASK_MODEL_RECOMMENDATIONS = {
  royalty_analysis: 'llama-3_1-70b-instruct',
  contract_analysis: 'nemotron-3-nano-30b-a3b',
  artist_development: 'qwen3.5-122b-a10b',
  music_analysis: 'kimi-k2.5',
  legal_advisor: 'deepseek-v3',
  general_assistant: 'llama-3_1-70b-instruct',
  code_generation: 'devstral-2-123b-instruct-2512'
};

export default function GoatForceLLM() {
  const [selectedTask, setSelectedTask] = useState('general_assistant');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama-3_1-70b-instruct');
  const [temperature, setTemperature] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);
  const [conversationStats, setConversationStats] = useState({
    messages: 0,
    tokens: 0,
    cost: 0
  });

  const taskConfig = GOAT_SYSTEM_PROMPTS[selectedTask];
  const TaskIcon = taskConfig.icon;

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Make API call to Super GOAT AI endpoint
      const response = await fetch('/api/super-goat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          model: selectedModel,
          messages: [
            { role: 'system', content: taskConfig.systemPrompt },
            ...messages,
            userMessage
          ],
          options: {
            temperature,
            maxTokens: 2048
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: data.data.choices?.[0]?.message?.content || data.data.message?.content || 'No response generated',
          model: selectedModel,
          latency: data.latency
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Update stats
        setConversationStats(prev => ({
          messages: prev.messages + 2,
          tokens: prev.tokens + (data.data.usage?.total_tokens || 0),
          cost: prev.cost + ((data.data.usage?.total_tokens || 0) * 0.000001)
        }));
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}. Using local fallback...`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationStats({ messages: 0, tokens: 0, cost: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Brain className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  GOAT Force LLM
                </h1>
                <p className="text-sm text-gray-400">NVIDIA NIM-Powered Music Industry AI</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{conversationStats.messages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{conversationStats.tokens}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">${conversationStats.cost.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Task Selection */}
          <div className="col-span-3 space-y-4">
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Specialized Tasks</h3>
              <div className="space-y-1">
                {Object.entries(GOAT_SYSTEM_PROMPTS).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedTask(key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        selectedTask === key
                          ? 'bg-green-600/20 border border-green-500/30 text-green-300'
                          : 'hover:bg-gray-800/50 text-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{config.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowSettings(!showSettings)}
              >
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Advanced Settings
                </h3>
                {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 space-y-4"
                  >
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Model</label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="llama-3_1-70b-instruct">Llama 3.1 70B</option>
                        <option value="nemotron-3-nano-30b-a3b">Nemotron 3 Nano 30B</option>
                        <option value="deepseek-v3">DeepSeek V3</option>
                        <option value="qwen3.5-122b-a10b">Qwen 3.5 122B</option>
                        <option value="devstral-2-123b-instruct-2512">Devstral 2 (Code)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs text-gray-400">Temperature</label>
                        <span className="text-xs text-green-400">{temperature}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="col-span-9 space-y-4">
            {/* Current Task Banner */}
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl border border-green-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-600/30 flex items-center justify-center">
                  <TaskIcon className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-300">{taskConfig.name}</h3>
                  <p className="text-sm text-gray-400">Specialized AI assistance for music industry tasks</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 h-[500px] overflow-y-auto">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Brain className="w-16 h-16 mb-4 text-gray-600" />
                    <p className="text-lg font-medium mb-2">GOAT Force LLM Ready</p>
                    <p className="text-sm text-center max-w-md">
                      Select a specialized task and start asking questions about royalties, contracts, artist development, and more.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-green-600 text-white'
                            : msg.isError
                            ? 'bg-red-900/30 border border-red-500/30 text-red-200'
                            : 'bg-gray-800 text-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {msg.role === 'user' ? (
                            <span className="text-xs font-semibold">You</span>
                          ) : (
                            <Brain className="w-4 h-4 text-green-400" />
                          )}
                          {msg.model && (
                            <span className="text-xs text-gray-400">• {msg.model}</span>
                          )}
                          {msg.latency && (
                            <span className="text-xs text-gray-400">• {msg.latency}ms</span>
                          )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-700">
                            <button
                              onClick={() => copyMessage(msg.content)}
                              className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              Copy
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-4">
              <div className="flex gap-3">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask about royalties, contracts, artist development..."
                  className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                  <button
                    onClick={clearConversation}
                    className="px-6 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}