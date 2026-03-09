/**
 * Main Navigation Component
 * Complete navigation for all GOAT Force pages
 */

import React from 'react';
import Link from 'next/link';
import { 
  Crown, Home, BarChart3, Music, DollarSign, Globe, Shield, 
  Video, Sparkles, Cpu, Shirt, Zap, Users, FileText, Camera,
  Headphones, TrendingUp, Package
} from 'lucide-react';

const MainNavigation = () => {
  const navSections = [
    {
      title: 'Main',
      items: [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
        { name: 'Complete Platform', href: '/complete-platform', icon: Crown },
        { name: 'Investor Demo', href: '/investor-demo', icon: TrendingUp }
      ]
    },
    {
      title: 'AI & Intelligence',
      items: [
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Interactive AI', href: '/interactive', icon: Zap },
        { name: 'Search', href: '/search', icon: Globe }
      ]
    },
    {
      title: 'Content Creation',
      items: [
        { name: 'Adobe Firefly AI', href: '/adobe-firefly', icon: Sparkles },
        { name: 'Cinema Camera', href: '/cinema-camera', icon: Video },
        { name: 'Sora AI Studio', href: '/sora-ai-studio', icon: Sparkles },
        { name: 'Media Gallery', href: '/media-gallery', icon: Camera },
        { name: 'Artwork', href: '/artwork', icon: Package }
      ]
    },
    {
      title: 'Music & Catalog',
      items: [
        { name: 'Tracks', href: '/tracks', icon: Music },
        { name: 'Streaming', href: '/streaming', icon: Headphones },
        { name: 'Publishing', href: '/publishing', icon: FileText },
        { name: 'ASAP Catalog', href: '/asap-catalog', icon: Music }
      ]
    },
    {
      title: 'Business',
      items: [
        { name: 'Fashion Store', href: '/fashion-store', icon: Shirt },
        { name: 'Copyright', href: '/copyright', icon: Shield },
        { name: 'Documents', href: '/documents', icon: FileText },
        { name: 'Contact', href: '/contact', icon: Users }
      ]
    },
    {
      title: 'Technology',
      items: [
        { name: 'NVIDIA DGX', href: '/nvidia-dgx', icon: Cpu },
        { name: 'MS Vanessa', href: '/ms-vanessa', icon: Shield },
        { name: 'GOAT Branding', href: '/goat-branding-demo', icon: Crown }
      ]
    }
  ];

  return (
    <nav className="bg-black/90 backdrop-blur-md border-b border-yellow-500/30 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <Crown className="w-10 h-10 text-yellow-500" />
              <div>
                <h1 className="text-2xl font-black text-white">GOAT FORCE</h1>
                <p className="text-gray-400 text-xs">Complete Platform</p>
              </div>
            </div>
          </Link>

          {/* Quick Links */}
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/complete-platform">
              <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-bold transition-colors">
                Complete Platform
              </button>
            </Link>
            <Link href="/investor-demo">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                Investor Demo
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Full Navigation Menu */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white/5 rounded-lg p-3">
              <h3 className="text-yellow-500 font-bold text-xs mb-2 uppercase">{section.title}</h3>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <Link key={itemIndex} href={item.href}>
                      <div className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/10 px-2 py-1 rounded transition-colors cursor-pointer">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation;