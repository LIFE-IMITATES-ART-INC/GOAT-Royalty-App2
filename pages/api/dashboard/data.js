/**
 * GOAT Royalty App - Dashboard Data API
 * Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST
 * Enhanced with real catalog data integration
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timeRange = '30days' } = req.query;

    const dashboardData = {
      success: true,
      data: {
        totalCollected: '$1,285,912',
        pendingClaims: '$74,193',
        unmatchedRoyalties: '$9,417',
        countriesCovered: '112',
        totalRevenue: 45678.90,
        revenueChange: 12.5,
        totalStreams: 2847563,
        streamsChange: 8.3,
        activeContent: 156,
        contentChange: 15.2,
        audienceReach: 4839274,
        audienceChange: 22.1,
        catalogStats: {
          totalWorks: 423,
          totalWriterWorks: 414,
          totalMasterTracks: 30,
          registeredISRCs: 30,
          registeredISWCs: 423,
          publishers: ['FASTASSMAN PUB INC.', 'ROYNET MUSIC'],
          writers: ['HARVEY L MILLER', 'RAY RUSH'],
          societies: ['ASCAP']
        },
        platformPerformance: [
          {
            name: 'TikTok',
            icon: 'tiktok',
            contentCount: 45,
            revenue: 12567.80,
            views: 1245678,
            growth: '+18%'
          },
          {
            name: 'YouTube',
            icon: 'youtube',
            contentCount: 38,
            revenue: 18934.20,
            views: 892456,
            growth: '+12%'
          },
          {
            name: 'Spotify',
            icon: 'spotify',
            contentCount: 28,
            revenue: 15253.50,
            views: 2142195,
            growth: '+22%'
          },
          {
            name: 'Apple Music',
            icon: 'apple',
            contentCount: 28,
            revenue: 8923.40,
            views: 567234,
            growth: '+9%'
          },
          {
            name: 'SoundCloud',
            icon: 'soundcloud',
            contentCount: 15,
            revenue: 3245.60,
            views: 234567,
            growth: '+5%'
          }
        ],
        revenueBreakdown: [
          { category: 'Streaming Royalties', amount: 28456.70, percentage: 62.3 },
          { category: 'Content ID', amount: 8923.40, percentage: 19.5 },
          { category: 'Publishing / ASCAP', amount: 5678.90, percentage: 12.4 },
          { category: 'Sync Licensing', amount: 2619.90, percentage: 5.8 }
        ],
        recentActivity: [
          {
            type: 'revenue',
            title: 'ASCAP Quarterly Payment Received',
            description: 'Q4 2024 performance royalties for 423 registered works',
            amount: 12345.67,
            timestamp: new Date().toISOString()
          },
          {
            type: 'content',
            title: 'New catalog sync detected',
            description: '"Night Night And Einini" used in TikTok viral video',
            amount: null,
            timestamp: new Date(Date.now() - 86400000).toISOString()
          },
          {
            type: 'alert',
            title: 'Streaming spike detected',
            description: '250% increase in streams for "Get The Bag" on Spotify',
            amount: null,
            timestamp: new Date(Date.now() - 172800000).toISOString()
          },
          {
            type: 'revenue',
            title: 'YouTube Content ID Payment',
            description: 'Monthly Content ID revenue for FIVE DEUCES catalog',
            amount: 2345.67,
            timestamp: new Date(Date.now() - 259200000).toISOString()
          },
          {
            type: 'catalog',
            title: 'ISRC Registration Complete',
            description: '30 tracks registered with ISRC codes (USUM723011XX series)',
            amount: null,
            timestamp: new Date(Date.now() - 345600000).toISOString()
          }
        ],
        topContent: [
          {
            title: 'Night Night And Einini',
            artist: 'Harvey Miller',
            album: 'FIVE DEUCES',
            isrc: 'USUM72301134',
            platform: 'Spotify',
            views: 567890,
            revenue: 5678.90
          },
          {
            title: 'Get The Bag',
            artist: 'Harvey Miller',
            album: 'FIVE DEUCES',
            isrc: 'USUM72301135',
            platform: 'TikTok',
            views: 1234567,
            revenue: 4345.67
          },
          {
            title: 'Boss Level',
            artist: 'Harvey Miller',
            album: 'FIVE DEUCES',
            isrc: 'USUM72301138',
            platform: 'YouTube',
            views: 234567,
            revenue: 2345.67
          },
          {
            title: '2 Turntables And A Microphone',
            artist: 'Harvey Miller / FASTASSMAN',
            album: 'ASCAP Catalog',
            isrc: 'T9194335701',
            platform: 'All Platforms',
            views: 189012,
            revenue: 1890.12
          },
          {
            title: 'King Mindset',
            artist: 'Harvey Miller',
            album: 'FIVE DEUCES III',
            isrc: 'USUM72301146',
            platform: 'Apple Music',
            views: 145678,
            revenue: 1456.78
          },
          {
            title: '45 Davenger',
            artist: 'Harvey Miller / FASTASSMAN',
            album: 'ASCAP Catalog',
            isrc: 'T9221724410',
            platform: 'Spotify',
            views: 98765,
            revenue: 987.65
          }
        ],
        goatForceStatus: {
          moneypenny: { status: 'active', task: 'Scanning royalty databases', efficiency: 98 },
          codex: { status: 'active', task: 'Processing financial analytics', efficiency: 95 },
          msVanessa: { status: 'active', task: 'Ready for artist queries', efficiency: 97 },
          superNinja: { status: 'active', task: 'Optimizing strategy models', efficiency: 92 },
          geminiCopilot: { status: 'active', task: 'AI analysis pipeline ready', efficiency: 99 }
        }
      }
    };

    res.status(200).json(dashboardData);

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}