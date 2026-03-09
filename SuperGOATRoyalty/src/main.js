// ============================================================================
// SUPER GOAT ROYALTY - ULTIMATE DESKTOP APPLICATION
// Main Electron Process - The Brain of the Operation
// Copyright © 2025 Harvey Miller (DJ Speedy) / GOAT Royalty
// All Rights Reserved
// ============================================================================

const { app, BrowserWindow, ipcMain, Menu, Tray, dialog, shell, 
        globalShortcut, nativeTheme, clipboard, screen, session } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, spawn, execSync } = require('child_process');
const http = require('http');
const https = require('https');
const os = require('os');
const url = require('url');

// ============================================================================
// CONFIGURATION
// ============================================================================
const APP_NAME = 'Super GOAT Royalty';
const APP_VERSION = '4.0.0';
const DEFAULT_PORT = 3000;
const FALLBACK_PORTS = [3001, 3002, 3003, 8080, 8888];
const isDev = !app.isPackaged || process.argv.includes('--dev');

// Settings store (built-in, no external dependency)
const settingsPath = path.join(app.getPath('userData'), 'settings.json');
let settings = loadSettings();

function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }
  } catch (e) { console.error('Settings load error:', e); }
  return {
    theme: 'dark',
    serverUrl: '',
    apiKeys: {},
    windowBounds: { width: 1600, height: 1000 },
    alwaysOnTop: false,
    startMinimized: false,
    autoLaunch: false,
    terminalHistory: [],
    recentFiles: [],
    llmProvider: 'gemini',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama3',
    serverIP1: '72.61.193.184',
    serverIP2: '93.127.214.171',
    sshUser: 'root'
  };
}

function saveSettings() {
  try {
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (e) { console.error('Settings save error:', e); }
}

// ============================================================================
// WINDOW MANAGEMENT
// ============================================================================
let mainWindow = null;
let splashWindow = null;
let tray = null;
let terminalProcesses = new Map();
let serverProcess = null;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 500, height: 350,
    frame: false, transparent: true,
    alwaysOnTop: true, resizable: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });
  
  const splashHTML = `
  <!DOCTYPE html>
  <html><head><style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { 
      background: linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 30%, #0d1117 70%, #000 100%);
      color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex; align-items: center; justify-content: center; height: 100vh;
      border-radius: 20px; overflow: hidden;
    }
    .container { text-align: center; }
    .logo { font-size: 64px; margin-bottom: 10px; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    h1 { font-size: 28px; background: linear-gradient(135deg, #FFD700, #FF6B35, #FFD700);
         -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 5px; }
    .version { color: #888; font-size: 14px; margin-bottom: 25px; }
    .loader { width: 200px; height: 4px; background: #222; border-radius: 2px; margin: 0 auto; overflow: hidden; }
    .loader-bar { height: 100%; background: linear-gradient(90deg, #FFD700, #FF6B35, #FFD700);
                  width: 0%; border-radius: 2px; animation: load 3s ease-in-out forwards; }
    @keyframes load { 0% { width: 0%; } 100% { width: 100%; } }
    .status { color: #666; font-size: 12px; margin-top: 15px; }
  </style></head><body>
    <div class="container">
      <div class="logo">🐐⚡</div>
      <h1>SUPER GOAT ROYALTY</h1>
      <div class="version">v${APP_VERSION} — Ultimate Edition</div>
      <div class="loader"><div class="loader-bar"></div></div>
      <div class="status">Initializing AI Systems...</div>
    </div>
  </body></html>`;
  
  splashWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(splashHTML));
}

