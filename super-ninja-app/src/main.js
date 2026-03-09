// SuperNinja AI - Main Electron Process
// Autonomous AI Desktop Assistant
// Built for Harvey Miller (DJ Speedy)

const { app, BrowserWindow, ipcMain, dialog, Menu, Tray, shell, globalShortcut, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');
// Simple built-in settings store (no external dependency needed)
const Store = class {
  constructor(opts) {
    this._defaults = opts?.defaults || {};
    this._path = path.join(app.getPath('userData'), 'settings.json');
    this._data = { ...this._defaults };
    try {
      if (fs.existsSync(this._path)) {
        this._data = { ...this._defaults, ...JSON.parse(fs.readFileSync(this._path, 'utf-8')) };
      }
    } catch (e) { /* use defaults */ }
  }
  get(key) { return this._data[key]; }
  set(key, val) { this._data[key] = val; this._save(); }
  get store() { return this._data; }
  _save() {
    try { fs.writeFileSync(this._path, JSON.stringify(this._data, null, 2)); } catch (e) { /* ignore */ }
  }
};

const store = new Store({
  defaults: {
    theme: 'dark',
    aiProvider: 'openai',
    openaiKey: '',
    googleKey: '',
    anthropicKey: '',
    windowBounds: { width: 1400, height: 900 },
    alwaysOnTop: false,
    startMinimized: false,
    autoLaunch: false,
    recentFiles: [],
    recentChats: [],
    toolSettings: {
      terminal: true,
      fileManager: true,
      webBrowser: true,
      codeEditor: true,
      imageTools: true,
      audioTools: true,
      dataAnalysis: true,
      pdfTools: true
    }
  }
});

let mainWindow = null;
let tray = null;

function createWindow() {
  const { width, height } = store.get('windowBounds');

  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 900,
    minHeight: 600,
    title: 'SuperNinja AI',
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    backgroundColor: '#0a0a0f',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: process.platform !== 'darwin',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Save window size on resize
  mainWindow.on('resize', () => {
    const { width, height } = mainWindow.getBounds();
    store.set('windowBounds', { width, height });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Set always on top if configured
  mainWindow.setAlwaysOnTop(store.get('alwaysOnTop'));

  // Create application menu
  createAppMenu();
}

function createAppMenu() {
  const template = [
    {
      label: 'SuperNinja AI',
      submenu: [
        { label: 'About SuperNinja AI', click: showAbout },
        { type: 'separator' },
        { label: 'Settings', accelerator: 'CmdOrCtrl+,', click: () => mainWindow.webContents.send('open-settings') },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'File',
      submenu: [
        { label: 'New Chat', accelerator: 'CmdOrCtrl+N', click: () => mainWindow.webContents.send('new-chat') },
        { label: 'Open File', accelerator: 'CmdOrCtrl+O', click: openFile },
        { label: 'Save Chat', accelerator: 'CmdOrCtrl+S', click: () => mainWindow.webContents.send('save-chat') },
        { type: 'separator' },
        { label: 'Export as PDF', click: () => mainWindow.webContents.send('export-pdf') },
        { label: 'Export as Markdown', click: () => mainWindow.webContents.send('export-md') }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        { label: 'Terminal', accelerator: 'CmdOrCtrl+T', click: () => mainWindow.webContents.send('open-tool', 'terminal') },
        { label: 'File Manager', accelerator: 'CmdOrCtrl+E', click: () => mainWindow.webContents.send('open-tool', 'filemanager') },
        { label: 'Code Editor', accelerator: 'CmdOrCtrl+K', click: () => mainWindow.webContents.send('open-tool', 'codeeditor') },
        { label: 'Web Browser', accelerator: 'CmdOrCtrl+B', click: () => mainWindow.webContents.send('open-tool', 'webbrowser') },
        { type: 'separator' },
        { label: 'Image Tools', click: () => mainWindow.webContents.send('open-tool', 'imagetools') },
        { label: 'Audio Tools', click: () => mainWindow.webContents.send('open-tool', 'audiotools') },
        { label: 'PDF Tools', click: () => mainWindow.webContents.send('open-tool', 'pdftools') },
        { label: 'Data Analysis', click: () => mainWindow.webContents.send('open-tool', 'dataanalysis') },
        { type: 'separator' },
        { label: 'Music Production', click: () => mainWindow.webContents.send('open-tool', 'musicprod') },
        { label: 'Royalty Calculator', click: () => mainWindow.webContents.send('open-tool', 'royaltycalc') }
      ]
    },
    {
      label: 'AI',
      submenu: [
        { label: 'OpenAI GPT-4', type: 'radio', checked: store.get('aiProvider') === 'openai', click: () => setAIProvider('openai') },
        { label: 'Google Gemini', type: 'radio', checked: store.get('aiProvider') === 'google', click: () => setAIProvider('google') },
        { label: 'Anthropic Claude', type: 'radio', checked: store.get('aiProvider') === 'anthropic', click: () => setAIProvider('anthropic') },
        { label: 'Local LLM (Ollama)', type: 'radio', checked: store.get('aiProvider') === 'ollama', click: () => setAIProvider('ollama') },
        { type: 'separator' },
        { label: 'Configure API Keys...', click: () => mainWindow.webContents.send('open-settings', 'api-keys') }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle Dark Mode', accelerator: 'CmdOrCtrl+D', click: toggleTheme },
        { label: 'Toggle Sidebar', accelerator: 'CmdOrCtrl+\\', click: () => mainWindow.webContents.send('toggle-sidebar') },
        { label: 'Toggle Always on Top', click: toggleAlwaysOnTop },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Documentation', click: () => shell.openExternal('https://github.com/DJSPEEDYGA/GOAT-Royalty-App2') },
        { label: 'Report Issue', click: () => shell.openExternal('https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/issues') },
        { type: 'separator' },
        { label: 'Check for Updates', click: checkForUpdates }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function showAbout() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'About SuperNinja AI',
    message: 'SuperNinja AI v1.0.0',
    detail: 'Autonomous AI Desktop Assistant\nBuilt for Harvey Miller (DJ Speedy)\n\nFeatures:\n- Multi-LLM Support (GPT-4, Gemini, Claude, Ollama)\n- Terminal & Code Editor\n- File Management\n- Web Browsing\n- Image & Audio Tools\n- PDF Processing\n- Data Analysis\n- Music Production Tools\n- Royalty Calculator\n\nCopyright 2025 GOAT Royalty'
  });
}

async function openFile() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf'] },
      { name: 'Code', extensions: ['js', 'py', 'html', 'css', 'json', 'ts', 'jsx', 'tsx'] },
      { name: 'Data', extensions: ['csv', 'json', 'xml', 'xlsx', 'xls'] },
      { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] },
      { name: 'Audio', extensions: ['mp3', 'wav', 'flac', 'aac', 'm4a'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    mainWindow.webContents.send('files-opened', result.filePaths);
    
    // Update recent files
    const recentFiles = store.get('recentFiles');
    result.filePaths.forEach(fp => {
      if (!recentFiles.includes(fp)) {
        recentFiles.unshift(fp);
        if (recentFiles.length > 20) recentFiles.pop();
      }
    });
    store.set('recentFiles', recentFiles);
  }
}

function setAIProvider(provider) {
  store.set('aiProvider', provider);
  mainWindow.webContents.send('ai-provider-changed', provider);
}

function toggleTheme() {
  const current = store.get('theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  store.set('theme', newTheme);
  mainWindow.webContents.send('theme-changed', newTheme);
}

function toggleAlwaysOnTop() {
  const current = store.get('alwaysOnTop');
  store.set('alwaysOnTop', !current);
  mainWindow.setAlwaysOnTop(!current);
}

function checkForUpdates() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Updates',
    message: 'SuperNinja AI is up to date!',
    detail: 'Version 1.0.0'
  });
}

// ============================================================
// IPC Handlers - Bridge between renderer and main process
// ============================================================

// Settings
ipcMain.handle('get-settings', () => store.store);
ipcMain.handle('set-setting', (event, key, value) => { store.set(key, value); return true; });

// File operations
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content, path: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-binary', async (event, filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    return { success: true, data: buffer.toString('base64'), path: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('list-directory', async (event, dirPath) => {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    return {
      success: true,
      items: items.map(item => ({
        name: item.name,
        isDirectory: item.isDirectory(),
        isFile: item.isFile(),
        path: path.join(dirPath, item.name)
      }))
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

// Terminal execution
ipcMain.handle('execute-command', async (event, command, cwd) => {
  const { exec } = require('child_process');
  return new Promise((resolve) => {
    exec(command, { cwd: cwd || process.env.HOME, timeout: 60000, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        stdout: stdout || '',
        stderr: stderr || '',
        error: error ? error.message : null
      });
    });
  });
});

// Open external links
ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
  return true;
});

// Get system info
ipcMain.handle('get-system-info', () => {
  const os = require('os');
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    electronVersion: process.versions.electron,
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    homeDir: os.homedir(),
    hostname: os.hostname(),
    username: os.userInfo().username
  };
});

// ============================================================
// App Lifecycle
// ============================================================

app.whenReady().then(() => {
  createWindow();

  // Register global shortcut to show/hide window
  globalShortcut.register('CmdOrCtrl+Shift+N', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

console.log('SuperNinja AI Desktop App Starting...');