const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('goat', {
  getVersion: () => ipcRenderer.invoke('get-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getArch: () => ipcRenderer.invoke('get-arch'),
  openExternal: (url) => ipcRenderer.send('open-external', url),
  openDevTools: () => ipcRenderer.send('open-devtools'),
  minimize: () => ipcRenderer.send('minimize'),
  maximize: () => ipcRenderer.send('maximize'),
  close: () => ipcRenderer.send('close'),
  onNavigate: (cb) => ipcRenderer.on('navigate', (_, page) => cb(page)),
});