function createMainWindow() {
  const bounds = settings.windowBounds || { width: 1600, height: 1000 };
  
  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: 1024,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      sandbox: false,
      webSecurity: false
    },
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.destroy();
      splashWindow = null;
    }
    mainWindow.show();
    if (settings.alwaysOnTop) mainWindow.setAlwaysOnTop(true);
  });

  mainWindow.on('resize', () => {
    const [w, h] = mainWindow.getSize();
    settings.windowBounds = { width: w, height: h };
    saveSettings();
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

// ============================================================================
// SYSTEM TRAY
// ============================================================================
function createTray() {
  try {
    const iconPath = path.join(__dirname, '..', 'assets', 'icon.png');
    if (!fs.existsSync(iconPath)) return;
    
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      { label: `🐐 ${APP_NAME} v${APP_VERSION}`, enabled: false },
      { type: 'separator' },
      { label: '🏠 Show App', click: () => { if (mainWindow) mainWindow.show(); } },
      { label: '🎵 Music Dashboard', click: () => mainWindow?.webContents.send('navigate', 'dashboard') },
      { label: '🤖 AI Chat', click: () => mainWindow?.webContents.send('navigate', 'ai-chat') },
      { label: '💰 Royalty Calculator', click: () => mainWindow?.webContents.send('navigate', 'royalties') },
      { label: '🖥️ Terminal', click: () => mainWindow?.webContents.send('navigate', 'terminal') },
      { type: 'separator' },
      { label: '⚙️ Settings', click: () => mainWindow?.webContents.send('navigate', 'settings') },
      { label: '🔄 Restart', click: () => { app.relaunch(); app.exit(); } },
      { type: 'separator' },
      { label: '❌ Quit', click: () => app.quit() }
    ]);
    tray.setToolTip(`${APP_NAME} v${APP_VERSION}`);
    tray.setContextMenu(contextMenu);
    tray.on('click', () => { if (mainWindow) mainWindow.show(); });
  } catch (e) { console.error('Tray error:', e); }
}

