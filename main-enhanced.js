/**
 * GOAT Royalty App - Enhanced Electron Main Process
 * 
 * Integrates the complete AI agent system with the Electron app,
 * providing a seamless experience for users.
 * 
 * Features:
 * - AI Agent System
 * - LLM Router
 * - Blockchain Service
 * - All existing GOAT features
 */

const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Import AI systems (will be loaded when needed)
let agentManager = null;
let llmRouter = null;
let blockchainService = null;

// Keep a global reference of the window object
let mainWindow = null;
let serverProcess = null;

// App configuration
const APP_CONFIG = {
  name: 'GOAT Royalty App',
  version: '2.0.0',
  serverPort: 3000,
  aiEnabled: true,
  blockchainEnabled: true
};

// Check if we're in development or production
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

async function initializeAISystems() {
  if (!APP_CONFIG.aiEnabled) return;
  
  console.log('🧠 Initializing AI Agent System...');
  
  try {
    // Dynamically import AI modules
    const { getAgentManager } = require('./lib/agents');
    const { getLLMRouter } = require('./lib/llm/LLMRouter');
    const { getBlockchainService } = require('./lib/blockchain/BlockchainService');
    
    // Initialize agent manager
    agentManager = getAgentManager({
      orchestrator: {
        maxConcurrentTasks: 5,
        approvalThreshold: 0.8,
        verbose: true
      }
    });
    
    // Initialize LLM router
    llmRouter = getLLMRouter({
      nvidiaApiKey: process.env.NVIDIA_API_KEY,
      enableSuperLLM: true
    });
    
    // Connect LLM to agents
    agentManager.setLLMProvider(llmRouter);
    
    // Initialize blockchain service
    blockchainService = getBlockchainService({
      network: 'ethereum'
    });
    
    console.log('✅ AI Systems initialized');
    console.log('   - Orchestrator Agent ready');
    console.log('   - 7 Specialized Agents ready');
    console.log('   - LLM Router ready (215+ models)');
    console.log('   - Blockchain Service ready');
    
  } catch (error) {
    console.error('⚠️ AI Systems initialization error:', error.message);
  }
}

async function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: APP_CONFIG.name,
    icon: path.join(__dirname, 'public', 'icon.png'),
    backgroundColor: '#0a0a0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true
    },
    show: false,
    frame: true,
    titleBarStyle: 'default'
  });

  // Load the app
  if (isDev) {
    // Development: Load from Next.js dev server
    await mainWindow.loadURL(`http://localhost:${APP_CONFIG.serverPort}`);
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Load from built files
    await mainWindow.loadFile(path.join(__dirname, '.next', 'index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('🚀 GOAT Royalty App window ready');
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function startServer() {
  return new Promise((resolve, reject) => {
    console.log('Starting Next.js server...');
    
    serverProcess = spawn('node', ['start-server.js'], {
      cwd: __dirname,
      env: { ...process.env, PORT: APP_CONFIG.serverPort.toString() },
      stdio: 'inherit'
    });
    
    serverProcess.on('error', (err) => {
      console.error('Server error:', err);
      reject(err);
    });
    
    // Give server time to start
    setTimeout(resolve, 3000);
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

// IPC Handlers for AI Agent communication
function setupIPCHandlers() {
  // AI Agent Chat
  ipcMain.handle('ai:chat', async (event, message, context) => {
    if (!agentManager) {
      return { success: false, error: 'AI system not initialized' };
    }
    return await agentManager.chat(message, context);
  });
  
  // Get AI Status
  ipcMain.handle('ai:status', async () => {
    if (!agentManager) {
      return { success: false, error: 'AI system not initialized' };
    }
    return agentManager.getStatus();
  });
  
  // Execute with specific agent
  ipcMain.handle('ai:execute', async (event, agent, task, context) => {
    if (!agentManager) {
      return { success: false, error: 'AI system not initialized' };
    }
    return await agentManager.executeWithAgent(agent, task, context);
  });
  
  // Super LLM Query
  ipcMain.handle('llm:super-query', async (event, messages, options) => {
    if (!llmRouter) {
      return { success: false, error: 'LLM router not initialized' };
    }
    return await llmRouter.superQuery(messages, options);
  });
  
  // Get available models
  ipcMain.handle('llm:models', async () => {
    if (!llmRouter) {
      return { success: false, error: 'LLM router not initialized' };
    }
    return llmRouter.getAvailableModels();
  });
  
  // Blockchain: Connect wallet
  ipcMain.handle('blockchain:connect', async (event, privateKey) => {
    if (!blockchainService) {
      return { success: false, error: 'Blockchain service not initialized' };
    }
    return await blockchainService.connectWallet(privateKey);
  });
  
  // Blockchain: Get balance
  ipcMain.handle('blockchain:balance', async (event, address) => {
    if (!blockchainService) {
      return { success: false, error: 'Blockchain service not initialized' };
    }
    return await blockchainService.getBalance(address);
  });
  
  // Blockchain: Verify royalty
  ipcMain.handle('blockchain:verify', async (event, txHash) => {
    if (!blockchainService) {
      return { success: false, error: 'Blockchain service not initialized' };
    }
    return await blockchainService.verifyRoyalty(txHash);
  });
  
  // Blockchain: Mint NFT
  ipcMain.handle('blockchain:mint-nft', async (event, metadata) => {
    if (!blockchainService) {
      return { success: false, error: 'Blockchain service not initialized' };
    }
    return await blockchainService.mintMusicNFT(metadata);
  });
  
  // Blockchain: Mining simulation
  ipcMain.handle('blockchain:mine', async (event, config) => {
    if (!blockchainService) {
      return { success: false, error: 'Blockchain service not initialized' };
    }
    return await blockchainService.simulateMining(config);
  });
  
  console.log('✅ IPC Handlers registered');
}

// App lifecycle events
app.whenReady().then(async () => {
  console.log('🐐 GOAT Royalty App starting...');
  
  // Initialize AI systems
  await initializeAISystems();
  
  // Setup IPC handlers
  setupIPCHandlers();
  
  // Start server in development
  if (isDev) {
    await startServer();
  }
  
  // Create window
  await createWindow();
  
  console.log('✅ GOAT Royalty App ready');
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopServer();
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

// Cleanup on exit
app.on('before-quit', () => {
  stopServer();
});

// Export for testing
module.exports = {
  APP_CONFIG,
  initializeAISystems,
  getAgentManager: () => agentManager,
  getLLMRouter: () => llmRouter,
  getBlockchainService: () => blockchainService
};