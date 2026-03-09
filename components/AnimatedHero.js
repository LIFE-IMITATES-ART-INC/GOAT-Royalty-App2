/**
 * GOAT Royalty App - Animated Hero Section
 * Stunning hero with particle effects and animations
 */

import React, { useState, useEffect } from 'react';
import { Play, Sparkles, TrendingUp, Music, DollarSign } from 'lucide-react';

const AnimatedHero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = [...Array(50)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.3
    }));
    setParticles(newParticles);

    // Mouse tracking
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-black to-blue-900">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          transform: `perspective(1000px) rotateX(${mousePosition.y * 0.01}deg) rotateY(${mousePosition.x * 0.01}deg)`
        }} />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animation: `float ${particle.speed * 3}s ease-in-out infinite`,
              boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        {/* Glowing Title */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 bg-clip-text text-transparent animate-gradient">
              GOAT Royalty
            </span>
          </h1>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
            <p className="text-2xl md:text-3xl text-white/90 font-light">
              The Future of Music Publishing
            </p>
            <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
          Track royalties, manage catalogs, and maximize your music publishing revenue with AI-powered analytics and real-time insights.
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-purple-500/20 rounded-full">
                <Music className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">346</div>
            <div className="text-white/70">Works Cataloged</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-green-500/20 rounded-full">
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">$865K+</div>
            <div className="text-white/70">Est. Royalties</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-blue-500/20 rounded-full">
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">1.2B+</div>
            <div className="text-white/70">Total Streams</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
          <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full overflow-hidden transform hover:scale-105 transition-all duration-300">
            <span className="relative z-10 flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Launch Dashboard</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
            View Demo
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default AnimatedHero;