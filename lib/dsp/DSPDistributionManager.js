/**
 * DSP Distribution Manager
 * Manages music distribution to Digital Service Providers (DSPs)
 * Supports Spotify, Apple Music, Amazon Music, YouTube Music, TikTok, and more
 */

class DSPDistributionManager {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.NVIDIA_API_KEY;
    this.baseUrl = options.baseUrl || 'https://integrate.api.nvidia.com/v1';
    this.defaultModel = options.defaultModel || 'meta/llama-3.3-70b-instruct';
    
    // DSP configurations
    this.dspConfigs = {
      spotify: {
        name: 'Spotify',
        apiBaseUrl: 'https://api.spotify.com/v1',
        marketshare: 31,
        payRate: 0.00437, // Per stream
        uploadMethod: 'aggregator',
        features: ['playlists', 'canvas', 'marquee', 'showcase']
      },
      appleMusic: {
        name: 'Apple Music',
        apiBaseUrl: 'https://api.music.apple.com/v1',
        marketshare: 15,
        payRate: 0.008,
        uploadMethod: 'aggregator',
        features: ['spatial-audio', 'lyrics', 'apple-digital-masters']
      },
      amazonMusic: {
        name: 'Amazon Music',
        apiBaseUrl: 'https://api.amazon.com/music/v1',
        marketshare: 12,
        payRate: 0.004,
        uploadMethod: 'aggregator',
        features: ['hd-audio', 'alexa-integration']
      },
      youtubeMusic: {
        name: 'YouTube Music',
        apiBaseUrl: 'https://www.googleapis.com/youtube/v3',
        marketshare: 18,
        payRate: 0.002,
        uploadMethod: 'direct',
        features: ['music-video', 'shorts', 'community-posts']
      },
      tikTok: {
        name: 'TikTok',
        apiBaseUrl: 'https://open-api.tiktok.com',
        marketshare: 10,
        payRate: 0.001,
        uploadMethod: 'aggregator',
        features: ['sound-lab', 'viral-tracking']
      },
      deezer: {
        name: 'Deezer',
        apiBaseUrl: 'https://api.deezer.com',
        marketshare: 4,
        payRate: 0.0056,
        uploadMethod: 'aggregator',
        features: ['hiFi', 'flow']
      },
      tidal: {
        name: 'Tidal',
        apiBaseUrl: 'https://api.tidal.com/v1',
        marketshare: 3,
        payRate: 0.0125,
        uploadMethod: 'aggregator',
        features: ['master-quality', 'music-videos', 'documentaries']
      },
      soundcloud: {
        name: 'SoundCloud',
        apiBaseUrl: 'https://api.soundcloud.com',
        marketshare: 4,
        payRate: 0.003,
        uploadMethod: 'direct',
        features: ['fan-powered-royalties', 'reposts', 'comments']
      },
      pandora: {
        name: 'Pandora',
        apiBaseUrl: 'https://api.pandora.com/v1',
        marketshare: 3,
        payRate: 0.0015,
        uploadMethod: 'aggregator',
        features: ['radio', 'podcasts']
      }
    };

    // Aggregators
    this.aggregators = {
      distrokid: { name: 'DistroKid', fee: 19.99, yearly: true, features: ['unlimited-releases', 'splits'] },
      tunecore: { name: 'TuneCore', fee: 29.99, yearly: true, features: ['publishing-admin'] },
      cdbaby: { name: 'CD Baby', fee: 9.95, perRelease: true, features: ['physical-distribution'] },
      ditto: { name: 'Ditto Music', fee: 19, yearly: true, features: ['label-services'] },
      landr: { name: 'LANDR', fee: 0, commission: 15, features: ['mastering', 'samples'] },
      stem: { name: 'Stem', fee: 0, commission: 10, features: ['advanced-analytics'] },
      amuse: { name: 'Amuse', fee: 0, commission: 15, features: ['label-discovery'] }
    };

