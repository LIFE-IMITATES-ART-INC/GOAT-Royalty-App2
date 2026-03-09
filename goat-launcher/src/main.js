/**
 * GOAT Royalty Ultimate Launcher — Electron Main Process
 * The master hub for ALL tools, apps, and integrations
 */

const { app, BrowserWindow, Menu, Tray, globalShortcut, shell, ipcMain, nativeTheme, dialog } = require('electron');
const path = require('path');

// Force dark mode
nativeTheme.themeSource = 'dark';

let mainWindow = null;
let tray = null;

// ── Create Main Window ────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#050508',
    show: false,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('close', (e) => {
    if (process.platform === 'darwin') {
      e.preventDefault();
      mainWindow.hide();
    }
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
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{
      label: 'GOAT Royalty',
      submenu: [
        { label: 'About GOAT Royalty', role: 'about' },
        { type: 'separator' },
        { label: 'Preferences', accelerator: 'Cmd+,', click: () => mainWindow?.webContents.send('navigate', 'settings') },
        { type: 'separator' },
        { label: 'Hide', role: 'hide' },
        { label: 'Hide Others', role: 'hideOthers' },
        { type: 'separator' },
        { label: 'Quit', role: 'quit', accelerator: 'Cmd+Q' },
      ],
    }] : []),
    {
      label: 'Tools',
      submenu: [
        { label: 'Dashboard', accelerator: 'CmdOrCtrl+1', click: () => mainWindow?.webContents.send('navigate', 'dashboard') },
        { label: 'Atlas AI Chat', accelerator: 'CmdOrCtrl+2', click: () => mainWindow?.webContents.send('navigate', 'atlas-ai') },
        { label: 'Adobe Firefly', accelerator: 'CmdOrCtrl+3', click: () => mainWindow?.webContents.send('navigate', 'adobe-firefly') },
        { label: 'Music Studio', accelerator: 'CmdOrCtrl+4', click: () => mainWindow?.webContents.send('navigate', 'music-studio') },
        { type: 'separator' },
        { label: 'Super GOAT Command', accelerator: 'CmdOrCtrl+G', click: () => mainWindow?.webContents.send('navigate', 'super-goat') },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', role: 'reload' },
        { label: 'Force Reload', role: 'forceReload' },
        { type: 'separator' },
        { label: 'Actual Size', role: 'resetZoom' },
        { label: 'Zoom In', role: 'zoomIn' },
        { label: 'Zoom Out', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Toggle Full Screen', role: 'togglefullscreen' },
        { label: 'Toggle Developer Tools', role: 'toggleDevTools' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' }, { role: 'zoom' },
        ...(isMac ? [{ type: 'separator' }, { role: 'front' }] : [{ role: 'close' }]),
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'GitHub Repository', click: () => shell.openExternal('https://github.com/DJSPEEDYGA/GOAT-Royalty-App2') },
        { label: 'GOAT Royalty Web App', click: () => shell.openExternal('http://93.127.214.171:3002') },
        { type: 'separator' },
        { label: `Version ${app.getVersion()}`, enabled: false },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── IPC Handlers ──────────────────────────────────────────────
ipcMain.handle('get-version', () => app.getVersion());
ipcMain.handle('get-platform', () => process.platform);
ipcMain.handle('get-arch', () => process.arch);
ipcMain.on('open-external', (_, url) => shell.openExternal(url));
ipcMain.on('open-devtools', () => mainWindow?.webContents.openDevTools());
ipcMain.on('minimize', () => mainWindow?.minimize());
ipcMain.on('maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on('close', () => mainWindow?.close());

// ── App Lifecycle ─────────────────────────────────────────────
app.whenReady().then(() => {
  createMenu();
  createWindow();

  // Global shortcut
  globalShortcut.register('CmdOrCtrl+Shift+G', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
      }
    } else {
      createWindow();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else mainWindow?.show();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Single instance
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}