// ============================================================================
// IPC HANDLERS - Communication Bridge
// ============================================================================
function setupIPC() {
  // --- Window Controls ---
  ipcMain.handle('window:minimize', () => mainWindow?.minimize());
  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize();
    else mainWindow?.maximize();
    return mainWindow?.isMaximized();
  });
  ipcMain.handle('window:close', () => mainWindow?.close());
  ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized());
  ipcMain.handle('window:setAlwaysOnTop', (_, val) => {
    mainWindow?.setAlwaysOnTop(val);
    settings.alwaysOnTop = val;
    saveSettings();
  });

  // --- Settings ---
  ipcMain.handle('settings:get', () => settings);
  ipcMain.handle('settings:set', (_, key, value) => {
    settings[key] = value;
    saveSettings();
    return true;
  });
  ipcMain.handle('settings:getAll', () => settings);
  ipcMain.handle('settings:setAll', (_, newSettings) => {
    Object.assign(settings, newSettings);
    saveSettings();
    return true;
  });

  // --- System Info ---
  ipcMain.handle('system:info', () => ({
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    electronVersion: process.versions.electron,
    appVersion: APP_VERSION,
    appName: APP_NAME,
    hostname: os.hostname(),
    cpus: os.cpus().length,
    totalMemory: (os.totalmem() / 1073741824).toFixed(1) + ' GB',
    freeMemory: (os.freemem() / 1073741824).toFixed(1) + ' GB',
    uptime: (os.uptime() / 3600).toFixed(1) + ' hours',
    homeDir: os.homedir(),
    tempDir: os.tmpdir(),
    userInfo: os.userInfo().username
  }));

  // --- Terminal / Command Execution ---
  ipcMain.handle('terminal:execute', async (_, command, cwd) => {
    return new Promise((resolve) => {
      const workDir = cwd || os.homedir();
      const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/bash';
      const shellFlag = process.platform === 'win32' ? '/c' : '-c';
      
      exec(command, { 
        cwd: workDir, 
        shell: true,
        maxBuffer: 1024 * 1024 * 10,
        timeout: 60000,
        env: { ...process.env, TERM: 'xterm-256color' }
      }, (error, stdout, stderr) => {
        resolve({
          stdout: stdout || '',
          stderr: stderr || '',
          error: error ? error.message : null,
          code: error ? error.code : 0
        });
      });
    });
  });

  // --- SSH to Servers ---
  ipcMain.handle('ssh:execute', async (_, { host, user, command }) => {
    return new Promise((resolve) => {
      const sshCmd = `ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${user || 'root'}@${host} "${command.replace(/"/g, '\&quot;')}"`;
      exec(sshCmd, { timeout: 30000, maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
        resolve({ stdout: stdout || '', stderr: stderr || '', error: error?.message || null });
      });
    });
  });

  // --- File System ---
  ipcMain.handle('fs:readFile', async (_, filePath) => {
    try { return { data: fs.readFileSync(filePath, 'utf8'), error: null }; }
    catch (e) { return { data: null, error: e.message }; }
  });
  ipcMain.handle('fs:writeFile', async (_, filePath, content) => {
    try { fs.writeFileSync(filePath, content, 'utf8'); return { error: null }; }
    catch (e) { return { error: e.message }; }
  });
  ipcMain.handle('fs:readDir', async (_, dirPath) => {
    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      return { data: items.map(i => ({ name: i.name, isDir: i.isDirectory(), isFile: i.isFile() })), error: null };
    } catch (e) { return { data: null, error: e.message }; }
  });
  ipcMain.handle('fs:exists', async (_, p) => fs.existsSync(p));
  ipcMain.handle('fs:mkdir', async (_, p) => {
    try { fs.mkdirSync(p, { recursive: true }); return true; } catch { return false; }
  });
  ipcMain.handle('fs:delete', async (_, p) => {
    try { fs.rmSync(p, { recursive: true, force: true }); return true; } catch { return false; }
  });
  ipcMain.handle('fs:stat', async (_, p) => {
    try {
      const s = fs.statSync(p);
      return { size: s.size, isDir: s.isDirectory(), modified: s.mtime, created: s.birthtime };
    } catch { return null; }
  });

  // --- Dialog ---
  ipcMain.handle('dialog:openFile', async (_, options) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', ...(options?.multi ? ['multiSelections'] : [])],
      filters: options?.filters || [{ name: 'All Files', extensions: ['*'] }]
    });
    return result.filePaths;
  });
  ipcMain.handle('dialog:openDir', async () => {
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
    return result.filePaths[0] || null;
  });
  ipcMain.handle('dialog:saveFile', async (_, options) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: options?.defaultPath,
      filters: options?.filters || [{ name: 'All Files', extensions: ['*'] }]
    });
    return result.filePath || null;
  });

  // --- Shell ---
  ipcMain.handle('shell:openExternal', (_, url) => shell.openExternal(url));
  ipcMain.handle('shell:openPath', (_, p) => shell.openPath(p));
  ipcMain.handle('shell:showItemInFolder', (_, p) => shell.showItemInFolder(p));

  // --- Clipboard ---
  ipcMain.handle('clipboard:read', () => clipboard.readText());
  ipcMain.handle('clipboard:write', (_, text) => clipboard.writeText(text));

  // --- AI / LLM ---
  ipcMain.handle('ai:chat', async (_, { provider, model, messages, apiKey }) => {
    try {
      return await callLLM(provider || settings.llmProvider, model, messages, apiKey);
    } catch (e) { return { error: e.message }; }
  });

  ipcMain.handle('ai:ollama:models', async () => {
    try {
      const response = await fetchJSON(`${settings.ollamaUrl}/api/tags`);
      return response.models || [];
    } catch { return []; }
  });

  ipcMain.handle('ai:ollama:pull', async (_, modelName) => {
    return new Promise((resolve) => {
      exec(`curl -s ${settings.ollamaUrl}/api/pull -d '{"name":"${modelName}"}'`, 
        { timeout: 300000 }, (err, stdout) => {
        resolve(err ? { error: err.message } : { success: true, output: stdout });
      });
    });
  });

  // --- Server Management ---
  ipcMain.handle('server:start', async (_, { port, projectDir }) => {
    return startLocalServer(port || DEFAULT_PORT, projectDir);
  });
  ipcMain.handle('server:stop', () => {
    if (serverProcess) { serverProcess.kill(); serverProcess = null; }
    return true;
  });
  ipcMain.handle('server:status', () => ({
    running: !!serverProcess,
    pid: serverProcess?.pid
  }));

  // --- Git Operations ---
  ipcMain.handle('git:execute', async (_, { command, cwd }) => {
    return new Promise((resolve) => {
      exec(`git ${command}`, { cwd: cwd || os.homedir(), timeout: 30000 }, (err, stdout, stderr) => {
        resolve({ stdout, stderr, error: err?.message });
      });
    });
  });

  // --- Network / HTTP ---
  ipcMain.handle('http:fetch', async (_, { url, method, headers, body }) => {
    try {
      const response = await fetchURL(url, method, headers, body);
      return response;
    } catch (e) { return { error: e.message }; }
  });

  // --- App Controls ---
  ipcMain.handle('app:getVersion', () => APP_VERSION);
  ipcMain.handle('app:getPlatform', () => process.platform);
  ipcMain.handle('app:relaunch', () => { app.relaunch(); app.exit(); });
  ipcMain.handle('app:quit', () => app.quit());

  // --- System Monitor ---
  ipcMain.handle('system:monitor', () => {
    const cpus = os.cpus();
    const cpuUsage = cpus.map(c => {
      const total = Object.values(c.times).reduce((a,b) => a+b, 0);
      return ((total - c.times.idle) / total * 100).toFixed(1);
    });
    return {
      cpuUsage: (cpuUsage.reduce((a,b) => a + parseFloat(b), 0) / cpuUsage.length).toFixed(1),
      cpuCores: cpus.length,
      cpuModel: cpus[0]?.model || 'Unknown',
      totalMem: os.totalmem(),
      freeMem: os.freemem(),
      usedMem: os.totalmem() - os.freemem(),
      memPercent: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(1),
      uptime: os.uptime(),
      platform: os.platform(),
      hostname: os.hostname(),
      loadAvg: os.loadavg()
    };
  });

  // --- Disk Usage ---
  ipcMain.handle('system:disk', async () => {
    return new Promise((resolve) => {
      const cmd = process.platform === 'win32' ? 'wmic logicaldisk get size,freespace,caption' : 'df -h / | tail -1';
      exec(cmd, { timeout: 5000 }, (err, stdout) => {
        resolve(stdout?.trim() || 'Unable to get disk info');
      });
    });
  });

  // --- Screenshot ---
  ipcMain.handle('screen:capture', async () => {
    try {
      const { desktopCapturer } = require('electron');
      const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1920, height: 1080 } });
      if (sources.length > 0) {
        const screenshot = sources[0].thumbnail.toPNG();
        const filePath = path.join(app.getPath('pictures'), `goat-screenshot-${Date.now()}.png`);
        fs.writeFileSync(filePath, screenshot);
        return { success: true, path: filePath };
      }
      return { success: false, error: 'No screen source found' };
    } catch (e) { return { success: false, error: e.message }; }
  });

  // --- Notifications ---
  ipcMain.handle('notify', (_, { title, body }) => {
    const { Notification } = require('electron');
    if (Notification.isSupported()) {
      new Notification({ title: title || APP_NAME, body: body || '' }).show();
    }
    return true;
  });

  // --- Notes Storage ---
  const notesPath = path.join(app.getPath('userData'), 'notes.json');
  ipcMain.handle('notes:load', () => {
    try { return JSON.parse(fs.readFileSync(notesPath, 'utf8')); }
    catch { return []; }
  });
  ipcMain.handle('notes:save', (_, notes) => {
    try { fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2)); return true; }
    catch { return false; }
  });

  // --- Tasks Storage ---
  const tasksPath = path.join(app.getPath('userData'), 'tasks.json');
  ipcMain.handle('tasks:load', () => {
    try { return JSON.parse(fs.readFileSync(tasksPath, 'utf8')); }
    catch { return []; }
  });
  ipcMain.handle('tasks:save', (_, tasks) => {
    try { fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2)); return true; }
    catch { return false; }
  });

  // --- Snippets Storage ---
  const snippetsPath = path.join(app.getPath('userData'), 'snippets.json');
  ipcMain.handle('snippets:load', () => {
    try { return JSON.parse(fs.readFileSync(snippetsPath, 'utf8')); }
    catch { return []; }
  });
  ipcMain.handle('snippets:save', (_, snippets) => {
    try { fs.writeFileSync(snippetsPath, JSON.stringify(snippets, null, 2)); return true; }
    catch { return false; }
  });
}

