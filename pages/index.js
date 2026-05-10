/**
 * GOAT Royalty App - Enhanced Landing Page
 * Stunning visual effects with video backgrounds and audio
 */

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Music,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Search,
  Play,
  Star,
  Zap,
  Crown,
  Shield,
  Rocket,
  Sparkles,
  Terminal,
  Globe,
  Cpu,
  Home as HomeIcon
} from 'lucide-react';

// Import our new components
import AnimatedHero from '../components/AnimatedHero';
import VideoBackground from '../components/VideoBackground';
import EnhancedVideoBackground from '../components/EnhancedVideoBackground';
import GoatBranding from '../components/GoatBranding';
import AudioVisualizer from '../components/AudioVisualizer';
import MusicPlayer from '../components/MusicPlayer';
import ParticleEffect from '../components/ParticleEffect';

const EnhancedLandingPage = () => {
  const router = useRouter();
  const [showVideo, setShowVideo] = useState(true);

  // Real GOAT Force videos — including new logo animation
  const featuredVideos = [
    '/videos/goat-logo-animation.mp4',
    '/videos/grok-video-BLUE GOAT CANT FUCK WITH ME).mp4',
    '/videos/grok-video-BLUE GOAT 23).mp4',
    '/videos/grok-video- NERD BITCH3.mp4',
    '/videos/grok-video- (1).mp4',
    '/videos/grok-video- (2).mp4'
  ];
  
  const [currentVideo, setCurrentVideo] = React.useState(0);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % featuredVideos.length);
    }, 10000); // Change video every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0000 0%, #0A0A0A 40%, #0A0A0A 60%, #1a0505 100%)' }}>
      {/* Enhanced Video Background with GOAT Branding */}
      <EnhancedVideoBackground
        showGoatLogo={true}
        logoPosition="top-right"
        autoPlay={true}
        muted={true}
        loop={true}
        overlayOpacity={0.25}
      />

      {/* Particle Effect — transparent canvas on top */}
      <ParticleEffect particleCount={40} />

      {/* Animated Hero Section */}
      <AnimatedHero />

      {/* Main Content Overlay */}
      <div className="relative z-20">
        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 goat-nav z-50">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center space-x-3 group">
                <img 
                  src="/images/branding/goat-icon-64.png" 
                  alt="GOAT Force" 
                  className="w-10 h-10 rounded-xl goat-logo-img"
                />
                <div>
                  <span className="text-2xl font-black bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent tracking-tight">
                    GOAT FORCE
                  </span>
                  <div className="text-[10px] text-gray-500 font-mono tracking-widest -mt-1">ROYALTY COMMAND CENTER</div>
                </div>
              </a>
              
              <div className="hidden md:flex items-center space-x-6">
                <a href="/home" className="text-red-400 hover:text-red-300 transition-colors font-semibold">
                  🏠 Home
                </a>
                <a href="/workshop" className="text-orange-400 hover:text-orange-300 transition-colors font-semibold">
                  🔧 Workshop
                </a>
                <a href="/super-goat-command" className="text-yellow-400 hover:text-yellow-300 transition-colors font-semibold">
                  ⚡ Command Center
                </a>
                <a href="/conchord" className="text-yellow-400 hover:text-yellow-300 transition-colors font-semibold">
                  📄 conChord
                </a>
                <a href="/analytics" className="text-white/80 hover:text-white transition-colors">
                  Analytics
                </a>
                <a href="/publishing" className="text-white/80 hover:text-white transition-colors">
                  Publishing
                </a>
                <a href="/tracks" className="text-white/80 hover:text-white transition-colors">
                  Tracks
                </a>
                <a href="/asap-catalog" className="text-white/80 hover:text-white transition-colors">
                  Catalog
                </a>
                <a href="/adobe-firefly" className="text-white/80 hover:text-white transition-colors">
                  AI Studio
                </a>
                <a href="/nvidia-dgx" className="text-white/80 hover:text-white transition-colors">
                  NVIDIA DGX
                </a>
                <a href="/ms-vanessa" className="text-white/80 hover:text-white transition-colors">
                  AI Assistant
                </a>
                <a href="/cinema-camera" className="text-white/80 hover:text-white transition-colors">
                  Cinema
                </a>
                <a href="/sora-ai-studio" className="text-white/80 hover:text-white transition-colors">
                  Sora AI
                </a>
                <a href="/openclaw" className="text-red-400 hover:text-red-300 transition-colors font-semibold">
                  🦞 OpenClaw AI
                </a>
                <a href="/cyber-warrior" className="text-red-500 hover:text-red-400 transition-colors font-semibold">
                  🛡️ CyberWarrior
                </a>
                <a href="/music-player" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">
                  🎵 Player
                </a>
                <a href="/royalty-engine" className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
                  💰 Royalties
                </a>
                <a href="/sendme-network" className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold">
                  📡 SendMe P2P
                </a>
                <a href="/upstaxx" className="text-green-400 hover:text-green-300 transition-colors font-semibold">
                  💰 UpStaxx Tax
                </a>
                <a href="/sono-studio" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">
                  🎹 Sono Studio
                </a>
                <a href="/fingerprint-auth" className="text-white/80 hover:text-white transition-colors">
                  Security
                </a>
                <a href="/concert-booking" className="text-orange-400 hover:text-orange-300 transition-colors font-semibold">
                  🎤 Booking
                </a>
                <a href="/unreal-engine" className="text-blue-400 hover:text-blue-300 transition-colors font-semibold">
                  🎮 Unreal
                </a>
                <a href="/ai-red-team" className="text-red-400 hover:text-red-300 transition-colors font-semibold">
                  🛡️ Red Team
                </a>
                <a href="/codex-008" className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold">
                  🔐 Agent Codex 008
                </a>
                <a href="/voice-studio" className="text-red-400 hover:text-red-300 transition-colors font-semibold">
                  🎙️ Voice Studio
                </a>
                <a href="/animation-studio" className="text-pink-400 hover:text-pink-300 transition-colors font-semibold">
                  🎬 Animation
                </a>
                <a href="/goat-branding-demo" className="text-yellow-400 hover:text-yellow-300 transition-colors font-semibold">
                  👑 Branding
                </a>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                    🐐 GOAT Video Active
                  </div>
                  <button 
                    onClick={() => setShowVideo(!showVideo)}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-yellow-600 text-white rounded-full hover:from-red-700 hover:to-yellow-700 transition-all"
                  >
                    {showVideo ? 'Hide Video' : 'Show Video'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-6">
                <img 
                  src="/images/branding/goat-logo.png" 
                  alt="GOAT Force" 
                  className="w-24 h-24 rounded-2xl goat-logo-img"
                />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent">
                  Why GOAT Force Stands Above
                </span>
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Experience the future of music publishing with cutting-edge technology and stunning visual design
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-yellow-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-65 transition-opacity"></div>
                <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-red-500/20 hover:border-red-500/40 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full mb-6 mx-auto">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 text-center">AI-Powered Analytics</h3>
                  <p className="text-white/70 text-center mb-4">
                    Advanced machine learning algorithms analyze your catalog and predict royalty trends
                  </p>
                  <div className="flex justify-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-65 transition-opacity"></div>
                <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-red-500/20 hover:border-red-500/40 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-red-400 rounded-full mb-6 mx-auto">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 text-center">Bank-Level Security</h3>
                  <p className="text-white/70 text-center mb-4">
                    Your royalty data is protected with enterprise-grade encryption and security protocols
                  </p>
                  <div className="flex justify-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-red-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-65 transition-opacity"></div>
                <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-yellow-500/20 hover:border-yellow-500/40 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full mb-6 mx-auto">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 text-center">Real-Time Insights</h3>
                  <p className="text-white/70 text-center mb-4">
                    Track your royalties in real-time with live streaming data and instant updates
                  </p>
                  <div className="flex justify-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                </div>
              </div>
            </div>

            {/* Music Player Section */}
            <div className="mb-16">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-4">Experience Your Music</h3>
                <p className="text-white/70">Integrated music player with stunning visual effects</p>
              </div>
              <div className="max-w-2xl mx-auto">
                <div className="text-white text-center p-8 bg-white/10 rounded-xl">Music Player Coming Soon</div>
              </div>
            </div>

            {/* Audio Visualizer Section */}
            <div className="mb-16">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-4">Audio Visualization</h3>
                <p className="text-white/70">See your music come to life with real-time audio analysis</p>
              </div>
              <div className="max-w-4xl mx-auto h-64">
                <AudioVisualizer type="bars" color="purple" />
              </div>
            </div>
          </div>
        </section>

        {/* SUPER GOAT COMMAND CENTER - NEW */}
        <section className="py-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-900/10" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.12) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)'
          }} />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600/20 to-yellow-600/20 rounded-full border border-red-500/30 mb-6">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">SUPER GOAT COMMAND CENTER</span>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex justify-center mb-4">
                <img src="/images/branding/goat-icon-192.png" alt="GOAT Force" className="w-20 h-20 rounded-2xl goat-logo-img" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-4">
                <span className="bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 bg-clip-text text-transparent">
                  SUPER GOAT
                </span>
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto mb-2">
                The ultimate fusion of GOAT Royalty + SuperNinja AI
              </p>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                AI Chat • Music Production • Royalty Calculator • Browser Automation • Terminal • Code Editor — All in one command center
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
              {[
                { icon: '🧠', label: 'AI Chat', desc: 'Multi-LLM', color: 'from-purple-600 to-blue-600' },
                { icon: '💰', label: 'Royalties', desc: '$865K+', color: 'from-yellow-600 to-orange-600' },
                { icon: '🎵', label: '346 Tracks', desc: '1.2B Streams', color: 'from-cyan-600 to-blue-600' },
                { icon: '🤖', label: 'Automation', desc: '5 Active Bots', color: 'from-green-600 to-teal-600' },
                { icon: '💻', label: 'Dev Tools', desc: 'Terminal + Code', color: 'from-pink-600 to-red-600' },
              ].map((item, i) => (
                <div key={i} className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-red-500/10 hover:border-red-500/40 hover:bg-red-500/5 transition-all cursor-pointer">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-sm font-bold text-white">{item.label}</div>
                  <div className="text-xs text-white/50">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
              <button
                onClick={() => router.push('/home')}
                className="group relative px-10 py-5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-lg rounded-full overflow-hidden transform hover:scale-105 transition-all goat-glow shadow-red-500/25"
              >
                <span className="relative z-10 flex items-center space-x-3">
                  <HomeIcon className="w-6 h-6" />
                  <span>🏠 Money Pennie's Home</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => router.push('/workshop')}
                className="group relative px-10 py-5 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold text-lg rounded-full overflow-hidden transform hover:scale-105 transition-all goat-glow shadow-orange-500/25"
              >
                <span className="relative z-10 flex items-center space-x-3">
                  <Music className="w-6 h-6" />
                  <span>🔧 Production Workshop</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => router.push('/super-goat-command')}
                className="group relative px-10 py-5 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-black font-bold text-lg rounded-full overflow-hidden transform hover:scale-105 transition-all goat-glow shadow-yellow-500/25"
              >
                <span className="relative z-10 flex items-center space-x-3">
                  <Rocket className="w-6 h-6" />
                  <span>⚡ Command Center</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-900/50 to-blue-900/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Ready to Maximize Your Royalties?
              </span>
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of artists who are already using GOAT Royalty to transform their music publishing business
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
              <button 
                   onClick={() => router.push('/login')}
                   className="group relative px-8 py-4 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-600 to-pink-600 text-white font-semibold rounded-full overflow-hidden transform hover:scale-105 transition-all"
                 >
                <span className="relative z-10 flex items-center space-x-2">
                  <Crown className="w-5 h-5" />
                  <span>Get Started Free</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button 
                   onClick={() => router.push('/super-goat-command')}
                   className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all flex items-center space-x-2"
                 >
                <Rocket className="w-5 h-5" />
                <span>Super GOAT Command Center</span>
              </button>

              <button 
                   onClick={() => router.push('/adobe-firefly')}
                   className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-full overflow-hidden transform hover:scale-105 transition-all flex items-center space-x-2"
                 >
                <Sparkles className="w-5 h-5" />
                <span>Adobe Firefly AI Studio</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EnhancedLandingPage;