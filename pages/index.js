/**
 * GOAT Royalty App - Enhanced Landing Page
 * Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST
 * Stunning visual effects with GOAT Force Command Center integration
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Music, TrendingUp, DollarSign, Users, BarChart3, Search,
  Play, Star, Zap, Crown, Shield, Bot, Database, Cpu,
  Globe, Sparkles, ArrowRight, ChevronRight, Radio,
  Lock, Eye, Headphones, Code, MessageSquare
} from 'lucide-react';

const EnhancedLandingPage = () => {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: DollarSign,
      title: 'Royalty Tracking',
      desc: 'Track royalties across Spotify, YouTube, TikTok, Apple Music & more in real-time',
      gradient: 'from-green-600 to-emerald-600',
      stats: '$1.28M collected'
    },
    {
      icon: Database,
      title: '423+ ASCAP Works',
      desc: 'Full catalog management with ISWC/ISRC tracking and rights verification',
      gradient: 'from-purple-600 to-indigo-600',
      stats: '423 registered works'
    },
    {
      icon: Bot,
      title: '6 AI Agents',
      desc: 'Ms. Moneypenny, Codex, Ms. Vanessa, SuperNinja, Gemini & NVIDIA NIM',
      gradient: 'from-blue-600 to-cyan-600',
      stats: 'All agents active'
    },
    {
      icon: Shield,
      title: 'IP Protection',
      desc: 'Bank-level security with Content ID, DMCA monitoring & copyright vault',
      gradient: 'from-orange-600 to-red-600',
      stats: '112 countries'
    },
    {
      icon: BarChart3,
      title: 'Analytics Engine',
      desc: 'AI-powered analytics with revenue prediction and growth optimization',
      gradient: 'from-pink-600 to-rose-600',
      stats: '4.99M streams'
    },
    {
      icon: Cpu,
      title: 'NVIDIA GPU Power',
      desc: 'ML-accelerated audio analysis, genre classification & revenue prediction',
      gradient: 'from-lime-600 to-green-600',
      stats: 'A100/H100 GPUs'
    }
  ];

  const agents = [
    { name: 'Ms. Moneypenny', role: 'Royalty Collection', color: 'text-green-400', icon: DollarSign },
    { name: 'Codex', role: 'Strategic Operations', color: 'text-purple-400', icon: Code },
    { name: 'Ms. Vanessa', role: 'AI Assistant', color: 'text-pink-400', icon: Bot },
    { name: 'SuperNinja AI', role: 'Strategy Optimization', color: 'text-orange-400', icon: Zap },
    { name: 'Gemini Copilot', role: 'Google AI Analysis', color: 'text-blue-400', icon: Sparkles },
    { name: 'NVIDIA NIM', role: 'ML/GPU Compute', color: 'text-lime-400', icon: Cpu },
  ];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  GOAT Royalty
                </span>
                <p className="text-[10px] text-gray-500">v2.0 Empire Edition</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="/command-center" className="text-white/80 hover:text-white transition-colors text-sm">Command Center</a>
              <a href="/analytics" className="text-white/80 hover:text-white transition-colors text-sm">Analytics</a>
              <a href="/publishing" className="text-white/80 hover:text-white transition-colors text-sm">Publishing</a>
              <a href="/asap-catalog" className="text-white/80 hover:text-white transition-colors text-sm">Catalog</a>
              <a href="/ms-vanessa" className="text-white/80 hover:text-white transition-colors text-sm">AI Assistant</a>
              <button 
                onClick={() => router.push('/command-center')}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Launch App
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`relative z-10 pt-32 pb-20 px-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-purple-300">All 6 AI Agents Active • 423+ Works Protected • $1.28M Collected</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              The Ultimate Music
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Royalty Command Center
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            AI-powered royalty tracking, catalog management, and revenue optimization 
            for artists and rights holders. Powered by 6 specialized AI agents, 
            NVIDIA GPU computing, and Google Gemini intelligence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
            <button 
              onClick={() => router.push('/command-center')}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl overflow-hidden transform hover:scale-105 transition-all shadow-lg shadow-purple-500/25"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <Crown className="w-5 h-5" />
                <span>Launch Command Center</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-8 py-4 bg-white/5 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 hover:bg-white/10 transition-all"
            >
              View Dashboard
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-20">
            {[
              { label: 'Total Collected', value: '$1,285,912', icon: DollarSign, color: 'text-green-400' },
              { label: 'ASCAP Works', value: '423+', icon: Music, color: 'text-purple-400' },
              { label: 'Total Streams', value: '4.99M', icon: Radio, color: 'text-blue-400' },
              { label: 'Countries', value: '112', icon: Globe, color: 'text-orange-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Powered by Advanced AI
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Six specialized AI agents working together to maximize your royalty revenue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all h-full">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{feature.desc}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-xs text-green-400">{feature.stats}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🐐 The GOAT Force Team
              </span>
            </h2>
            <p className="text-lg text-gray-400">Your AI-powered team of specialists</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {agents.map((agent, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all text-center group cursor-pointer"
                onClick={() => router.push('/command-center')}>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <agent.icon className={`w-6 h-6 ${agent.color}`} />
                </div>
                <h4 className="text-sm font-semibold text-white">{agent.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{agent.role}</p>
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-[10px] text-green-400">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Ready to Maximize Your Royalties?
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join the GOAT Royalty Force and take control of your music empire
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => router.push('/command-center')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25"
            >
              <span className="flex items-center space-x-2">
                <Crown className="w-5 h-5" />
                <span>Enter Command Center</span>
              </span>
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Crown className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">
              © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST. All rights reserved.
            </span>
          </div>
          <div className="flex space-x-6 text-sm text-gray-500">
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/copyright" className="hover:text-white transition-colors">Copyright</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedLandingPage;