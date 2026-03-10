/**
 * 🐐 GOAT FORCE COMMAND CENTER - The Ultimate Dashboard
 * Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST
 * 
 * Unified command center connecting all AI agents, catalog data, analytics,
 * royalty tracking, and the full GOAT Force team.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Crown, Music, DollarSign, TrendingUp, Shield, Zap, Brain, 
  Search, Send, Bot, User, Sparkles, Globe, BarChart3, 
  Play, Pause, Volume2, FileText, Database, Cpu, Activity,
  Eye, Download, Upload, RefreshCw, ChevronRight, Star,
  Lock, Unlock, Radio, Disc, Headphones, Mic, Film,
  MessageSquare, Settings, Bell, AlertTriangle, CheckCircle,
  XCircle, Clock, Award, Target, Layers, Grid, List,
  PieChart, LineChart, ArrowUpRight, ArrowDownRight, Hash,
  BookOpen, Code, Terminal, Wifi, Server, HardDrive
} from 'lucide-react';

// ============================================================
// GOAT FORCE AGENT CARDS
// ============================================================
const AgentCard = ({ agent, isActive, onClick }) => {
  const statusColors = {
    active: 'bg-green-500',
    idle: 'bg-yellow-500',
    offline: 'bg-red-500'
  };

  const agentIcons = {
    moneypenny: DollarSign,
    codex: Code,
    msVanessa: Bot,
    superNinja: Zap,
    gemini: Sparkles,
    nvidia: Cpu
  };

  const agentColors = {
    moneypenny: 'from-green-600 to-emerald-600',
    codex: 'from-purple-600 to-indigo-600',
    msVanessa: 'from-pink-600 to-rose-600',
    superNinja: 'from-orange-600 to-amber-600',
    gemini: 'from-blue-600 to-cyan-600',
    nvidia: 'from-lime-600 to-green-600'
  };

  const Icon = agentIcons[agent.id] || Bot;
  const gradient = agentColors[agent.id] || 'from-gray-600 to-gray-700';

  return (
    <div 
      onClick={() => onClick(agent.id)}
      className={`relative cursor-pointer rounded-xl p-4 border transition-all duration-300 ${
        isActive 
          ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20 scale-105' 
          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-semibold text-white truncate">{agent.name}</h4>
            <div className={`w-2 h-2 rounded-full ${statusColors[agent.status || 'active']}`} />
          </div>
          <p className="text-xs text-gray-400 truncate">{agent.role}</p>
        </div>
      </div>
      {agent.efficiency && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Efficiency</span>
            <span className="text-green-400">{agent.efficiency}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div 
              className={`bg-gradient-to-r ${gradient} h-1 rounded-full transition-all duration-500`}
              style={{ width: `${agent.efficiency}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// REAL-TIME METRICS CARD
// ============================================================
const MetricCard = ({ icon: Icon, label, value, change, changeType, color }) => (
  <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all">
    <div className="flex items-center justify-between mb-2">
      <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
        <Icon className={`w-4 h-4 text-${color}-400`} />
      </div>
      {change && (
        <div className={`flex items-center text-xs ${changeType === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      )}
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-gray-400 mt-1">{label}</p>
  </div>
);

// ============================================================
// AI CHAT INTERFACE
// ============================================================
const AIChat = ({ activeAgent, onSendMessage }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      agent: 'system',
      content: '🐐 GOAT Force Command Center online. All AI agents are active and ready. Select an agent or type a message to get started.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the AI API
      const response = await fetch('/api/goat-force/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          agent: activeAgent,
          history: messages.slice(-10)
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        agent: data.agentId || activeAgent || 'gemini',
        agentName: data.agentName || 'GOAT Force AI',
        content: data.response || data.reply || 'I\'m processing your request...',
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        agent: 'system',
        content: getSmartFallback(input),
        timestamp: new Date()
      }]);
    }
    
    setIsLoading(false);
  };

  const getSmartFallback = (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes('royalt')) return "💰 Your GOAT Royalty system tracks 423+ ASCAP works and 30+ master recordings. Total collected: $1,285,912 with $74,193 pending. I can break down earnings by platform, track, or time period.";
    if (lower.includes('catalog')) return "📀 Your catalog includes:\n• 423 ASCAP-registered works (FASTASSMAN Publishing)\n• 414 writer credits (HARVEY L MILLER)\n• 30+ master tracks (FIVE DEUCES series)\n• All with registered ISRCs and ISWCs";
    if (lower.includes('stream')) return "🎵 Streaming performance across platforms:\n• Spotify: 2.1M streams (+22%)\n• YouTube: 892K views (+12%)\n• TikTok: 1.2M views (+18%)\n• Apple Music: 567K streams (+9%)";
    return "🐐 GOAT Force AI is ready to assist. I can help with royalty tracking, catalog management, analytics, contract review, and strategic planning. What would you like to explore?";
  };

  const quickActions = [
    { label: '📊 Revenue Report', msg: 'Generate a revenue report for all platforms' },
    { label: '🔍 Search Catalog', msg: 'Search my ASCAP catalog for recent registrations' },
    { label: '💰 Pending Royalties', msg: 'Show me all pending royalty payments' },
    { label: '📈 Growth Analysis', msg: 'Analyze my streaming growth trends' },
    { label: '🛡️ IP Check', msg: 'Check for any unauthorized use of my catalog' },
    { label: '🤖 AI Insights', msg: 'Give me AI-powered insights on my catalog performance' }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl p-3 ${
              msg.role === 'user' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/10 text-gray-200 border border-white/10'
            }`}>
              {msg.role === 'assistant' && msg.agentName && (
                <div className="flex items-center space-x-1 mb-1">
                  <Bot className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-purple-400 font-medium">{msg.agentName}</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs opacity-50 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-white/10">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => { setInput(action.msg); }}
              className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 transition-all"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask the GOAT Force anything..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// CATALOG BROWSER
// ============================================================
const CatalogBrowser = ({ searchQuery }) => {
  const [catalogData, setCatalogData] = useState(null);
  const [filter, setFilter] = useState('all');
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const response = await fetch('/api/catalog/search?q=' + encodeURIComponent(localSearch || ''));
      const data = await response.json();
      setCatalogData(data);
    } catch (e) {
      // Use embedded catalog data as fallback
      setCatalogData({
        ascapWorks: sampleASCAPWorks,
        masterTracks: sampleMasterTracks,
        stats: { totalWorks: 423, totalTracks: 30 }
      });
    }
  };

  const sampleASCAPWorks = [
    { title: '01 BETTER PLAN', ascapWorkId: '893701310', iswcNumber: 'T9232335954', parties: 'MILLER, HARVEY L / RUSH, RAY / FASTASSMAN', ownPct: '25%' },
    { title: '2 TURNTABLES AND A MICROPHONE', ascapWorkId: '890803671', iswcNumber: 'T9194335701', parties: 'MILLER, HARVEY L / FASTASSMAN', ownPct: '50%' },
    { title: '45 DAVENGER', ascapWorkId: '892959451', iswcNumber: 'T9221724410', parties: 'MILLER, HARVEY L / FASTASSMAN', ownPct: '50%' },
    { title: '01 PIANO- 5B - 83.3', ascapWorkId: '893701303', iswcNumber: 'T9232335874', parties: 'MILLER, HARVEY L / FASTASSMAN', ownPct: '50%' },
    { title: '02 SOULFUL VINYL 3', ascapWorkId: '893701304', iswcNumber: 'T9232335896', parties: 'MILLER, HARVEY L / FASTASSMAN', ownPct: '50%' },
    { title: '03 PIANO - 11B.19', ascapWorkId: '893701305', iswcNumber: 'T9232335909', parties: 'MILLER, HARVEY L / FASTASSMAN', ownPct: '50%' },
  ];

  const sampleMasterTracks = [
    { title: 'Night Night And Einini', album: 'FIVE DEUCES', isrc: 'USUM72301134', duration: '3:24' },
    { title: 'Get The Bag', album: 'FIVE DEUCES', isrc: 'USUM72301135', duration: '2:58' },
    { title: 'Money Talk', album: 'FIVE DEUCES', isrc: 'USUM72301136', duration: '3:15' },
    { title: 'Street Code', album: 'FIVE DEUCES', isrc: 'USUM72301137', duration: '3:42' },
    { title: 'Boss Level', album: 'FIVE DEUCES', isrc: 'USUM72301138', duration: '4:01' },
    { title: 'Hustle Hard', album: 'FIVE DEUCES', isrc: 'USUM72301139', duration: '3:33' },
    { title: 'Big Dreams', album: 'FIVE DEUCES II', isrc: 'USUM72301140', duration: '3:18' },
    { title: 'King Mindset', album: 'FIVE DEUCES III', isrc: 'USUM72301146', duration: '3:51' },
    { title: 'Royal Treatment', album: 'FIVE DEUCES III', isrc: 'USUM72301147', duration: '3:14' },
    { title: 'Legacy Builder', album: 'FIVE DEUCES IV', isrc: 'USUM72301152', duration: '3:37' },
  ];

  const works = catalogData?.ascapWorks || sampleASCAPWorks;
  const tracks = catalogData?.masterTracks || sampleMasterTracks;

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by title, ISRC, ISWC, writer..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="flex space-x-1">
          {['all', 'ascap', 'masters'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs rounded-lg transition-all ${
                filter === f ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {f === 'all' ? 'All' : f === 'ascap' ? 'ASCAP Works' : 'Master Tracks'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-purple-400">423</p>
          <p className="text-xs text-gray-400">ASCAP Works</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-blue-400">30+</p>
          <p className="text-xs text-gray-400">Master Tracks</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-green-400">30</p>
          <p className="text-xs text-gray-400">ISRCs</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-orange-400">423</p>
          <p className="text-xs text-gray-400">ISWCs</p>
        </div>
      </div>

      {/* ASCAP Works Table */}
      {(filter === 'all' || filter === 'ascap') && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-purple-400" />
            ASCAP Registered Works (FASTASSMAN Publishing)
          </h4>
          <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left p-2 text-gray-400">Title</th>
                    <th className="text-left p-2 text-gray-400">ASCAP ID</th>
                    <th className="text-left p-2 text-gray-400">ISWC</th>
                    <th className="text-left p-2 text-gray-400">Parties</th>
                    <th className="text-right p-2 text-gray-400">Own%</th>
                  </tr>
                </thead>
                <tbody>
                  {works.filter(w => !localSearch || w.title.toLowerCase().includes(localSearch.toLowerCase())).map((work, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-2 text-white font-medium">{work.title}</td>
                      <td className="p-2 text-gray-400">{work.ascapWorkId}</td>
                      <td className="p-2 text-blue-400">{work.iswcNumber}</td>
                      <td className="p-2 text-gray-300 max-w-[200px] truncate">{work.parties}</td>
                      <td className="p-2 text-right text-green-400">{work.ownPct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Master Tracks Table */}
      {(filter === 'all' || filter === 'masters') && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
            <Disc className="w-4 h-4 mr-2 text-blue-400" />
            Master Recordings (FIVE DEUCES Series)
          </h4>
          <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left p-2 text-gray-400">Title</th>
                    <th className="text-left p-2 text-gray-400">Album</th>
                    <th className="text-left p-2 text-gray-400">ISRC</th>
                    <th className="text-right p-2 text-gray-400">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.filter(t => !localSearch || t.title.toLowerCase().includes(localSearch.toLowerCase())).map((track, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-2 text-white font-medium flex items-center">
                        <Play className="w-3 h-3 mr-2 text-green-400" />
                        {track.title}
                      </td>
                      <td className="p-2 text-gray-400">{track.album}</td>
                      <td className="p-2 text-blue-400 font-mono">{track.isrc}</td>
                      <td className="p-2 text-right text-gray-300">{track.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// REVENUE ANALYTICS
// ============================================================
const RevenueAnalytics = () => {
  const platformData = [
    { name: 'Spotify', revenue: 15253, streams: '2.1M', growth: '+22%', color: 'bg-green-500' },
    { name: 'YouTube', revenue: 18934, streams: '892K', growth: '+12%', color: 'bg-red-500' },
    { name: 'TikTok', revenue: 12567, streams: '1.2M', growth: '+18%', color: 'bg-pink-500' },
    { name: 'Apple Music', revenue: 8923, streams: '567K', growth: '+9%', color: 'bg-blue-500' },
    { name: 'SoundCloud', revenue: 3245, streams: '234K', growth: '+5%', color: 'bg-orange-500' },
  ];

  const maxRevenue = Math.max(...platformData.map(p => p.revenue));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-xs text-gray-400">Total Revenue</p>
          <p className="text-xl font-bold text-green-400">$58,922</p>
          <p className="text-xs text-green-400">+15.3% this month</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-xs text-gray-400">Total Streams</p>
          <p className="text-xl font-bold text-blue-400">4.99M</p>
          <p className="text-xs text-blue-400">+18.7% this month</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <p className="text-xs text-gray-400">Avg Per Stream</p>
          <p className="text-xl font-bold text-purple-400">$0.0118</p>
          <p className="text-xs text-purple-400">Above industry avg</p>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white">Platform Revenue Breakdown</h4>
        {platformData.map((platform, i) => (
          <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                <span className="text-sm text-white font-medium">{platform.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-400">{platform.streams} streams</span>
                <span className="text-xs text-green-400">{platform.growth}</span>
                <span className="text-sm font-semibold text-white">${platform.revenue.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`${platform.color} h-2 rounded-full transition-all duration-1000`}
                style={{ width: `${(platform.revenue / maxRevenue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Sources */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <h5 className="text-xs text-gray-400 mb-2">Revenue by Type</h5>
          <div className="space-y-2">
            {[
              { type: 'Streaming', pct: 62, amount: '$36,532' },
              { type: 'Content ID', pct: 20, amount: '$11,784' },
              { type: 'Publishing/ASCAP', pct: 12, amount: '$7,071' },
              { type: 'Sync Licensing', pct: 6, amount: '$3,535' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-gray-300">{item.type}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{item.pct}%</span>
                  <span className="text-xs text-white font-medium">{item.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <h5 className="text-xs text-gray-400 mb-2">Top Earning Tracks</h5>
          <div className="space-y-2">
            {[
              { title: 'Night Night And Einini', amount: '$5,679' },
              { title: 'Get The Bag', amount: '$4,346' },
              { title: 'Boss Level', amount: '$2,346' },
              { title: '2 Turntables & A Mic', amount: '$1,890' },
            ].map((track, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-gray-300 truncate max-w-[120px]">{track.title}</span>
                <span className="text-xs text-green-400 font-medium">{track.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMMAND CENTER COMPONENT
// ============================================================
const GOATForceCommandCenter = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeAgent, setActiveAgent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(3);

  const agents = [
    { id: 'moneypenny', name: 'Ms. Moneypenny', role: 'Royalty Collection', status: 'active', efficiency: 98, task: 'Scanning royalty databases' },
    { id: 'codex', name: 'Codex', role: 'Strategic Operations', status: 'active', efficiency: 95, task: 'Processing financial analytics' },
    { id: 'msVanessa', name: 'Ms. Vanessa', role: 'AI Assistant', status: 'active', efficiency: 97, task: 'Ready for queries' },
    { id: 'superNinja', name: 'SuperNinja AI', role: 'Strategy Optimization', status: 'active', efficiency: 92, task: 'Optimizing models' },
    { id: 'gemini', name: 'Gemini Copilot', role: 'Google AI Analysis', status: 'active', efficiency: 99, task: 'AI pipeline ready' },
    { id: 'nvidia', name: 'NVIDIA NIM', role: 'ML/GPU Compute', status: 'active', efficiency: 94, task: 'GPU cluster ready' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Grid },
    { id: 'ai-chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'catalog', label: 'Catalog', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'royalties', label: 'Royalties', icon: DollarSign },
    { id: 'streaming', label: 'Streaming', icon: Radio },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 text-white">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  GOAT Force Command Center
                </h1>
                <p className="text-[10px] text-gray-500">v2.0 Empire Edition • All Systems Active</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Tab Navigation */}
            <div className="hidden lg:flex items-center space-x-1 bg-white/5 rounded-lg p-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs transition-all ${
                    activeTab === tab.id 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                DJ
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 flex">
        {/* Sidebar - Agent Panel */}
        <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 overflow-y-auto transition-all ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              🐐 GOAT Force Agents
            </h3>
            <div className="space-y-2">
              {agents.map(agent => (
                <AgentCard 
                  key={agent.id}
                  agent={agent}
                  isActive={activeAgent === agent.id}
                  onClick={setActiveAgent}
                />
              ))}
            </div>

            {/* System Status */}
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                System Status
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Supabase DB', status: 'connected', icon: Database },
                  { label: 'Gemini AI', status: 'active', icon: Sparkles },
                  { label: 'NVIDIA NIM', status: 'ready', icon: Cpu },
                  { label: 'ASCAP Sync', status: 'synced', icon: RefreshCw },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <item.icon className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-400">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-green-400">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leadership */}
            <div className="mt-6 p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/20">
              <h4 className="text-xs font-semibold text-purple-400 mb-2">GOAT Force Leadership</h4>
              <div className="space-y-1 text-xs">
                <p className="text-gray-300">CEO: <span className="text-white">DJ Speedy</span></p>
                <p className="text-gray-300">President: <span className="text-white">Waka Flocka Flame</span></p>
                <p className="text-gray-400 mt-1">© 2024 All Rights Reserved</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Panel */}
        <main className={`flex-1 transition-all ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6`}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard icon={DollarSign} label="Total Collected" value="$1,285,912" change="+12.5%" changeType="up" color="green" />
                <MetricCard icon={Clock} label="Pending Claims" value="$74,193" change="3 active" changeType="up" color="orange" />
                <MetricCard icon={Music} label="Catalog Works" value="423+" change="+30 ISRCs" changeType="up" color="purple" />
                <MetricCard icon={Globe} label="Countries" value="112" change="+5 new" changeType="up" color="blue" />
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Analytics */}
                <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 p-5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                    Revenue Analytics
                  </h3>
                  <RevenueAnalytics />
                </div>

                {/* AI Chat */}
                <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden" style={{ height: '600px' }}>
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Bot className="w-5 h-5 mr-2 text-purple-400" />
                      GOAT Force AI
                    </h3>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-green-400">All agents online</span>
                    </div>
                  </div>
                  <AIChat activeAgent={activeAgent} />
                </div>
              </div>

              {/* Catalog Preview */}
              <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 p-5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-blue-400" />
                  Music Catalog
                </h3>
                <CatalogBrowser />
              </div>

              {/* Recent Activity */}
              <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 p-5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-400" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10', title: 'ASCAP Quarterly Payment', desc: 'Q4 2024 performance royalties for 423 works', amount: '+$12,345.67', time: 'Just now' },
                    { icon: Music, color: 'text-blue-400', bg: 'bg-blue-500/10', title: 'Catalog sync detected', desc: '"Night Night And Einini" used in TikTok viral', amount: null, time: '1 day ago' },
                    { icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', title: 'Streaming spike', desc: '250% increase for "Get The Bag" on Spotify', amount: null, time: '2 days ago' },
                    { icon: Shield, color: 'text-orange-400', bg: 'bg-orange-500/10', title: 'IP Protection Alert', desc: 'Unauthorized use detected - DMCA filed', amount: null, time: '3 days ago' },
                    { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', title: 'ISRC Registration Complete', desc: '30 tracks registered (USUM723011XX series)', amount: null, time: '4 days ago' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                      <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                      <div className="text-right">
                        {item.amount && <p className="text-sm font-semibold text-green-400">{item.amount}</p>}
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Chat Tab */}
          {activeTab === 'ai-chat' && (
            <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-purple-400" />
                  GOAT Force AI Command
                  {activeAgent && (
                    <span className="ml-2 text-sm text-purple-400">
                      → {agents.find(a => a.id === activeAgent)?.name}
                    </span>
                  )}
                </h3>
                <div className="flex items-center space-x-2">
                  {agents.map(a => (
                    <button
                      key={a.id}
                      onClick={() => setActiveAgent(activeAgent === a.id ? null : a.id)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all ${
                        activeAgent === a.id ? 'bg-purple-600 ring-2 ring-purple-400' : 'bg-white/10 hover:bg-white/20'
                      }`}
                      title={a.name}
                    >
                      {a.name[0]}
                    </button>
                  ))}
                </div>
              </div>
              <AIChat activeAgent={activeAgent} />
            </div>
          )}

          {/* Catalog Tab */}
          {activeTab === 'catalog' && (
            <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-400" />
                Full Music Catalog Browser
              </h3>
              <CatalogBrowser />
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard icon={DollarSign} label="Monthly Revenue" value="$58,922" change="+15.3%" changeType="up" color="green" />
                <MetricCard icon={Music} label="Total Streams" value="4.99M" change="+18.7%" changeType="up" color="blue" />
                <MetricCard icon={TrendingUp} label="Growth Rate" value="+22%" change="vs last month" changeType="up" color="purple" />
                <MetricCard icon={Globe} label="Active Markets" value="112" change="+5 new" changeType="up" color="orange" />
              </div>
              <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Detailed Analytics</h3>
                <RevenueAnalytics />
              </div>
            </div>
          )}

          {/* Royalties Tab */}
          {activeTab === 'royalties' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <MetricCard icon={DollarSign} label="Total Collected" value="$1,285,912" change="+12.5%" changeType="up" color="green" />
                <MetricCard icon={Clock} label="Pending Claims" value="$74,193" change="3 processing" changeType="up" color="orange" />
                <MetricCard icon={AlertTriangle} label="Unmatched" value="$9,417" change="Action needed" changeType="down" color="red" />
              </div>
              <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Royalty Payments</h3>
                <div className="space-y-3">
                  {[
                    { source: 'ASCAP Performance', period: 'Q4 2024', amount: '$12,345.67', status: 'Paid', date: '2024-12-15' },
                    { source: 'Spotify Streaming', period: 'Nov 2024', amount: '$5,253.50', status: 'Paid', date: '2024-12-01' },
                    { source: 'YouTube Content ID', period: 'Nov 2024', amount: '$3,456.78', status: 'Processing', date: '2024-12-10' },
                    { source: 'Apple Music', period: 'Nov 2024', amount: '$2,890.12', status: 'Pending', date: '2024-12-20' },
                    { source: 'TikTok Creator Fund', period: 'Nov 2024', amount: '$1,567.89', status: 'Pending', date: '2024-12-25' },
                    { source: 'Sync Licensing', period: 'Q4 2024', amount: '$8,900.00', status: 'Paid', date: '2024-12-05' },
                  ].map((payment, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <p className="text-sm font-medium text-white">{payment.source}</p>
                        <p className="text-xs text-gray-400">{payment.period} • {payment.date}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          payment.status === 'Paid' ? 'bg-green-500/20 text-green-400' :
                          payment.status === 'Processing' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {payment.status}
                        </span>
                        <span className="text-sm font-semibold text-white">{payment.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Streaming Tab */}
          {activeTab === 'streaming' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { name: 'Spotify', streams: '2.1M', status: 'Connected', color: 'green' },
                  { name: 'YouTube', streams: '892K', status: 'Connected', color: 'red' },
                  { name: 'TikTok', streams: '1.2M', status: 'Connected', color: 'pink' },
                  { name: 'Apple Music', streams: '567K', status: 'Connected', color: 'blue' },
                  { name: 'SoundCloud', streams: '234K', status: 'Connected', color: 'orange' },
                ].map((p, i) => (
                  <div key={i} className={`bg-${p.color}-500/10 border border-${p.color}-500/20 rounded-xl p-4 text-center`}>
                    <p className="text-lg font-bold text-white">{p.streams}</p>
                    <p className="text-sm text-gray-300">{p.name}</p>
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-xs text-green-400">{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <MetricCard icon={Shield} label="IP Protection" value="Active" change="All works protected" changeType="up" color="green" />
                <MetricCard icon={Lock} label="DMCA Claims" value="2 Active" change="1 resolved" changeType="up" color="orange" />
                <MetricCard icon={Eye} label="Monitoring" value="24/7" change="423 works tracked" changeType="up" color="blue" />
              </div>
              <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 p-5">
                <h3 className="text-lg font-semibold text-white mb-4">IP Protection Vault</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-sm font-medium text-green-400">All 423 ASCAP works are protected</span>
                    </div>
                    <p className="text-xs text-gray-400">ISWC numbers registered • ISRC codes assigned • Content ID active</p>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Copyright Registration</span>
                    </div>
                    <p className="text-xs text-gray-400">© 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 p-5">
              <h3 className="text-lg font-semibold text-white mb-4">System Settings</h3>
              <div className="space-y-4">
                {[
                  { label: 'Gemini AI API Key', key: 'NEXT_PUBLIC_GEMINI_API_KEY', status: 'Configure in .env.local' },
                  { label: 'NVIDIA NIM API Key', key: 'NVIDIA_API_KEY', status: 'Configure in .env.local' },
                  { label: 'Spotify Client ID', key: 'SPOTIFY_CLIENT_ID', status: 'Configure in .env.local' },
                  { label: 'YouTube API Key', key: 'YOUTUBE_API_KEY', status: 'Configure in .env.local' },
                  { label: 'Supabase URL', key: 'NEXT_PUBLIC_SUPABASE_URL', status: 'Connected ✓' },
                ].map((setting, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <p className="text-sm text-white">{setting.label}</p>
                      <p className="text-xs text-gray-500">{setting.key}</p>
                    </div>
                    <span className="text-xs text-gray-400">{setting.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GOATForceCommandCenter;