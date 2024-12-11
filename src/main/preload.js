const { contextBridge, ipcRenderer, shell } = require('electron');
const crypto = require('crypto');
const { Buffer } = require('buffer');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('electron', {
    getEnv: () => ipcRenderer.invoke('get-env'),
    getBufferFromIV: (iv) => ipcRenderer.invoke('get-buffer-from-iv', iv),
    scryptSync: (password, salt, keylen) => crypto.scryptSync(password, salt, keylen),
    Buffer,
    getDownloadsPath: () => {
        const homedir = require('os').homedir();
        const downloadsPath = path.join(homedir, 'Downloads');
        return downloadsPath;
    },
    saveAndOpenImage: (downloadsPath, dataUrl) => {
        fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const buffer = Buffer.from(reader.result);
                const outputPath = path.join(downloadsPath, 'output.jpg');

                fs.writeFile(outputPath, buffer, (err) => {
                    if (err) {
                        console.error('Error saving image:', err);
                    } else {
                        shell.openPath(outputPath);
                    }
                });
            };
            reader.readAsArrayBuffer(blob);
        })
        .catch((error) => {
            console.error('Error creating blob:', error);
        });
    },
});

