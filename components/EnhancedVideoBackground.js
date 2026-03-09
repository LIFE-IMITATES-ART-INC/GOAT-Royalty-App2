/**
 * Enhanced Video Background Component
 * Provides video background with GOAT branding overlay
 */

import React from 'react';

const EnhancedVideoBackground = ({ 
  showGoatLogo = true, 
  logoPosition = 'top-right',
  autoPlay = true,
  muted = true,
  loop = true,
  overlayOpacity = 0.3 
}) => {
  return (
    <div className="fixed inset-0 z-0">
      {/* Video Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-blue-900">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 animate-pulse"></div>
        </div>
      </div>
      
      {/* Dark overlay */}
      <div 
        className="absolute inset-0 bg-black" 
        style={{ opacity: overlayOpacity }}
      ></div>
      
      {/* GOAT Logo */}
      {showGoatLogo && (
        <div className={`absolute ${logoPosition === 'top-right' ? 'top-8 right-8' : 'top-8 left-8'} z-10`}>
          <div className="text-6xl font-bold text-yellow-500 opacity-20">
            🐐
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVideoBackground;