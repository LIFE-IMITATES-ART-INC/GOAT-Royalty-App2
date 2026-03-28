/**
 * Crypto Module Index
 * Exports all cryptocurrency-related modules
 */

const CryptoMiningOptimizer = require('./CryptoMiningOptimizer');

module.exports = {
  CryptoMiningOptimizer,
  
  // Convenience factory
  createMiningOptimizer: (options = {}) => new CryptoMiningOptimizer(options),
  
  // Supported coins
  getSupportedCoins: () => [
    'bitcoin', 'ethereum', 'litecoin', 'kaspa', 'monero', 'ravencoin'
  ],
  
  // Supported miners
  getSupportedMiners: () => [
    't_rex', 'gminer', 'lolminer', 'phoenixMiner', 'teamRedMiner', 'xmrig'
  ],
  
  // Hardware profiles
  getHardwareProfiles: () => ({
    nvidia: ['RTX 4090', 'RTX 4080', 'RTX 3090', 'RTX 3080', 'RTX 3070', 'RTX 3060 Ti'],
    amd: ['RX 7900 XTX', 'RX 6900 XT', 'RX 6800 XT'],
    asic: ['S19 Pro', 'S19 XP', 'L7', 'KA3']
  })
};

module.exports.default = CryptoMiningOptimizer;