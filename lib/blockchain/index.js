/**
 * Blockchain Module Index
 * Exports all blockchain-related modules
 */

const BlockchainIntegrator = require('./BlockchainIntegrator');

module.exports = {
  BlockchainIntegrator,
  
  // Convenience factory
  createBlockchainIntegrator: (options = {}) => new BlockchainIntegrator(options),
  
  // Supported networks
  getSupportedNetworks: () => [
    'ethereum', 'goerli',
    'polygon', 'mumbai',
    'solana', 'solanaDevnet',
    'arbitrum', 'optimism', 'base'
  ],
  
  // Network info
  getNetworkInfo: (network) => {
    const networks = {
      ethereum: { chainId: 1, symbol: 'ETH', name: 'Ethereum Mainnet' },
      polygon: { chainId: 137, symbol: 'MATIC', name: 'Polygon Mainnet' },
      solana: { chainId: 'solana', symbol: 'SOL', name: 'Solana Mainnet' },
      arbitrum: { chainId: 42161, symbol: 'ETH', name: 'Arbitrum One' },
      optimism: { chainId: 10, symbol: 'ETH', name: 'Optimism' },
      base: { chainId: 8453, symbol: 'ETH', name: 'Base' }
    };
    return networks[network] || null;
  }
};

module.exports.default = BlockchainIntegrator;