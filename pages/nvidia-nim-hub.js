// NVIDIA NIM Hub — Ultimate AI Model Integration
// 🚀 GOAT Royalty App x NVIDIA NIM Integration
// © 2025 Harvey Miller / FASTASSMAN Publishing Inc

import { useState } from 'react'
import { Cpu, Zap, Code, Image, Video, Music, Database, Globe, Shield, Sparkles, Rocket, Terminal, Play, Pause, RefreshCw, ChevronRight, X, Check, Clock, TrendingUp, BarChart3, Users, DollarSign, Eye, Search, FileText, Calendar } from 'lucide-react'

const modelCategories = [
  { id: 'code', name: 'Code Generation', icon: Code, models: 28, color: '#8b5cf6' },
  { id: 'rag', name: 'RAG & Retrieval', icon: Database, models: 14, color: '#10b981' },
  { id: 'vision', name: 'Vision & Multimodal', icon: Image, models: 25, color: '#ec4899' },
  { id: 'video', name: 'Video Understanding', icon: Video, models: 12, color: '#f59e0b' },
  { id: 'audio', name: 'Audio & Speech', icon: Music, models: 8, color: '#06b6d4' },
  { id: 'reasoning', name: 'Reasoning & Agents', icon: Terminal, models: 31, color: '#ef4444' },
  { id: 'safety', name: 'Safety & Guardrails', icon: Shield, models: 7, color: '#84cc16' },
  { id: 'translation', name: 'Translation', icon: Globe, models: 15, color: '#3b82f6' }
]

const topModels = [
  {
    name: 'DeepSeek V3.2',
    publisher: 'DeepSeek AI',
    description: '685B reasoning LLM with sparse attention, long context, integrated agentic tools',
    params: '685B',
    category: 'reasoning',
    color: '#ef4444',
    downloads: '15.34M',
    features: ['Long Context', 'Tool Calling', 'Agentic AI', 'Sparse Attention']
  },
  {
    name: 'Kimi K2.5',
    publisher: 'Moonshot AI',
    description: '1T multimodal MoE for high-capacity video and image understanding with efficient inference',
    params: '1T',
    category: 'vision',
    color: '#ec4899',
    downloads: '20.93M',
    features: ['Multimodal', 'Video Understanding', 'MoE Architecture', 'Efficient Inference']
  },
  {
    name: 'Qwen 3.5 397B',
    publisher: 'Qwen',
    description: 'Next-gen Qwen 3.5 VLM (400B MoE) brings advanced vision, chat, RAG, and agentic capabilities',
    params: '400B',
    category: 'vision',
    color: '#10b981',
    downloads: '6.11M',
    features: ['Vision Language', 'MoE', 'RAG', 'Agent-Ready']
  },
  {
    name: 'GLM-5',
    publisher: 'Z.ai',
    description: '744B MoE enables efficient reasoning for complex systems and long-horizon agentic tasks',
    params: '744B',
    category: 'reasoning',
    color: '#f59e0b',
    downloads: '7.38M',
    features: ['Complex Reasoning', 'Long-Horizon Tasks', 'MoE', 'Agentic']
  },
  {
    name: 'Nemotron 3 Nano 30B',
    publisher: 'NVIDIA',
    description: 'Open, efficient MoE model with 1M context, excelling in coding, reasoning, instruction following',
    params: '30B',
    category: 'code',
    color: '#3b82f6',
    downloads: '12.13M',
    features: ['1M Context', 'MoE', 'Coding', 'Tool Calling']
  },
  {
    name: 'MiniMax M2.5',
    publisher: 'Minimaxai',
    description: '230B-parameter text-to-text AI model excelling in coding, reasoning, and office tasks',
    params: '230B',
    category: 'code',
    color: '#8b5cf6',
    downloads: '2.69M',
    features: ['Coding', 'Reasoning', 'Office Tasks', 'Agentic']
  },
  {
    name: 'Step 3.5 Flash',
    publisher: 'Stepfun AI',
    description: '200B open-source reasoning engine with sparse MoE powering frontier agentic AI',
    params: '200B',
    category: 'reasoning',
    color: '#ef4444',
    downloads: '7.22M',
    features: ['Reasoning Engine', 'Sparse MoE', 'Frontier AI', 'Agent-Ready']
  },
  {
    name: 'GLM 4.7',
    publisher: 'Z.ai',
    description: 'Multilingual agentic coding partner with stronger reasoning, tool use, and UI skills',
    params: 'Open',
    category: 'code',
    color: '#06b6d4',
    downloads: '17.72M',
    features: ['Multilingual', 'Tool Calling', 'UI Skills', 'Agentic Coding']
  }
]

const goatApps = [
  { name: 'Music Analysis', icon: Music, status: 'Active', model: 'Nemotron Audio 2B' },
  { name: 'Royalty Calculation', icon: DollarSign, status: 'Active', model: 'DeepSeek V3.2' },
  { name: 'Copyright Detection', icon: Shield, status: 'Active', model: 'Nemotron Content Safety' },
  { name: 'Contract Analysis', icon: FileText, status: 'Active', model: 'GLM 4.7' },
  { name: 'Concert Booking', icon: Calendar, status: 'Active', model: 'Qwen 3.5' },
  { name: 'AI Production', icon: Terminal, status: 'Active', model: 'Step 3.5 Flash' },
  { name: 'Video Understanding', icon: Video, status: 'Active', model: 'Kimi K2.5' },
  { name: 'Analytics Engine', icon: BarChart3, status: 'Active', model: 'Cosmos Reason 8B' }
]

