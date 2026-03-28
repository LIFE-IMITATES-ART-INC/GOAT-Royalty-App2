/**
 * Blockchain Integrator
 * Multi-chain support for Ethereum, Solana, Polygon, and other networks
 * Handles smart contracts, NFTs, royalty tracking, and payments
 */

class BlockchainIntegrator {
  constructor(options = {}) {
    // Network configurations
    this.networks = {
      ethereum: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        rpcUrl: options.ethereumRpc || process.env.ETHEREUM_RPC || 'https://eth.llamarpc.com',
        explorer: 'https://etherscan.io',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        gasMultiplier: 1.2
      },
      goerli: {
        chainId: 5,
        name: 'Goerli Testnet',
        rpcUrl: options.goerliRpc || process.env.GOERLI_RPC || 'https://eth.goerli.publicnode.com',
        explorer: 'https://goerli.etherscan.io',
        nativeCurrency: { name: 'Goerli Ether', symbol: 'ETH', decimals: 18 },
        gasMultiplier: 1.1
      },
      polygon: {
        chainId: 137,
        name: 'Polygon Mainnet',
        rpcUrl: options.polygonRpc || process.env.POLYGON_RPC || 'https://polygon.llamarpc.com',
        explorer: 'https://polygonscan.com',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        gasMultiplier: 1.0
      },
      mumbai: {
        chainId: 80001,
        name: 'Mumbai Testnet',
        rpcUrl: options.mumbaiRpc || process.env.MUMBAI_RPC || 'https://rpc-mumbai.maticvigil.com',
        explorer: 'https://mumbai.polygonscan.com',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        gasMultiplier: 1.0
      },
      solana: {
        chainId: 'solana-mainnet',
        name: 'Solana Mainnet',
        rpcUrl: options.solanaRpc || process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
        explorer: 'https://explorer.solana.com',
        nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 }
      },
      solanaDevnet: {
        chainId: 'solana-devnet',
        name: 'Solana Devnet',
        rpcUrl: options.solanaDevnetRpc || 'https://api.devnet.solana.com',
        explorer: 'https://explorer.solana.com',
        nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 }
      },
      arbitrum: {
        chainId: 42161,
        name: 'Arbitrum One',
        rpcUrl: options.arbitrumRpc || 'https://arb1.arbitrum.io/rpc',
        explorer: 'https://arbiscan.io',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        gasMultiplier: 1.0
      },
      optimism: {
        chainId: 10,
        name: 'Optimism',
        rpcUrl: options.optimismRpc || 'https://mainnet.optimism.io',
        explorer: 'https://optimistic.etherscan.io',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        gasMultiplier: 1.0
      },
      base: {
        chainId: 8453,
        name: 'Base',
        rpcUrl: options.baseRpc || 'https://mainnet.base.org',
        explorer: 'https://basescan.org',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        gasMultiplier: 1.0
      }
    };

    // Contract templates for royalty management
    this.contractTemplates = {
      royaltyToken: require('./contracts/RoyaltyToken.json'),
      royaltyDistributor: require('./contracts/RoyaltyDistributor.json'),
      nftCollection: require('./contracts/NFTCollection.json'),
      paymentSplitter: require('./contracts/PaymentSplitter.json')
    };

    // Initialize providers (lazy loaded)
    this.providers = {};
    this.contracts = {};
    this.wallets = {};
    
    // Event handlers
    this.eventHandlers = new Map();
    
    // Transaction queue
    this.txQueue = [];
    this.processing = false;
  }

  /**
   * Connect to a specific network
   */
  async connect(networkName, options = {}) {
    const network = this.networks[networkName];
    if (!network) {
      throw new Error(`Unknown network: ${networkName}`);
    }

    try {
      if (networkName.startsWith('solana')) {
        // Solana connection
        const { Connection } = require('@solana/web3.js');
        this.providers[networkName] = new Connection(network.rpcUrl, 'confirmed');
      } else {
        // EVM connection
        const { ethers } = require('ethers');
        this.providers[networkName] = new ethers.JsonRpcProvider(network.rpcUrl);
      }

      // Emit connection event
      this.emit('connected', { network: networkName, timestamp: Date.now() });

      return {
        connected: true,
        network: networkName,
        chainId: network.chainId
      };
    } catch (error) {
      console.error(`Failed to connect to ${networkName}:`, error);
      throw error;
    }
  }

  /**
   * Connect wallet to network
   */
  async connectWallet(networkName, privateKeyOrMnemonic) {
    const network = this.networks[networkName];
    const provider = this.providers[networkName];

    if (!provider) {
      await this.connect(networkName);
    }

    try {
      if (networkName.startsWith('solana')) {
        const { Keypair } = require('@solana/web3.js');
        const bs58 = require('bs58');
        
        let wallet;
        if (privateKeyOrMnemonic.includes(' ')) {
          // Mnemonic
          const { generateMnemonic } = require('bip39');
          const seed = await require('bip39').mnemonicToSeed(privateKeyOrMnemonic);
          wallet = Keypair.fromSeed(seed.slice(0, 32));
        } else {
          // Private key
          wallet = Keypair.fromSecretKey(bs58.decode(privateKeyOrMnemonic));
        }
        
        this.wallets[networkName] = wallet;
        return { address: wallet.publicKey.toString(), network: networkName };
      } else {
        const { ethers } = require('ethers');
        let wallet;
        
        if (privateKeyOrMnemonic.includes(' ')) {
          wallet = ethers.Wallet.fromPhrase(privateKeyOrMnemonic, this.providers[networkName]);
        } else {
          wallet = new ethers.Wallet(privateKeyOrMnemonic, this.providers[networkName]);
        }
        
        this.wallets[networkName] = wallet;
        return { address: wallet.address, network: networkName };
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(networkName, address) {
    const provider = this.providers[networkName];
    const network = this.networks[networkName];

    if (!provider) {
      await this.connect(networkName);
    }

    try {
      if (networkName.startsWith('solana')) {
        const balance = await provider.getBalance(address || this.wallets[networkName].publicKey);
        return {
          balance: balance.toString(),
          formatted: (balance.toNumber() / Math.pow(10, network.nativeCurrency.decimals)).toFixed(6),
          symbol: network.nativeCurrency.symbol
        };
      } else {
        const targetAddress = address || this.wallets[networkName].address;
        const balance = await provider.getBalance(targetAddress);
        return {
          balance: balance.toString(),
          formatted: ethers.formatEther(balance),
          symbol: network.nativeCurrency.symbol
        };
      }
    } catch (error) {
      console.error('Balance check error:', error);
      throw error;
    }
  }

  /**
   * Deploy royalty tracking smart contract
   */
  async deployRoyaltyContract(networkName, params) {
    const { name, symbol, royaltyPercentage, recipients } = params;
    const wallet = this.wallets[networkName];
    
    if (!wallet) {
      throw new Error('Wallet not connected for this network');
    }

    const network = this.networks[networkName];
    
    try {
      if (networkName.startsWith('solana')) {
        // Solana program deployment would go here
        return {
          deployed: false,
          message: 'Solana program deployment requires specific program ID'
        };
      } else {
        const { ethers } = require('ethers');
        
        // Create contract factory
        const contractABI = this.contractTemplates.royaltyToken.abi;
        const contractBytecode = this.contractTemplates.royaltyToken.bytecode;
        
        const factory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
        
        // Deploy with constructor args
        const contract = await factory.deploy(name, symbol, royaltyPercentage, recipients);
        await contract.waitForDeployment();
        
        const address = await contract.getAddress();
        
        // Store contract reference
        this.contracts[address] = {
          network: networkName,
          type: 'royaltyToken',
          contract
        };

        return {
          deployed: true,
          address,
          network: networkName,
          txHash: contract.deploymentTransaction().hash,
          explorer: `${network.explorer}/address/${address}`
        };
      }
    } catch (error) {
      console.error('Contract deployment error:', error);
      throw error;
    }
  }

  /**
   * Create NFT collection with royalty support
   */
  async createNFTCollection(networkName, params) {
    const { name, symbol, baseURI, royaltyRecipient, royaltyPercentage } = params;
    const wallet = this.wallets[networkName];

    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      if (networkName.startsWith('solana')) {
        // Solana Metaplex NFT creation
        return await this.createSolanaNFT(params);
      } else {
        // ERC-721 with royalties (ERC-2981)
        const { ethers } = require('ethers');
        
        const contractABI = this.contractTemplates.nftCollection.abi;
        const contractBytecode = this.contractTemplates.nftCollection.bytecode;
        
        const factory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
        const contract = await factory.deploy(name, symbol, baseURI, royaltyRecipient, royaltyPercentage);
        await contract.waitForDeployment();
        
        const address = await contract.getAddress();
        const network = this.networks[networkName];

        return {
          success: true,
          address,
          name,
          symbol,
          royaltyPercentage,
          network: networkName,
          explorer: `${network.explorer}/address/${address}`
        };
      }
    } catch (error) {
      console.error('NFT collection creation error:', error);
      throw error;
    }
  }

  /**
   * Mint NFT with automatic royalty distribution
   */
  async mintNFT(networkName, contractAddress, recipient, tokenURI) {
    const wallet = this.wallets[networkName];
    
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      if (networkName.startsWith('solana')) {
        // Solana NFT minting
        return await this.mintSolanaNFT(recipient, tokenURI);
      } else {
        const { ethers } = require('ethers');
        
        // Get contract instance
        const contract = await this.getContract(networkName, contractAddress, 'nftCollection');
        
        // Mint NFT
        const tx = await contract.safeMint(recipient, tokenURI);
        const receipt = await tx.wait();
        
        // Parse event for token ID
        const event = receipt.logs.find(log => log.fragment?.name === 'Transfer');
        const tokenId = event ? event.args[2].toString() : 'unknown';

        return {
          success: true,
          tokenId,
          recipient,
          txHash: receipt.hash,
          network: networkName
        };
      }
    } catch (error) {
      console.error('NFT minting error:', error);
      throw error;
    }
  }

  /**
   * Distribute royalties to multiple recipients
   */
  async distributeRoyalties(networkName, params) {
    const { recipients, amounts, tokenAddress } = params;
    const wallet = this.wallets[networkName];

    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    const network = this.networks[networkName];
    const results = [];

    try {
      if (networkName.startsWith('solana')) {
        // Solana distribution
        for (let i = 0; i < recipients.length; i++) {
          const result = await this.sendSol(recipients[i], amounts[i]);
          results.push(result);
        }
      } else {
        const { ethers } = require('ethers');
        
        for (let i = 0; i < recipients.length; i++) {
          const tx = await wallet.sendTransaction({
            to: recipients[i],
            value: ethers.parseEther(amounts[i].toString())
          });
          
          const receipt = await tx.wait();
          results.push({
            recipient: recipients[i],
            amount: amounts[i],
            txHash: receipt.hash,
            success: receipt.status === 1
          });
        }
      }

      return {
        success: true,
        distributions: results,
        network: networkName,
        totalDistributed: amounts.reduce((a, b) => a + b, 0)
      };
    } catch (error) {
      console.error('Royalty distribution error:', error);
      throw error;
    }
  }

  /**
   * Calculate royalty splits based on ownership percentages
   */
  calculateRoyaltySplits(totalAmount, ownership) {
    const splits = [];
    let remainingAmount = totalAmount;

    for (const [address, percentage] of Object.entries(ownership)) {
      const amount = (totalAmount * percentage) / 100;
      splits.push({
        address,
        percentage,
        amount: amount.toFixed(6)
      });
      remainingAmount -= amount;
    }

    // Handle rounding errors
    if (remainingAmount > 0 && splits.length > 0) {
      splits[0].amount = (parseFloat(splits[0].amount) + remainingAmount).toFixed(6);
    }

    return splits;
  }

  /**
   * Track royalty payments across chains
   */
  async trackRoyalties(networkName, contractAddress, fromBlock = 0) {
    const provider = this.providers[networkName];
    const network = this.networks[networkName];

    try {
      if (networkName.startsWith('solana')) {
        // Solana tracking via signatures
        return {
          payments: [],
          message: 'Use Solana signatures for payment tracking'
        };
      } else {
        const { ethers } = require('ethers');
        
        // Get contract
        const contract = await this.getContract(networkName, contractAddress, 'royaltyDistributor');
        
        // Query events
        const filter = contract.filters.RoyaltyPayment();
        const events = await contract.queryFilter(filter, fromBlock);
        
        const payments = events.map(event => ({
          from: event.args.from,
          amount: ethers.formatEther(event.args.amount),
          timestamp: new Date(Number(event.args.timestamp) * 1000).toISOString(),
          txHash: event.transactionHash,
          blockNumber: event.blockNumber
        }));

        return {
          network: networkName,
          contractAddress,
          payments,
          totalPayments: payments.length
        };
      }
    } catch (error) {
      console.error('Royalty tracking error:', error);
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(networkName, txHash) {
    const provider = this.providers[networkName];
    const network = this.networks[networkName];

    try {
      if (networkName.startsWith('solana')) {
        const signature = await provider.getSignatureStatus(txHash);
        return {
          status: signature.confirmationStatus,
          slot: signature.slot,
          confirmations: signature.confirmations
        };
      } else {
        const receipt = await provider.getTransactionReceipt(txHash);
        
        if (!receipt) {
          return { status: 'pending', txHash };
        }

        return {
          status: receipt.status === 1 ? 'success' : 'failed',
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          confirmations: await provider.getBlockNumber() - receipt.blockNumber,
          explorer: `${network.explorer}/tx/${txHash}`
        };
      }
    } catch (error) {
      console.error('Transaction status error:', error);
      throw error;
    }
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(networkName, txParams) {
    const provider = this.providers[networkName];
    const network = this.networks[networkName];

    try {
      if (!networkName.startsWith('solana')) {
        const { ethers } = require('ethers');
        const gasEstimate = await provider.estimateGas(txParams);
        const feeData = await provider.getFeeData();
        
        return {
          gasLimit: gasEstimate.toString(),
          gasPrice: feeData.gasPrice.toString(),
          maxFeePerGas: feeData.maxFeePerGas?.toString(),
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
          estimatedCost: ethers.formatEther(gasEstimate * feeData.gasPrice)
        };
      }
    } catch (error) {
      console.error('Gas estimation error:', error);
      throw error;
    }
  }

  /**
   * Get contract instance
   */
  async getContract(networkName, address, type) {
    const key = `${networkName}-${address}`;
    
    if (this.contracts[key]) {
      return this.contracts[key].contract;
    }

    const provider = this.providers[networkName] || (await this.connect(networkName), this.providers[networkName]);
    const wallet = this.wallets[networkName];
    
    if (!networkName.startsWith('solana')) {
      const { ethers } = require('ethers');
      const contractABI = this.contractTemplates[type]?.abi || [];
      const signer = wallet || provider;
      
      const contract = new ethers.Contract(address, contractABI, signer);
      this.contracts[key] = { network: networkName, type, contract };
      
      return contract;
    }
  }

  /**
   * Event handling
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  emit(event, data) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  /**
   * Get supported networks
   */
  getSupportedNetworks() {
    return Object.entries(this.networks).map(([key, network]) => ({
      id: key,
      name: network.name,
      chainId: network.chainId,
      symbol: network.nativeCurrency.symbol
    }));
  }
}

// Export
module.exports = BlockchainIntegrator;
module.exports.default = BlockchainIntegrator;