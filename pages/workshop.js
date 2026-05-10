/**
 * Money Pennie's Workshop - Music Production Hub
 * ==============================================
 * Unified workspace for all music production and creative tools
 * Including:
 * - Music Studio
 * - Audio Production (Sono Studio)
 * - Video Production (Sora AI, Cinema Camera)
 * - Animation Studio
 * - AI Image Generation (Adobe Firefly)
 * - Voice Studio
 */

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Home as HomeIcon,
  Music,
  Headphones,
  Video,
  Image as ImageIcon,
  Mic,
  Wand2,
  Film,
  Palette,
  Sparkles,
  ArrowLeft,
  Crown,
  Play,
  Pause,
  SkipForward,
  Volume2
} from 'lucide-react';
import MusicStudioWithRealData from '../components/MusicStudioWithRealData';
import SonoProductionSuite from '../components/SonoProductionSuite';
import Sora2AIStudio from '../components/Sora2AIStudio';
import GOATAnimationStudio from '../components/GOATAnimationStudio';
import AdobeFireflyStudio from '../components/AdobeFireflyStudio';
import VoiceStudio from '../components/VoiceStudio';

export default function WorkshopPage() {
  const [activeStudio, setActiveStudio] = useState('music');

  const studios = [
    {
      id: 'music',
      name: 'Music Studio',
      icon: Music,
      color: 'from-blue-600 to-blue-700',
      component: MusicStudioWithRealData,
      description: '346+ track catalog management'
    },
    {
      id: 'audio',
      name: 'Audio Production',
      icon: Headphones,
      color: 'from-purple-600 to-purple-700',
      component: SonoProductionSuite,
      description: 'Professional audio suite'
    },
    {
      id: 'video',
      name: 'Video Studio',
      icon: Video,
      color: 'from-red-600 to-red-700',
      component: Sora2AIStudio,
      description: 'AI video generation'
    },
    {
      id: 'animation',
      name: 'Animation Studio',
      icon: Film,
      color: 'from-yellow-600 to-yellow-700',
      component: GOATAnimationStudio,
      description: 'Create animated content'
    },
    {
      id: 'image',
      name: 'Image Studio',
      icon: ImageIcon,
      color: 'from-pink-600 to-pink-700',
      component: AdobeFireflyStudio,
      description: 'AI image generation'
    },
    {
      id: 'voice',
      name: 'Voice Studio',
      icon: Mic,
      color: 'from-green-600 to-green-700',
      component: VoiceStudio,
      description: 'Text-to-speech & recording'
    }
  ];

  const activeStudioData = studios.find(s => s.id === activeStudio);
  const ActiveComponent = activeStudioData?.component;

  return (
    <>
      <Head>
        <title>Money Pennie's Workshop | GOAT Royalty</title>
        <meta name="description" content="Your unified production workspace for music, video, and creative content" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Header */}
        <header className="bg-black/50 backdrop-blur-xl border-b border-red-900/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Wand2 className="w-8 h-8 text-red-500" />
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Money Pennie's Workshop
                  </h1>
                  <p className="text-sm text-gray-400">
                    Professional Production Suite
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/home"
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
                <Link
                  href="/super-goat-command"
                  className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-lg flex items-center gap-2 transition-all"
                >
                  <Crown className="w-4 h-4" />
                  Command Center
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Studio Selector Sidebar */}
          <aside className="w-64 bg-black/30 border-r border-gray-800 overflow-y-auto">
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                Studios
              </h2>
            </div>

            <nav className="p-2">
              {studios.map((studio) => (
                <button
                  key={studio.id}
                  onClick={() => setActiveStudio(studio.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center gap-3 transition-all ${
                    activeStudio === studio.id
                      ? `bg-gradient-to-r ${studio.color} text-white shadow-lg`
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <studio.icon className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-medium">{studio.name}</div>
                    <div className="text-xs opacity-75">{studio.description}</div>
                  </div>
                </button>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-800 mt-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/tracks"
                  className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  View All Tracks
                </Link>
                <Link
                  href="/analytics"
                  className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Analytics Dashboard
                </Link>
                <Link
                  href="/publishing"
                  className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Publishing Hub
                </Link>
              </div>
            </div>

            {/* Workshop Stats */}
            <div className="p-4 border-t border-gray-800">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Workshop Stats
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Total Tracks</span>
                  <span className="font-bold text-white">346</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Active Projects</span>
                  <span className="font-bold text-yellow-500">12</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Total Streams</span>
                  <span className="font-bold text-green-500">1.2B+</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-900/50 to-black/50">
            {/* Studio Header */}
            <div className={`bg-gradient-to-r ${activeStudioData?.color} p-6 border-b border-white/10`}>
              <div className="flex items-center gap-4">
                {activeStudioData && <activeStudioData.icon className="w-10 h-10 text-white" />}
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {activeStudioData?.name}
                  </h2>
                  <p className="text-white/80">
                    {activeStudioData?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Studio Component */}
            <div className="p-6">
              {ActiveComponent ? (
                <ActiveComponent />
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a studio to get started</p>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Mini Player (if needed) */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-gray-800 p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Workshop Active</div>
                <div className="text-xs text-gray-400">Ready to create</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
              <button className="p-3 bg-red-600 hover:bg-red-500 rounded-full text-white transition-colors">
                <Play className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-gray-400">
              🐐 GOAT Royalty Workshop
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