// ============================================================================
// LLM INTEGRATION ENGINE
// ============================================================================
async function callLLM(provider, model, messages, apiKey) {
  switch (provider) {
    case 'ollama': return callOllama(model || settings.ollamaModel, messages);
    case 'openai': return callOpenAI(model || 'gpt-4o', messages, apiKey || settings.apiKeys?.openai);
    case 'gemini': return callGemini(model || 'gemini-2.0-flash', messages, apiKey || settings.apiKeys?.gemini);
    case 'claude': return callClaude(model || 'claude-3-5-sonnet-20241022', messages, apiKey || settings.apiKeys?.claude);
    case 'groq': return callGroq(model || 'llama-3.3-70b-versatile', messages, apiKey || settings.apiKeys?.groq);
    default: return callOllama(model || 'llama3', messages);
  }
}

async function callOllama(model, messages) {
  const body = JSON.stringify({ model, messages, stream: false });
  const res = await fetchURL(`${settings.ollamaUrl}/api/chat`, 'POST', 
    { 'Content-Type': 'application/json' }, body);
  if (res.error) throw new Error(res.error);
  const data = JSON.parse(res.body);
  return { content: data.message?.content || '', model, provider: 'ollama' };
}

async function callOpenAI(model, messages, apiKey) {
  if (!apiKey) throw new Error('OpenAI API key required');
  const body = JSON.stringify({ model, messages, max_tokens: 4096 });
  const res = await fetchURL('https://api.openai.com/v1/chat/completions', 'POST',
    { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body);
  const data = JSON.parse(res.body);
  if (data.error) throw new Error(data.error.message);
  return { content: data.choices[0].message.content, model, provider: 'openai', usage: data.usage };
}

async function callGemini(model, messages, apiKey) {
  if (!apiKey) throw new Error('Gemini API key required');
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));
  const body = JSON.stringify({ contents, generationConfig: { maxOutputTokens: 8192 } });
  const res = await fetchURL(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    'POST', { 'Content-Type': 'application/json' }, body);
  const data = JSON.parse(res.body);
  if (data.error) throw new Error(data.error.message);
  return { content: data.candidates?.[0]?.content?.parts?.[0]?.text || '', model, provider: 'gemini' };
}

