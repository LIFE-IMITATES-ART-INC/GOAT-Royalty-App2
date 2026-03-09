/**
 * Atlas AI — Electron Preload Script
 * Secure bridge between renderer and main process
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  getBackendPort: () => ipcRenderer.invoke('get-backend-port'),
  isDev: () => ipcRenderer.invoke('is-dev'),

  // Actions
  openExternal: (url) => ipcRenderer.send('open-external', url),
  restartBackend: () => ipcRenderer.send('restart-backend'),

  // Listen for menu commands
  onNewConversation: (cb) => ipcRenderer.on('new-conversation', cb),
  onToggleSidebar: (cb) => ipcRenderer.on('toggle-sidebar', cb),
  onToggleCommFeed: (cb) => ipcRenderer.on('toggle-comm-feed', cb),
  onOpenSettings: (cb) => ipcRenderer.on('open-settings', cb),
  onClearConversations: (cb) => ipcRenderer.on('clear-conversations', cb),

  // Cleanup
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});