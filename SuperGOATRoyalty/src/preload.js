// ============================================================================
// SUPER GOAT ROYALTY v4.1.0 - PRELOAD BRIDGE
// Secure IPC communication between main process and renderer
// Copyright © 2025 Harvey Miller (DJ Speedy) / GOAT Royalty
// ============================================================================

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('goat', {
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
    relaunch: () => ipcRenderer.invoke('app:relaunch'),
    quit: () => ipcRenderer.invoke('app:quit')
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    setAlwaysOnTop: (v) => ipcRenderer.invoke('window:setAlwaysOnTop', v)
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (k, v) => ipcRenderer.invoke('settings:set', k, v),
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    setAll: (s) => ipcRenderer.invoke('settings:setAll', s)
  },
  system: {
    info: () => ipcRenderer.invoke('system:info'),
    monitor: () => ipcRenderer.invoke('system:monitor'),
    disk: () => ipcRenderer.invoke('system:disk')
  },
  terminal: {
    execute: (cmd, cwd) => ipcRenderer.invoke('terminal:execute', cmd, cwd)
  },
  ssh: {
    execute: (opts) => ipcRenderer.invoke('ssh:execute', opts)
  },
  fs: {
    readFile: (p) => ipcRenderer.invoke('fs:readFile', p),
    writeFile: (p, c) => ipcRenderer.invoke('fs:writeFile', p, c),
    readDir: (p) => ipcRenderer.invoke('fs:readDir', p),
    exists: (p) => ipcRenderer.invoke('fs:exists', p),
    mkdir: (p) => ipcRenderer.invoke('fs:mkdir', p),
    delete: (p) => ipcRenderer.invoke('fs:delete', p),
    stat: (p) => ipcRenderer.invoke('fs:stat', p)
  },
  dialog: {
    openFile: (o) => ipcRenderer.invoke('dialog:openFile', o),
    openDir: () => ipcRenderer.invoke('dialog:openDir'),
    saveFile: (o) => ipcRenderer.invoke('dialog:saveFile', o)
  },
  shell: {
    openExternal: (u) => ipcRenderer.invoke('shell:openExternal', u),
    openPath: (p) => ipcRenderer.invoke('shell:openPath', p),
    showItemInFolder: (p) => ipcRenderer.invoke('shell:showItemInFolder', p)
  },
  clipboard: {
    read: () => ipcRenderer.invoke('clipboard:read'),
    write: (t) => ipcRenderer.invoke('clipboard:write', t)
  },
  ai: {
    chat: (o) => ipcRenderer.invoke('ai:chat', o),
    ollamaModels: () => ipcRenderer.invoke('ai:ollama:models'),
    ollamaPull: (m) => ipcRenderer.invoke('ai:ollama:pull', m)
  },
  server: {
    start: (o) => ipcRenderer.invoke('server:start', o),
    stop: () => ipcRenderer.invoke('server:stop'),
    status: () => ipcRenderer.invoke('server:status')
  },
  git: {
    execute: (o) => ipcRenderer.invoke('git:execute', o)
  },
  http: {
    fetch: (o) => ipcRenderer.invoke('http:fetch', o)
  },
  notes: {
    load: () => ipcRenderer.invoke('notes:load'),
    save: (n) => ipcRenderer.invoke('notes:save', n)
  },
  tasks: {
    load: () => ipcRenderer.invoke('tasks:load'),
    save: (t) => ipcRenderer.invoke('tasks:save', t)
  },
  snippets: {
    load: () => ipcRenderer.invoke('snippets:load'),
    save: (s) => ipcRenderer.invoke('snippets:save', s)
  },
  notify: (o) => ipcRenderer.invoke('notify', o),
  screen: {
    capture: () => ipcRenderer.invoke('screen:capture')
  },
  on: (ch, cb) => {
    var valid = ['navigate','ssh-connect','deploy','theme-changed','notification'];
    if (valid.includes(ch)) ipcRenderer.on(ch, (_, ...a) => cb(...a));
  },
  removeAllListeners: (ch) => ipcRenderer.removeAllListeners(ch)
});

console.log('GOAT Royalty v4.1.0 preload bridge initialized');