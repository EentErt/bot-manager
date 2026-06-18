const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('botAPI', {
    list: () => ipcRenderer.invoke('bots:list'),
    start: (id) => ipcRenderer.invoke('bot:start', id),
    stop: (id) => ipcRenderer.invoke('bot:stop', id),

    onLog: (cb) => ipcRenderer.on('bot:log', (e, id, line) => cb(id, line)),
    onStatus: (cb) => ipcRenderer.on('bot:status', (e, id, running) => cb(id, running)),

    setLogOpen: (open) => ipcRenderer.invoke('window:setLogOpen', open),
});