async function callClaude(model, messages, apiKey) {
  if (!apiKey) throw new Error('Claude API key required');
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMsgs = messages.filter(m => m.role !== 'system');
  const body = JSON.stringify({
    model, max_tokens: 4096, messages: chatMsgs,
    ...(systemMsg ? { system: systemMsg.content } : {})
  });
  const res = await fetchURL('https://api.anthropic.com/v1/messages', 'POST', {
    'Content-Type': 'application/json', 'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  }, body);
  const data = JSON.parse(res.body);
  if (data.error) throw new Error(data.error.message);
  return { content: data.content?.[0]?.text || '', model, provider: 'claude' };
}

async function callGroq(model, messages, apiKey) {
  if (!apiKey) throw new Error('Groq API key required');
  const body = JSON.stringify({ model, messages, max_tokens: 4096 });
  const res = await fetchURL('https://api.groq.com/openai/v1/chat/completions', 'POST',
    { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body);
  const data = JSON.parse(res.body);
  if (data.error) throw new Error(data.error.message);
  return { content: data.choices[0].message.content, model, provider: 'groq', usage: data.usage };
}

// ============================================================================
// HTTP UTILITY
// ============================================================================
function fetchURL(targetUrl, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const lib = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname, port: parsed.port,
      path: parsed.pathname + parsed.search,
      method, headers, timeout: 60000
    };
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'Request timeout' }); });
    if (body) req.write(body);
    req.end();
  });
}

function fetchJSON(targetUrl) {
  return new Promise((resolve, reject) => {
    fetchURL(targetUrl).then(res => {
      try { resolve(JSON.parse(res.body)); }
      catch { resolve({}); }
    });
  });
}

// ============================================================================
// LOCAL SERVER MANAGEMENT
// ============================================================================
function startLocalServer(port, projectDir) {
  return new Promise((resolve) => {
    const dir = projectDir || path.join(__dirname, '..', '..');
    if (serverProcess) { serverProcess.kill(); serverProcess = null; }
    
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    serverProcess = spawn(npmCmd, ['run', 'dev', '--', '-p', String(port)], {
      cwd: dir, env: { ...process.env, PORT: String(port) },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let started = false;
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('[Server]', output);
      if (!started && (output.includes('ready') || output.includes('started'))) {
        started = true;
        resolve({ success: true, port, pid: serverProcess.pid });
      }
    });
    serverProcess.stderr.on('data', (data) => console.error('[Server Error]', data.toString()));
    serverProcess.on('exit', (code) => { serverProcess = null; });
    
    setTimeout(() => { if (!started) resolve({ success: false, error: 'Server start timeout' }); }, 30000);
  });
}