export default function NVIDIANIMHub() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedModel, setSelectedModel] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [liveMetrics, setLiveMetrics] = useState({
    totalRequests: 2847592,
    activeConnections: 342,
    avgLatency: 47,
    successRate: 99.7
  })

  const filteredModels = topModels.filter(m => 
    activeCategory === 'all' || m.category === activeCategory
  ).filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #76b900 0%, #0a0a0a 50%, #76b900 100%)',
        padding: '2rem', borderBottom: '1px solid rgba(118,185,0,0.2)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #76b900, #4a7500)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem'
              }}>
                🟢
              </div>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
                  NVIDIA NIM HUB
                </h1>
                <p style={{ color: '#888', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                  GOAT Royalty App x NVIDIA AI Integration • 215+ Models Available
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{
                background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(118,185,0,0.3)',
                borderRadius: '0.5rem', padding: '0.75rem 1.5rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <RefreshCw size={16} color="#76b900" />
                <span style={{ fontSize: '0.875rem', color: '#76b900' }}>{liveMetrics.activeConnections} Active</span>
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(118,185,0,0.3)',
                borderRadius: '0.5rem', padding: '0.75rem 1.5rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <Zap size={16} color="#76b900" />
                <span style={{ fontSize: '0.875rem', color: '#76b900' }}>{liveMetrics.successRate}% Success</span>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
              <input
                type="text"
                placeholder="Search NVIDIA NIM models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem',
                  padding: '0.75rem 1rem 0.75rem 2.75rem', color: '#fff',
                  fontSize: '0.875rem', outline: 'none'
                }}
              />
            </div>
            <button style={{
              background: activeCategory === 'all' ? '#76b900' : 'rgba(118,185,0,0.1)',
              border: `1px solid ${activeCategory === 'all' ? '#76b900' : 'rgba(118,185,0,0.3)'}`,
              borderRadius: '0.5rem', padding: '0.75rem 1.5rem', color: activeCategory === 'all' ? '#000' : '#76b900',
              cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600
            }} onClick={() => setActiveCategory('all')}>
              All Models
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 2rem',
        display: 'flex', gap: '0.5rem', overflowX: 'auto', borderBottom: '1px solid ' +
        'rgba(255,255,255,0.05)'
      }}>
        {modelCategories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
            background: activeCategory === cat.id ? `${cat.color}22` : 'transparent',
            border: `1px solid ${activeCategory === cat.id ? cat.color : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '0.5rem', padding: '0.6rem 1rem', color: activeCategory === cat.id ? cat.color : '#666',
            cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}>
            <cat.icon size={14} /> {cat.name}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
        {/* Main Content */}
        <div>
          {/* Stats Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Models', value: '215', icon: Cpu },
              { label: 'API Endpoints', value: '94', icon: Globe },
              { label: 'Downloads', value: '87.5M', icon: TrendingUp },
              { label: 'Active Apps', value: '8', icon: Rocket }
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '0.75rem', padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <stat.icon size={16} color="#76b900" />
                  <span style={{ color: '#666', fontSize: '0.75rem' }}>{stat.label}</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Model Grid */}
          <h3 style={{ color: '#76b900', fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Top NVIDIA NIM Models
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
            {filteredModels.map((model, i) => (
              <div key={i} onClick={() => setSelectedModel(model)} style={{
                background: `linear-gradient(135deg, ${model.color}11, rgba(0,0,0,0.8))`,
                border: `1px solid ${model.color}33`, borderRadius: '0.75rem',
                padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>{model.name}</h4>
                    <span style={{ color: model.color, fontSize: '0.75rem', fontWeight: 600 }}>{model.publisher}</span>
                  </div>
                  <div style={{
                    background: `${model.color}22`, padding: '0.25rem 0.5rem', borderRadius: '0.25rem',
                    fontSize: '0.7rem', color: model.color, fontWeight: 600
                  }}>{model.params}</div>
                </div>
                <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {model.description}
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {model.features.map((f, j) => (
                    <span key={j} style={{
                      background: 'rgba(255,255,255,0.05), padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem', fontSize: '0.7rem', color: '#666'
                    }}>{f}</span>
                  ))}
                </div>
                <div style={{
                  marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  <TrendingUp size={14} color="#76b900" />
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>{model.downloads} downloads</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* GOAT Apps */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem'
          }}>
            <h4 style={{ color: '#76b900', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} /> GOAT NIM Apps
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {goatApps.map((app, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem',
                  padding: '0.75rem', border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{app.name}</span>
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%', background: '#10b981'
                    }} />
                  </div>
                  <span style={{ color: '#666', fontSize: '0.75rem' }}>{app.model}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(118,185,0,0.1), rgba(0,0,0,0.8))',
            border: '1px solid rgba(118,185,0,0.3)', borderRadius: '0.75rem', padding: '1.25rem'
          }}>
            <h4 style={{ color: '#76b900', fontSize: '0.875rem', marginBottom: '1rem' }}>Quick Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Test Model API', icon: Play },
                { label: 'View Documentation', icon: FileText },
                { label: 'Deploy New Model', icon: Rocket },
                { label: 'Monitor Performance', icon: BarChart3 }
              ].map((action, i) => (
                <button key={i} style={{
                  background: 'rgba(255,255,255,0.05), border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.5rem', padding: '0.6rem 0.75rem', color: '#fff',
                  cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  <action.icon size={14} color="#76b900" /> {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}