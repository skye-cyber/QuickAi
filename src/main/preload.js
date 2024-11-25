const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    getEnv: () => ipcRenderer.invoke('get-env'),
                                // You can expose other Node.js functionalities here as needed
});
