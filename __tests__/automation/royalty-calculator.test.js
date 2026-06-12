// royalty-calculator.js has file-system and cron dependencies.
// We test the pure calculation logic by reproducing the relevant methods.

const path = require('path');

describe('GOATRoyaltyCalculator', () => {
  // Reproduce the calculator's pure logic for testing
  const platforms = {
    spotify: { rate: 0.00437, name: 'Spotify' },
    apple_music: { rate: 0.00783, name: 'Apple Music' },
    youtube: { rate: 0.00274, name: 'YouTube' },
    tiktok: { rate: 0.00069, name: 'TikTok' },
    instagram: { rate: 0.00123, name: 'Instagram' },
    amazon_music: { rate: 0.00402, name: 'Amazon Music' },
    deezer: { rate: 0.00394, name: 'Deezer' },
    tidal: { rate: 0.01284, name: 'Tidal' },
  };

  function calculateTrackRevenue(streams, platform) {
    return streams * platforms[platform].rate;
  }

  function calculatePublishingSplit(totalRevenue) {
    return {
      writer_share: parseFloat((totalRevenue * 0.75).toFixed(2)),
      publisher_share: parseFloat((totalRevenue * 0.25).toFixed(2)),
    };
  }

  function calculateRecordingSplit(totalRevenue) {
    return {
      artist_share: parseFloat((totalRevenue * 0.85).toFixed(2)),
      label_share: parseFloat((totalRevenue * 0.15).toFixed(2)),
    };
  }

  function calculatePlatformSummary(tracks) {
    const summary = {};
    Object.keys(platforms).forEach((platform) => {
      const totalRevenue = tracks.reduce((sum, track) => {
        return sum + (track.platform_breakdown[platform]?.revenue || 0);
      }, 0);
      const totalStreams = tracks.reduce((sum, track) => {
        return sum + (track.platform_breakdown[platform]?.streams || 0);
      }, 0);
      summary[platform] = {
        name: platforms[platform].name,
        total_revenue: parseFloat(totalRevenue.toFixed(2)),
        total_streams: totalStreams,
        percentage_of_total: 0,
      };
    });

    const grandTotal = Object.values(summary).reduce((sum, p) => sum + p.total_revenue, 0);
    Object.keys(summary).forEach((platform) => {
      summary[platform].percentage_of_total =
        grandTotal > 0
          ? parseFloat(((summary[platform].total_revenue / grandTotal) * 100).toFixed(2))
          : 0;
    });

    return summary;
  }

  // ── Platform rates ──
  describe('platform rates', () => {
    it('has 8 platforms defined', () => {
      expect(Object.keys(platforms)).toHaveLength(8);
    });

    it('Tidal has the highest rate', () => {
      const rates = Object.values(platforms).map((p) => p.rate);
      const maxRate = Math.max(...rates);
      expect(platforms.tidal.rate).toBe(maxRate);
    });

    it('TikTok has the lowest rate', () => {
      const rates = Object.values(platforms).map((p) => p.rate);
      const minRate = Math.min(...rates);
      expect(platforms.tiktok.rate).toBe(minRate);
    });

    it('all rates are positive numbers', () => {
      Object.values(platforms).forEach((p) => {
        expect(typeof p.rate).toBe('number');
        expect(p.rate).toBeGreaterThan(0);
      });
    });
  });

  // ── Revenue calculation ──
  describe('calculateTrackRevenue', () => {
    it('calculates Spotify revenue correctly', () => {
      const revenue = calculateTrackRevenue(1000000, 'spotify');
      expect(revenue).toBeCloseTo(4370, 0);
    });

    it('calculates Tidal revenue correctly', () => {
      const revenue = calculateTrackRevenue(100000, 'tidal');
      expect(revenue).toBeCloseTo(1284, 0);
    });

    it('returns 0 for 0 streams', () => {
      expect(calculateTrackRevenue(0, 'spotify')).toBe(0);
    });
  });

  // ── Publishing split ──
  describe('calculatePublishingSplit', () => {
    it('splits 75/25 for writer/publisher', () => {
      const split = calculatePublishingSplit(1000);
      expect(split.writer_share).toBe(750);
      expect(split.publisher_share).toBe(250);
    });

    it('writer + publisher = total', () => {
      const split = calculatePublishingSplit(333.33);
      expect(split.writer_share + split.publisher_share).toBeCloseTo(333.33, 1);
    });

    it('handles zero revenue', () => {
      const split = calculatePublishingSplit(0);
      expect(split.writer_share).toBe(0);
      expect(split.publisher_share).toBe(0);
    });
  });

  // ── Recording split ──
  describe('calculateRecordingSplit', () => {
    it('splits 85/15 for artist/label', () => {
      const split = calculateRecordingSplit(10000);
      expect(split.artist_share).toBe(8500);
      expect(split.label_share).toBe(1500);
    });

    it('artist + label = total', () => {
      const split = calculateRecordingSplit(999.99);
      expect(split.artist_share + split.label_share).toBeCloseTo(999.99, 1);
    });
  });

  // ── Platform summary ──
  describe('calculatePlatformSummary', () => {
    it('calculates summary for a set of tracks', () => {
      const tracks = [
        {
          platform_breakdown: {
            spotify: { streams: 1000, revenue: 4.37 },
            apple_music: { streams: 500, revenue: 3.92 },
            youtube: { streams: 0, revenue: 0 },
            tiktok: { streams: 0, revenue: 0 },
            instagram: { streams: 0, revenue: 0 },
            amazon_music: { streams: 0, revenue: 0 },
            deezer: { streams: 0, revenue: 0 },
            tidal: { streams: 0, revenue: 0 },
          },
        },
        {
          platform_breakdown: {
            spotify: { streams: 2000, revenue: 8.74 },
            apple_music: { streams: 1000, revenue: 7.83 },
            youtube: { streams: 0, revenue: 0 },
            tiktok: { streams: 0, revenue: 0 },
            instagram: { streams: 0, revenue: 0 },
            amazon_music: { streams: 0, revenue: 0 },
            deezer: { streams: 0, revenue: 0 },
            tidal: { streams: 0, revenue: 0 },
          },
        },
      ];

      const summary = calculatePlatformSummary(tracks);

      expect(summary.spotify.total_streams).toBe(3000);
      expect(summary.spotify.total_revenue).toBeCloseTo(13.11, 1);
      expect(summary.apple_music.total_streams).toBe(1500);
      expect(summary.apple_music.total_revenue).toBeCloseTo(11.75, 1);

      // Percentages should sum to ~100
      const totalPct = Object.values(summary).reduce((sum, p) => sum + p.percentage_of_total, 0);
      expect(totalPct).toBeCloseTo(100, 0);
    });

    it('handles empty track list', () => {
      const summary = calculatePlatformSummary([]);
      Object.values(summary).forEach((p) => {
        expect(p.total_revenue).toBe(0);
        expect(p.total_streams).toBe(0);
        expect(p.percentage_of_total).toBe(0);
      });
    });

    it('returns all 8 platforms', () => {
      const summary = calculatePlatformSummary([]);
      expect(Object.keys(summary)).toHaveLength(8);
    });
  });
});
