/**
 * Super GOAT AI Hub
 * Centralized interface for accessing 215+ NVIDIA NGC models and all AI capabilities
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Zap, Brain, Code, Image, Video, Globe, Shield,
  Search, Filter, ChevronDown, ChevronUp, Sparkles,
  ArrowRight, Play, Pause, Settings, Sliders, CheckCircle,
  Clock, DollarSign, Hash, Database, FileText, Target,
  Layers, Network, Bot, MessageSquare, FileCode, Eye,
  Mic, Music, Waves, BarChart2, TrendingUp, Users,
  BookOpen, Lock, Unlock, Star, Copy, Download, Share2
} from 'lucide-react';
import nvidiaClient, { NVIDIA_MODELS } from '../lib/nvidiaNimClient';
import { 
  NVIDIA_CATEGORIES, 
  getModelsByCategory,
  searchModels,
  getModelCapabilities
} from '../lib/nvidiaModels';

// Category definitions with icons and colors
const CATEGORY_CONFIG = {
  [NVIDIA_CATEGORIES.TEXT_CHAT]: {
    icon: MessageSquare,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    label: 'Text & Chat'
  },
  [NVIDIA_CATEGORIES.CODE_GENERATION]: {
    icon: Code,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    label: 'Code Generation'
  },
  [NVIDIA_CATEGORIES.MULTIMODAL]: {
    icon: Eye,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    label: 'Multimodal'
  },
  [NVIDIA_CATEGORIES.EMBEDDING]: {
    icon: Database,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    label: 'Embeddings'
  },
  [NVIDIA_CATEGORIES.RERANKING]: {
    icon: Layers,
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-500/20',
    borderColor: 'border-teal-500/30',
    label: 'Reranking'
  },
  [NVIDIA_CATEGORIES.VISION]: {
    icon: Image,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/30',
    label: 'Vision'
  },
  [NVIDIA_CATEGORIES.VIDEO]: {
    icon: Video,
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/20',
    borderColor: 'border-violet-500/30',
    label: 'Video'
  },
  [NVIDIA_CATEGORIES.TRANSLATION]: {
    icon: Globe,
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-500/20',
    borderColor: 'border-indigo-500/30',
    label: 'Translation'
  },
  [NVIDIA_CATEGORIES.SAFETY]: {
    icon: Shield,
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    label: 'Safety'
  },
  [NVIDIA_CATEGORIES.AUDIO]: {
    icon: Mic,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    label: 'Audio'
  }
};

export default function SuperGoatAIHub() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [models, setModels] = useState(NVIDIA_MODELS);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
    topK: 1,
    stream: true
  });
  const [capabilities] = useState(getModelCapabilities());
  const [stats, setStats] = useState({});

  // Load stats
  useEffect(() => {
    setStats({
      totalModels: NVIDIA_MODELS.length,
      byCategory: Object.values(NVIDIA_CATEGORIES).reduce((acc, cat) => {
        acc[cat] = getModelsByCategory(cat).length;
        return acc;
      }, {})
    });
  }, []);

  // Filter models
  useEffect(() => {
    let filtered = NVIDIA_MODELS;

    if (activeCategory !== 'all') {
      filtered = getModelsByCategory(activeCategory);
    }

    if (searchQuery) {
      filtered = searchModels(searchQuery);
    }

    setModels(filtered);
  }, [activeCategory, searchQuery]);

  // Select default model
  useEffect(() => {
    if (!selectedModel && models.length > 0) {
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedModel || isLoading) return;

    const userMessage = { role: 'user', content: inputMessage };
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await nvidiaClient.chat({
        model: selectedModel.id,
        messages: [...chatMessages, userMessage],
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        topP: settings.topP,
        topK: settings.topK,
        stream: settings.stream
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.choices?.[0]?.message?.content || response.message?.content || 'No response generated'
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Brain className="w-7 h-7" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Super GOAT AI Hub
                </h1>
                <p className="text-sm text-gray-400">215+ NVIDIA NGC Models • Unlimited Possibilities</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <Cpu className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">{stats.totalModels}</span>
                <span className="text-sm text-gray-400">Models</span>
              </div>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Model Selection */}
          <div className="col-span-3 space-y-4">
            {/* Search */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    activeCategory === 'all'
                      ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                      : 'hover:bg-gray-800/50 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>All Models</span>
                  </div>
                  <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{stats.totalModels}</span>
                </button>

                {Object.entries(CATEGORY_CONFIG).map(([cat, config]) => {
                  const Icon = config.icon;
                  const count = stats.byCategory[cat] || 0;
                  if (count === 0) return null;

                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                        activeCategory === cat
                          ? `${config.bgColor} ${config.borderColor} border text-white`
                          : 'hover:bg-gray-800/50 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{config.label}</span>
                      </div>
                      <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Capabilities */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Capabilities
              </h3>
              <div className="flex flex-wrap gap-2">
                {capabilities.slice(0, 12).map(cap => (
                  <span
                    key={cap}
                    className="px-2 py-1 bg-gray-800/50 border border-gray-700 rounded-md text-xs text-gray-400 capitalize"
                  >
                    {cap.replace(/_/g, ' ')}
                  </span>
                ))}
                {capabilities.length > 12 && (
                  <span className="px-2 py-1 bg-gray-800/50 border border-gray-700 rounded-md text-xs text-gray-400">
                    +{capabilities.length - 12} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Chat Interface */}
          <div className="col-span-6 space-y-4">
            {/* Selected Model Info */}
            {selectedModel && (
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${CATEGORY_CONFIG[selectedModel.category]?.color || 'from-gray-600 to-gray-700'} flex items-center justify-center`}>
                      {(() => {
                        const Icon = CATEGORY_CONFIG[selectedModel.category]?.icon || Cpu;
                        return <Icon className="w-6 h-6 text-white" />;
                      })()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{selectedModel.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{selectedModel.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs bg-gray-800 px-2 py-1 rounded-md text-gray-300">
                          {selectedModel.parameters}
                        </span>
                        <span className="text-xs bg-gray-800 px-2 py-1 rounded-md text-gray-300">
                          {selectedModel.contextLength.toLocaleString()} tokens
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <Share2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedModel.features?.map(feature => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-md text-xs text-purple-300 capitalize"
                    >
                      {feature.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 h-[500px] overflow-y-auto">
              <div className="space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Bot className="w-16 h-16 mb-4 text-gray-600" />
                    <p className="text-lg font-medium mb-2">Start a conversation</p>
                    <p className="text-sm">Select a model and type your message to begin</p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-800 text-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {msg.role === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Cpu className="w-4 h-4 text-purple-400" />
                          )}
                          <span className="text-xs font-semibold capitalize">{msg.role}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
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
                  placeholder="Type your message... (Shift+Enter for new line)"
                  className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Settings & Stats */}
          <div className="col-span-3 space-y-4">
            {/* Parameters */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Parameters
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-gray-400">Temperature</label>
                    <span className="text-xs text-purple-400">{settings.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-gray-400">Max Tokens</label>
                    <span className="text-xs text-purple-400">{settings.maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="8192"
                    step="256"
                    value={settings.maxTokens}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-gray-400">Top P</label>
                    <span className="text-xs text-purple-400">{settings.topP}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.topP}
                    onChange={(e) => setSettings(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="text-xs text-gray-400">Stream Response</label>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, stream: !prev.stream }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      settings.stream ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.stream ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Model List */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Available Models
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {models.slice(0, 10).map(model => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedModel?.id === model.id
                        ? 'bg-purple-600/20 border border-purple-500/30'
                        : 'hover:bg-gray-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${CATEGORY_CONFIG[model.category]?.color || 'from-gray-600 to-gray-700'} flex items-center justify-center flex-shrink-0`}>
                        {(() => {
                          const Icon = CATEGORY_CONFIG[model.category]?.icon || Cpu;
                          return <Icon className="w-4 h-4 text-white" />;
                        })()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{model.name}</p>
                        <p className="text-xs text-gray-400 truncate">{model.provider}</p>
                      </div>
                    </div>
                  </button>
                ))}
                {models.length > 10 && (
                  <p className="text-xs text-center text-gray-400">+{models.length - 10} more models</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}