// ============================================================================
// APPLICATION MENU
// ============================================================================
function createAppMenu() {
  const template = [
    {
      label: APP_NAME,
      submenu: [
        { label: `About ${APP_NAME}`, click: () => showAbout() },
        { type: 'separator' },
        { label: 'Settings', accelerator: 'CmdOrCtrl+,', click: () => mainWindow?.webContents.send('navigate', 'settings') },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        { label: '🤖 AI Chat', accelerator: 'CmdOrCtrl+Shift+A', click: () => mainWindow?.webContents.send('navigate', 'ai-chat') },
        { label: '🖥️ Terminal', accelerator: 'CmdOrCtrl+Shift+T', click: () => mainWindow?.webContents.send('navigate', 'terminal') },
        { label: '📝 Code Editor', accelerator: 'CmdOrCtrl+Shift+E', click: () => mainWindow?.webContents.send('navigate', 'code-editor') },
        { label: '📁 File Manager', accelerator: 'CmdOrCtrl+Shift+F', click: () => mainWindow?.webContents.send('navigate', 'file-manager') },
        { label: '🌐 Browser', accelerator: 'CmdOrCtrl+Shift+B', click: () => mainWindow?.webContents.send('navigate', 'browser') },
        { type: 'separator' },
        { label: '🎵 Music Dashboard', click: () => mainWindow?.webContents.send('navigate', 'dashboard') },
        { label: '💰 Royalty Calculator', click: () => mainWindow?.webContents.send('navigate', 'royalties') },
        { label: '📊 Analytics', click: () => mainWindow?.webContents.send('navigate', 'analytics') }
      ]
    },
    {
      label: 'Servers',
      submenu: [
        { label: '🖥️ KVM2 (72.61.193.184)', click: () => mainWindow?.webContents.send('ssh-connect', '72.61.193.184') },
        { label: '🖥️ KVM8 (93.127.214.171)', click: () => mainWindow?.webContents.send('ssh-connect', '93.127.214.171') },
        { type: 'separator' },
        { label: '🚀 Deploy to KVM2', click: () => mainWindow?.webContents.send('deploy', '72.61.193.184') },
        { label: '🚀 Deploy to KVM8', click: () => mainWindow?.webContents.send('deploy', '93.127.214.171') }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.webContents.reload() },
        { label: 'Toggle DevTools', accelerator: 'F12', click: () => mainWindow?.webContents.toggleDevTools() },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+=', click: () => mainWindow?.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.5) },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => mainWindow?.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.5) },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: () => mainWindow?.webContents.setZoomLevel(0) },
        { type: 'separator' },
        { label: 'Toggle Full Screen', accelerator: 'F11', click: () => mainWindow?.setFullScreen(!mainWindow.isFullScreen()) }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: '📖 Documentation', click: () => shell.openExternal('https://github.com/DJSPEEDYGA/GOAT-Royalty-App2') },
        { label: '🐛 Report Issue', click: () => shell.openExternal('https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/issues') },
        { type: 'separator' },
        { label: `Version ${APP_VERSION}`, enabled: false }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function showAbout() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: `About ${APP_NAME}`,
    message: `${APP_NAME} v${APP_VERSION}`,
    detail: `Ultimate AI-Powered Music Production & Royalty Management Platform\n\n` +
            `© 2025 Harvey Miller (DJ Speedy)\n` +
            `GOAT Royalty / FASTASSMAN Publishing\n\n` +
            `Platform: ${process.platform} ${process.arch}\n` +
            `Electron: ${process.versions.electron}\n` +
            `Node.js: ${process.version}\n` +
            `Chromium: ${process.versions.chrome}`
  });
}

// ============================================================================
// APP LIFECYCLE
// ============================================================================
app.whenReady().then(async () => {
  console.log(`\n🐐⚡ ${APP_NAME} v${APP_VERSION} Starting...`);
  console.log(`Platform: ${process.platform} | Arch: ${process.arch}`);
  console.log(`Packaged: ${app.isPackaged} | Dev: ${isDev}\n`);

  createSplashWindow();
  setupIPC();
  createAppMenu();

  // Register global shortcut
  globalShortcut.register('CommandOrControl+Shift+G', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Small delay for splash effect
  setTimeout(() => {
    createMainWindow();
    createTray();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (serverProcess) serverProcess.kill();
  terminalProcesses.forEach(p => p.kill());
});

// Handle certificate errors for local dev
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(true);
});

console.log(`🐐 ${APP_NAME} main process loaded`);