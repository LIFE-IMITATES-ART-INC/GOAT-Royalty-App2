/**
 * Money Pennie's Home - Unified Dashboard
 * =======================================
 * This is the main home page combining:
 * - MoneypennyAI search assistant
 * - Real-time dashboard
 * - Quick access to all features
 * - GOAT Royalty branding
 */

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import MoneypennyAI from '../components/MoneypennyAI';
import RealDataDashboard from '../components/RealDataDashboard';
import {
  Home as HomeIcon,
  Music,
  DollarSign,
  BarChart3,
  Sparkles,
  Wrench,
  Shield,
  Zap,
  Crown
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <>
      <Head>
        <title>Money Pennie's Home | GOAT Royalty</title>
        <meta name="description" content="Your unified home for music royalty management and AI-powered production" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Header */}
        <header className="bg-black/50 backdrop-blur-xl border-b border-red-900/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Crown className="w-8 h-8 text-yellow-500" />
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Money Pennie's Home
                  </h1>
                  <p className="text-sm text-gray-400">
                    GOAT Royalty Command Center
                  </p>
                </div>
              </div>

              <nav className="flex items-center gap-4">
                <Link
                  href="/workshop"
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg flex items-center gap-2 transition-all"
                >
                  <Wrench className="w-4 h-4" />
                  Workshop
                </Link>
                <Link
                  href="/super-goat-command"
                  className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-lg flex items-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  Command Center
                </Link>
              </nav>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mt-4 border-t border-gray-800 pt-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === 'search'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                AI Search
              </button>
              <button
                onClick={() => setActiveTab('quick-access')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === 'quick-access'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Zap className="w-4 h-4" />
                Quick Access
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-red-900/20 to-yellow-900/20 border border-red-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-2">
                  Welcome Back, Harvey! 👑
                </h2>
                <p className="text-gray-300">
                  Your royalty empire awaits. Track your earnings, manage your catalog, and create new hits.
                </p>
              </div>

              <RealDataDashboard />
            </div>
          )}

          {/* AI Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-2">
                  AI-Powered Search Assistant
                </h2>
                <p className="text-gray-300">
                  Ask Money Pennie anything about your royalties, tracks, contracts, and more.
                </p>
              </div>

              <MoneypennyAI />
            </div>
          )}

          {/* Quick Access Tab */}
          {activeTab === 'quick-access' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickAccessCard
                href="/tracks"
                icon={Music}
                title="Track Manager"
                description="Manage your 346+ track catalog"
                color="from-blue-600 to-blue-700"
              />
              <QuickAccessCard
                href="/analytics"
                icon={BarChart3}
                title="Analytics"
                description="Deep dive into streaming data"
                color="from-green-600 to-green-700"
              />
              <QuickAccessCard
                href="/publishing"
                icon={DollarSign}
                title="Publishing"
                description="Manage contracts & royalties"
                color="from-yellow-600 to-yellow-700"
              />
              <QuickAccessCard
                href="/copyright"
                icon={Shield}
                title="IP Protection"
                description="Secure your intellectual property"
                color="from-purple-600 to-purple-700"
              />
              <QuickAccessCard
                href="/workshop"
                icon={Wrench}
                title="Workshop"
                description="Music production tools"
                color="from-red-600 to-red-700"
              />
              <QuickAccessCard
                href="/super-goat-command"
                icon={Zap}
                title="Command Center"
                description="Full AI-powered control"
                color="from-yellow-500 to-yellow-600"
              />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-400 text-sm">
              <p>© 2025 GOAT Royalty | Built with 🐐 energy by Harvey Miller (DJ Speedy)</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// Quick Access Card Component
function QuickAccessCard({ href, icon: Icon, title, description, color }) {
  return (
    <Link href={href}>
      <div className={`bg-gradient-to-br ${color} p-6 rounded-xl hover:scale-105 transition-transform cursor-pointer border border-white/10`}>
        <Icon className="w-12 h-12 text-white mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-100 text-sm">{description}</p>
      </div>
    </Link>
  );
}
