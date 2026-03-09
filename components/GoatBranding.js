/**
 * GOAT Branding Component
 * Displays GOAT Force branding with various styles
 */

import React from 'react';
import { Crown } from 'lucide-react';

const GoatBranding = ({ 
  size = 'medium', 
  variant = 'default', 
  glow = false 
}) => {
  const sizes = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl'
  };
  
  const variants = {
    default: 'text-white',
    neon: 'text-purple-400',
    gold: 'text-yellow-500'
  };
  
  const glowClass = glow ? 'drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]' : '';
  
  return (
    <div className={`flex items-center gap-3 ${sizes[size]} ${variants[variant]} ${glowClass}`}>
      <Crown className="w-10 h-10" />
      <span className="font-bold">GOAT FORCE</span>
    </div>
  );
};

export default GoatBranding;