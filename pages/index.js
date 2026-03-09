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
  Cpu
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

  // Real GOAT Force videos
  const featuredVideos = [
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
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Particle Effect Background */}
      <ParticleEffect particleCount={50} />
      
      {/* Enhanced Video Background with GOAT Branding */}
      <EnhancedVideoBackground
        showGoatLogo={true}
        logoPosition="top-right"
        autoPlay={true}
        muted={true}
        loop={true}
        overlayOpacity={0.3}
      />

      {/* GOAT Header Branding */}
      <div className="absolute top-8 left-8 z-30">
        <GoatBranding size="medium" variant="neon" glow={true} />
      </div>

      {/* Animated Hero Section */}
      <AnimatedHero />

      {/* Main Content Overlay */}
      <div className="relative z-20">
        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-md border-b border-white/10 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  GOAT Royalty
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <a href="/analytics" className="text-white/80 hover:text-white transition-colors">
                  Analytics
                </a>
                <a href="/publishing" className="text-white/80 hover:text-white transition-colors">
                  Publishing
                </a>
                <a href="/asap-catalog" className="text-white/80 hover:text-white transition-colors">
                  Catalog
                </a>
                <a href="/ms-vanessa" className="text-white/80 hover:text-white transition-colors">
                  AI Assistant
                </a>
                <a href="/nvidia-nim-hub" className="text-green-400 hover:text-green-300 transition-colors font-semibold">
                  🚀 NIM Hub
                </a>
                <a href="/super-shazam" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">
                  🎵 Super Shazam
                </a>
                <a href="/fingerprint-auth" className="text-white/80 hover:text-white transition-colors">
                  Security
                </a>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                    🐐 GOAT Video Active
                  </div>
                  <button 
                    onClick={() => setShowVideo(!showVideo)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
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
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Why GOAT Royalty Stands Above
                </span>
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Experience the future of music publishing with cutting-edge technology and stunning visual design
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 mx-auto">
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
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6 mx-auto">
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
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-6 mx-auto">
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
                <div className="text-white text-center p-8 bg-white/10 rounded-lg">Music Player Coming Soon</div>
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
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-blue-900/30" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(108, 92, 231, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)'
          }} />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-yellow-600/20 rounded-full border border-purple-500/30 mb-6">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">NEW — SUPER GOAT COMMAND CENTER</span>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-4">
                <span className="bg-gradient-to-r from-purple-400 via-yellow-400 to-purple-400 bg-clip-text text-transparent">
                  🐐 SUPER GOAT
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
                <div key={i} className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-sm font-bold text-white">{item.label}</div>
                  <div className="text-xs text-white/50">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
              <button 
                onClick={() => router.push('/super-goat-command')}
                className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 via-yellow-500 to-purple-600 text-white font-bold text-lg rounded-full overflow-hidden transform hover:scale-105 transition-all shadow-lg shadow-purple-500/25"
              >
                <span className="relative z-10 flex items-center space-x-3">
                  <Rocket className="w-6 h-6" />
                  <span>Launch Super GOAT Command Center</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-purple-600 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all"
              >
                Classic Dashboard
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
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
                   className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full overflow-hidden transform hover:scale-105 transition-all"
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