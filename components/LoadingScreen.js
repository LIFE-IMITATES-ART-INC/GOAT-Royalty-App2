/**
 * GOAT Royalty App - Stunning Loading Screen
 * Professional loading animation with video effects
 */

import React, { useState, useEffect } from 'react';
import { Music, Crown, Sparkles } from 'lucide-react';

const LoadingScreen = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-blue-900">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 animate-gradient" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      {/* Loading Content */}
      <div className="relative z-10 text-center">
        {/* Logo Animation */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-50 animate-pulse-slow"></div>
            <div className="relative flex items-center justify-center w-32 h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-glow">
              <Crown className="w-16 h-16 text-white animate-bounce-in" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              GOAT Royalty
            </span>
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" />
            <p className="text-xl text-white/80 animate-pulse">Loading your music empire...</p>
            <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-80 h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 animate-shimmer"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>

        {/* Progress Percentage */}
        <div className="mt-4 text-2xl font-bold text-white">
          {Math.round(loadingProgress)}%
        </div>

        {/* Loading Features */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {['Analytics', 'Catalog', 'Royalties', 'Security'].map((feature, index) => (
            <div
              key={feature}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 animate-slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center space-x-2">
                <Music className="w-4 h-4 text-purple-400" />
                <span className="text-white/80 text-sm">{feature}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-purple-500/50 animate-pulse-slow" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-pink-500/50 animate-pulse-slow" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-blue-500/50 animate-pulse-slow" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-purple-500/50 animate-pulse-slow" />
    </div>
  );
};

export default LoadingScreen;