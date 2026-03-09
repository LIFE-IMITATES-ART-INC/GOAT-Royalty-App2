/**
 * Atlas AI — Electron Main Process
 * Launches Python backend + React frontend as a native macOS app
 */

const { app, BrowserWindow, Menu, Tray, ipcMain, shell, dialog, nativeTheme } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// ── Config ────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const BACKEND_PORT = 8765;
const FRONTEND_PORT = 5173;

let mainWindow = null;
let tray = null;
let backendProcess = null;

// ── Force dark mode ───────────────────────────────────────────
nativeTheme.themeSource = 'dark';

// ── Backend launcher ──────────────────────────────────────────
function startBackend() {
  // Find Python executable
  const pythonCandidates = ['python3', 'python', '/usr/bin/python3', '/usr/local/bin/python3'];
  let pythonPath = 'python3';

  // Find backend directory
  let backendDir;
  if (app.isPackaged) {
    backendDir = path.join(process.resourcesPath, 'backend');
  } else {
    backendDir = path.join(__dirname, '..', '..', 'backend');
  }

  const serverScript = path.join(backendDir, 'server.py');

  if (!fs.existsSync(serverScript)) {
    console.warn('⚠️  Backend server.py not found at:', serverScript);
    return;
  }

  console.log('🚀 Starting backend at:', backendDir);

  backendProcess = spawn(pythonPath, [serverScript], {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: String(BACKEND_PORT),
      PYTHONUNBUFFERED: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  backendProcess.stdout.on('data', (data) => {
    console.log('[Backend]', data.toString().trim());
  });

  backendProcess.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.error('[Backend Error]', msg);
  });

  backendProcess.on('close', (code) => {
    console.log(`[Backend] Process exited with code ${code}`);
    backendProcess = null;
  });

  backendProcess.on('error', (err) => {
    console.error('[Backend] Failed to start:', err.message);
    dialog.showErrorBox(
      'Backend Error',
      `Failed to start Python backend.\n\nMake sure Python 3 is installed:\nbrew install python3\n\nError: ${err.message}`
    );
  });
}

// ── Create main window ────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#0a0a0f',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev,
    },
    show: false,
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
  });

  // Load app
  if (isDev) {
    mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Show when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ── App Menu ──────────────────────────────────────────────────
function createMenu() {
  const template = [
    {
      label: 'Atlas AI',
      submenu: [
        { label: 'About Atlas AI', role: 'about' },
        { type: 'separator' },
        { label: 'Preferences...', accelerator: 'Cmd+,', click: () => mainWindow?.webContents.send('open-settings') },
        { type: 'separator' },
        { label: 'Hide Atlas AI', role: 'hide' },
        { label: 'Hide Others', role: 'hideOthers' },
        { type: 'separator' },
        { label: 'Quit Atlas AI', role: 'quit', accelerator: 'Cmd+Q' },
      ],
    },
    {
      label: 'Chat',
      submenu: [
        { label: 'New Conversation', accelerator: 'Cmd+N', click: () => mainWindow?.webContents.send('new-conversation') },
        { type: 'separator' },
        { label: 'Clear All Conversations', click: () => {
          dialog.showMessageBox(mainWindow, {
            type: 'warning',
            buttons: ['Cancel', 'Clear All'],
            defaultId: 0,
            message: 'Clear all conversations?',
            detail: 'This cannot be undone.',
          }).then(({ response }) => {
            if (response === 1) mainWindow?.webContents.send('clear-conversations');
          });
        }},
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle Sidebar', accelerator: 'Cmd+B', click: () => mainWindow?.webContents.send('toggle-sidebar') },
        { label: 'Toggle Comm Feed', accelerator: 'Cmd+Shift+C', click: () => mainWindow?.webContents.send('toggle-comm-feed') },
        { type: 'separator' },
        { label: 'Reload', role: 'reload' },
        { label: 'Force Reload', role: 'forceReload' },
        { type: 'separator' },
        { label: 'Actual Size', role: 'resetZoom' },
        { label: 'Zoom In', role: 'zoomIn' },
        { label: 'Zoom Out', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Toggle Full Screen', role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', role: 'undo' },
        { label: 'Redo', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', role: 'cut' },
        { label: 'Copy', role: 'copy' },
        { label: 'Paste', role: 'paste' },
        { label: 'Select All', role: 'selectAll' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', role: 'minimize' },
        { label: 'Zoom', role: 'zoom' },
        { type: 'separator' },
        { label: 'Bring All to Front', role: 'front' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'GOAT Royalty App', click: () => shell.openExternal('http://93.127.214.171:3002') },
        { label: 'GitHub Repository', click: () => shell.openExternal('https://github.com/DJSPEEDYGA/GOAT-Royalty-App2') },
        { type: 'separator' },
        { label: 'Toggle Developer Tools', role: 'toggleDevTools' },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── IPC Handlers ──────────────────────────────────────────────
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('get-backend-port', () => BACKEND_PORT);
ipcMain.handle('is-dev', () => isDev);

ipcMain.on('open-external', (_, url) => shell.openExternal(url));

ipcMain.on('restart-backend', () => {
  if (backendProcess) {
    backendProcess.kill();
    setTimeout(startBackend, 1000);
  } else {
    startBackend();
  }
});

// ── App lifecycle ─────────────────────────────────────────────
app.whenReady().then(() => {
  createMenu();
  startBackend();

  // Wait a moment for backend to start
  setTimeout(createWindow, isDev ? 0 : 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    console.log('🛑 Stopping backend...');
    backendProcess.kill('SIGTERM');
    backendProcess = null;
  }
});

// ── Prevent multiple instances ────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}