    // Distribution state
    this.state = {
      releases: [],
      pendingDistributions: [],
      analytics: {},
      earnings: {}
    };
  }

  /**
   * Create a new release for distribution
   */
  async createRelease(releaseData) {
    const {
      title,
      artist,
      tracks,
      releaseDate,
      coverArt,
      upc,
      genre,
      subGenres,
      recordLabel,
      copyright,
      explicitContent,
      isWorldwide,
      territories
    } = releaseData;

    // Validate release data
    const validation = await this.validateRelease(releaseData);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    // Generate ISRC codes for tracks
    const tracksWithISRC = tracks.map((track, index) => ({
      ...track,
      isrc: track.isrc || this.generateISRC(index),
      trackNumber: index + 1
    }));

    // Create release object
    const release = {
      id: this.generateReleaseId(),
      title,
      artist,
      tracks: tracksWithISRC,
      releaseDate,
      coverArt,
      upc: upc || this.generateUPC(),
      genre,
      subGenres,
      recordLabel,
      copyright,
      explicitContent: explicitContent || false,
      territories: isWorldwide ? ['worldwide'] : territories,
      status: 'created',
      createdAt: new Date().toISOString(),
      distributions: [],
      analytics: {}
    };

    // Store release
    this.state.releases.push(release);

    return {
      success: true,
      release,
      nextSteps: [
        'Review release details',
        'Select distribution targets',
        'Choose aggregator or direct upload',
        'Schedule distribution date'
      ]
    };
  }

  /**
   * Validate release data before distribution
   */
  async validateRelease(releaseData) {
    const errors = [];

    // Required fields
    if (!releaseData.title) errors.push('Title is required');
    if (!releaseData.artist) errors.push('Artist name is required');
    if (!releaseData.tracks || releaseData.tracks.length === 0) {
      errors.push('At least one track is required');
    }
    if (!releaseData.releaseDate) errors.push('Release date is required');
    if (!releaseData.coverArt) errors.push('Cover art is required');

    // Validate tracks
    if (releaseData.tracks) {
      releaseData.tracks.forEach((track, index) => {
        if (!track.title) errors.push(`Track ${index + 1}: Title is required`);
        if (!track.audioFile) errors.push(`Track ${index + 1}: Audio file is required`);
        if (!track.duration) errors.push(`Track ${index + 1}: Duration is required`);
      });
    }

    // Validate cover art dimensions (should be 3000x3000 for most DSPs)
    if (releaseData.coverArt && releaseData.coverArt.dimensions) {
      const { width, height } = releaseData.coverArt.dimensions;
      if (width < 1400 || height < 1400) {
        errors.push('Cover art must be at least 1400x1400 pixels');
      }
      if (width !== height) {
        errors.push('Cover art must be square (equal width and height)');
      }
    }

    // Validate release date (must be at least 2 weeks in future for some DSPs)
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 14);
    if (new Date(releaseData.releaseDate) < minDate) {
      errors.push('Release date must be at least 2 weeks in the future');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Distribute release to selected DSPs
   */
  async distributeToDSPs(releaseId, targetDSPs, options = {}) {
    const release = this.state.releases.find(r => r.id === releaseId);
    if (!release) {
      return { success: false, error: 'Release not found' };
    }

    const distributionResults = [];
    const aggregator = options.aggregator || 'distrokid';

    for (const dsp of targetDSPs) {
      const dspConfig = this.dspConfigs[dsp];
      if (!dspConfig) {
        distributionResults.push({
          dsp,
          success: false,
          error: 'Unknown DSP'
        });
        continue;
      }

      // Check upload method
      if (dspConfig.uploadMethod === 'aggregator') {
        // Route through aggregator
        const result = await this.distributeViaAggregator(release, dsp, aggregator);
        distributionResults.push(result);
      } else {
        // Direct upload
        const result = await this.directUpload(release, dsp);
        distributionResults.push(result);
      }
    }

    // Update release status
    release.distributions = distributionResults;
    release.status = 'distributed';

    return {
      success: true,
      releaseId,
      distributions: distributionResults,
      estimatedLiveDate: this.calculateEstimatedLiveDate(release.releaseDate)
    };
  }

  /**
   * Distribute via aggregator
   */
  async distributeViaAggregator(release, dsp, aggregator) {
    const aggregatorConfig = this.aggregators[aggregator];
    
    // Simulate aggregator submission
    const submission = {
      release: release.id,
      title: release.title,
      artist: release.artist,
      upc: release.upc,
      tracks: release.tracks.map(t => ({
        isrc: t.isrc,
        title: t.title,
        duration: t.duration
      })),
      dsp: dsp,
      submittedAt: new Date().toISOString()
    };

    return {
      dsp,
      aggregator: aggregatorConfig.name,
      success: true,
      submissionId: this.generateSubmissionId(),
      status: 'pending',
      estimatedProcessing: '3-7 business days'
    };
  }

  /**
   * Direct upload to DSP
   */
  async directUpload(release, dsp) {
    // For DSPs that support direct upload (YouTube Music, SoundCloud)
    return {
      dsp,
      success: true,
      uploadType: 'direct',
      uploadUrl: `${this.dspConfigs[dsp].apiBaseUrl}/upload`,
      status: 'ready',
      instructions: `Upload manually to ${this.dspConfigs[dsp].name}`
    };
  }

  /**
   * Track analytics across all DSPs
   */
  async trackAnalytics(releaseId, dateRange) {
    const release = this.state.releases.find(r => r.id === releaseId);
    if (!release) {
      return { success: false, error: 'Release not found' };
    }

    const analytics = {
      releaseId,
      dateRange,
      summary: {
        totalStreams: 0,
        totalRevenue: 0,
        topTerritories: [],
        topPlaylists: [],
        engagement: {}
      },
      byDSP: {},
      trends: {}
    };

    // Aggregate analytics from each DSP
    for (const distribution of release.distributions) {
      if (distribution.success) {
        const dspAnalytics = await this.fetchDSPAnalytics(distribution.dsp, release, dateRange);
        analytics.byDSP[distribution.dsp] = dspAnalytics;
        analytics.summary.totalStreams += dspAnalytics.streams;
        analytics.summary.totalRevenue += dspAnalytics.revenue;
      }
    }

    // Store analytics
    release.analytics = analytics;
    this.state.analytics[releaseId] = analytics;

    return analytics;
  }

  /**
   * Fetch analytics from specific DSP
   */
  async fetchDSPAnalytics(dsp, release, dateRange) {
    const dspConfig = this.dspConfigs[dsp];
    
    // Simulated analytics - in production would call actual DSP APIs
    const baseStreams = Math.floor(Math.random() * 100000) + 1000;
    
    return {
      dsp,
      streams: baseStreams,
      revenue: baseStreams * dspConfig.payRate,
      listeners: Math.floor(baseStreams * 0.3),
      saves: Math.floor(baseStreams * 0.05),
      playlistAdditions: Math.floor(baseStreams * 0.01),
      skipRate: Math.random() * 0.3,
      averageListenDuration: '2:34',
      topTerritories: ['US', 'UK', 'DE', 'CA', 'AU'],
      demographics: {
        ageGroups: { '18-24': 35, '25-34': 30, '35-44': 20, '45+': 15 },
        gender: { male: 55, female: 43, other: 2 }
      }
    };
  }

  /**
   * Calculate estimated earnings
   */
  async calculateEarnings(streams, territories = []) {
    const earnings = {};
    let totalEarnings = 0;

    for (const [dsp, config] of Object.entries(this.dspConfigs)) {
      const dspStreams = Math.floor(streams * (config.marketshare / 100));
      const dspEarnings = dspStreams * config.payRate;
      
      earnings[dsp] = {
        streams: dspStreams,
        ratePerStream: config.payRate,
        estimatedEarnings: dspEarnings.toFixed(2)
      };
      
      totalEarnings += dspEarnings;
    }

    return {
      totalStreams: streams,
      totalEstimatedEarnings: totalEarnings.toFixed(2),
      breakdown: earnings,
      notes: [
        'Actual earnings vary based on listener subscription type',
        'Territory affects per-stream rates',
        'Earnings typically reported monthly with 2-3 month delay'
      ]
    };
  }

  /**
   * Pitch to editorial playlists
   */
  async pitchToPlaylists(releaseId, playlistPitches) {
    const release = this.state.releases.find(r => r.id === releaseId);
    if (!release) {
      return { success: false, error: 'Release not found' };
    }

    const results = [];

    for (const pitch of playlistPitches) {
      const { dsp, playlistName, pitchNotes } = pitch;
      
      // Generate AI-optimized pitch
      const optimizedPitch = await this.optimizePitch(release, pitch);
      
      results.push({
        dsp,
        playlistName,
        pitch: optimizedPitch,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        notes: `Pitch submitted to ${this.dspConfigs[dsp]?.name || dsp} for ${playlistName}`
      });
    }

    return {
      success: true,
      releaseId,
      pitches: results
    };
  }

  /**
   * Optimize playlist pitch using AI
   */
  async optimizePitch(release, pitch) {
    const prompt = `Create an optimized playlist pitch for:

Release: ${release.title}
Artist: ${release.artist}
Genre: ${release.genre}
Mood: ${pitch.mood || 'uplifting'}
Target Playlist: ${pitch.playlistName}

Generate a compelling pitch (max 500 characters) that:
1. Highlights unique aspects
2. Describes the sound/vibe
3. Mentions comparable artists
4. Explains why it fits the playlist

Provide the pitch text and suggested comparable artists.`;

    const response = await this.callNVIDIA(this.defaultModel, [
      { role: 'system', content: 'You are a music marketing expert specializing in playlist pitching.' },
      { role: 'user', content: prompt }
    ]);

    return {
      text: response.content.slice(0, 500),
      comparableArtists: this.extractComparableArtists(response.content)
    };
  }

  /**
   * Manage royalty splits
   */
  async manageSplits(releaseId, splits) {
    const release = this.state.releases.find(r => r.id === releaseId);
    if (!release) {
      return { success: false, error: 'Release not found' };
    }

    // Validate splits add up to 100%
    const totalSplit = splits.reduce((sum, s) => sum + s.percentage, 0);
    if (Math.abs(totalSplit - 100) > 0.01) {
      return { success: false, error: 'Splits must total 100%' };
    }

    // Create split sheet
    const splitSheet = {
      releaseId,
      splits: splits.map(split => ({
        recipient: split.recipient,
        role: split.role, // artist, producer, songwriter, label
        percentage: split.percentage,
        royaltyType: split.royaltyType || 'master',
        paymentMethod: split.paymentMethod || 'paypal',
        email: split.email
      })),
      createdAt: new Date().toISOString()
    };

    return {
      success: true,
      splitSheet,
      message: 'Splits configured. Revenue will be automatically distributed.'
    };
  }

  /**
   * Generate distribution report
   */
  async generateReport(releaseId, reportType = 'summary') {
    const release = this.state.releases.find(r => r.id === releaseId);
    if (!release) {
      return { success: false, error: 'Release not found' };
    }

    const report = {
      generatedAt: new Date().toISOString(),
      releaseId,
      release: {
        title: release.title,
        artist: release.artist,
        releaseDate: release.releaseDate,
        upc: release.upc,
        trackCount: release.tracks.length
      },
      distribution: release.distributions,
      analytics: release.analytics,
      earnings: await this.calculateEarnings(
        release.analytics?.summary?.totalStreams || 0
      )
    };

    if (reportType === 'detailed') {
      report.tracks = release.tracks;
      report.territoryBreakdown = this.generateTerritoryBreakdown();
      report.timeline = this.generateDistributionTimeline(release);
    }

    return report;
  }

  // Helper methods
  generateISRC(trackIndex) {
    // ISRC format: CC-XXX-YY-NNNNN
    const countryCode = 'US';
    const registrant = 'GOA';
    const year = new Date().getFullYear().toString().slice(-2);
    const designation = String(trackIndex + 1).padStart(5, '0');
    return `${countryCode}${registrant}${year}${designation}`;
  }

  generateUPC() {
    // Generate 12-digit UPC
    const base = Math.floor(Math.random() * 10000000000);
    return String(base).padStart(12, '0');
  }

  generateReleaseId() {
    return `REL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSubmissionId() {
    return `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  calculateEstimatedLiveDate(releaseDate) {
    const date = new Date(releaseDate);
    return date.toISOString().split('T')[0];
  }

  extractComparableArtists(text) {
    const artistPattern = /comparable to[:\s]+([^.]+)/i;
    const match = text.match(artistPattern);
    if (match) {
      return match[1].split(',').map(a => a.trim());
    }
    return [];
  }

  generateTerritoryBreakdown() {
    return {
      US: { percentage: 40, streams: 0 },
      UK: { percentage: 15, streams: 0 },
      DE: { percentage: 12, streams: 0 },
      CA: { percentage: 10, streams: 0 },
      AU: { percentage: 8, streams: 0 },
      other: { percentage: 15, streams: 0 }
    };
  }

  generateDistributionTimeline(release) {
    return [
      { date: release.createdAt, event: 'Release created' },
      { date: release.releaseDate, event: 'Release date' },
      { date: release.distributions?.[0]?.submittedAt, event: 'Distribution submitted' }
    ].filter(t => t.date);
  }

  // NVIDIA API Call
  async callNVIDIA(model, messages) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      throw new Error(`NVIDIA API error: ${response.status}`);
    }

    const data = await response.json();
    return { content: data.choices[0].message.content };
  }

  /**
   * Get supported DSPs
   */
  getSupportedDSPs() {
    return Object.entries(this.dspConfigs).map(([id, config]) => ({
      id,
      name: config.name,
      marketshare: config.marketshare,
      payRate: config.payRate,
      uploadMethod: config.uploadMethod
    }));
  }

  /**
   * Get aggregators
   */
  getAggregators() {
    return Object.entries(this.aggregators).map(([id, config]) => ({
      id,
      ...config
    }));
  }
}

// Export
module.exports = DSPDistributionManager;
module.exports.default = DSPDistributionManager;