/**
 * DSP Module Index
 * Exports all Digital Service Provider modules
 */

const DSPDistributionManager = require('./DSPDistributionManager');

module.exports = {
  DSPDistributionManager,
  
  // Convenience factory
  createDSPManager: (options = {}) => new DSPDistributionManager(options),
  
  // Supported DSPs
  getSupportedDSPs: () => [
    'spotify', 'appleMusic', 'amazonMusic', 'youtubeMusic',
    'tikTok', 'deezer', 'tidal', 'soundcloud', 'pandora'
  ],
  
  // Aggregators
  getAggregators: () => [
    'distrokid', 'tunecore', 'cdbaby', 'ditto', 'landr', 'stem', 'amuse'
  ],
  
  // DSP pay rates (approximate per stream)
  getPayRates: () => ({
    spotify: 0.00437,
    appleMusic: 0.008,
    youtubeMusic: 0.002,
    amazonMusic: 0.004,
    tidal: 0.0125,
    deezer: 0.0056,
    soundcloud: 0.003
  })
};

module.exports.default = DSPDistributionManager;