const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const crypto = require('crypto');
const { Buffer } = require('buffer');
const dotenv = require('dotenv')


// Handle IPC messages from renderer
ipcMain.on('toMain', (event, data) => {
    console.log('Received data from renderer:', data);
    // Optionally send a response back
    event.reply('fromMain', data);
});

// Handle IPC messages from renderer
ipcMain.on('fromVision-ToMain', (event, data) => {
    console.log('Received data from renderer:', data);
    // Optionally send a response back
    event.reply('fromMain-ToVision', data);
});

// Handle IPC messages from renderer
ipcMain.on('fromChat-ToMain', (event, data) => {
    console.log('Received data from renderer:', data);
    // Optionally send a response back
    event.reply('fromMain-ToChat', data);
});

app.disableHardwareAcceleration()
dotenv.config({ path: path.join(__dirname, '.env') });


ipcMain.handle('get-env', () => {
    return {
        IV: process.env.IV,
        API_OBJ: process.env.API_OBJ,
        SKEY: process.env.SKEY,
    };
});

ipcMain.handle('getKey', async (event, encryptedObject, password) => {
    const { iv, encryptedData } = encryptedObject;

    if (!iv) {
        throw new Error("IV is missing or undefined");
    }

    try {
        // Convert IV from a comma-separated string to a buffer
        const ivBuffer = Buffer.from(iv.split(',').map(Number));

        // Derive the key from the password using scrypt
        const key = crypto.scryptSync(password, 'PhantomJoker15', 32);

        // Create decipher
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);

        // Decrypt the data
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error("Error in decrypting data:", error);
        throw error;
    }
});

ipcMain.handle('createKey', async (apiKey, password) => {
        // Derive a 32-byte key from the password
        const key = crypto.scryptSync(password, 'PhantomJoker15', 32);

        // Generate a random IV (16 bytes for AES)
        const iv = crypto.randomFillSync(new Uint8Array(16));

        // Create the cipher
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

        // Encrypt the API key
        let encrypted = cipher.update(apiKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Return the IV and encrypted data as a single object
        return {
            iv: iv.toString('hex'),
                encryptedData: encrypted
        };
});

ipcMain.handle('get-buffer-from-iv', (event, iv) => {
    const ivBuffer = Buffer.from(iv.split(',').map(Number)); // Split string, convert to numbers, and make a buffer
    return ivBuffer;
});


function createWindow() {
    // Create the loading window
    const loadingWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            //enableRemoteModule: false, // Disable remote module if not needed
        }
    });

    loadingWindow.loadFile(path.join(__dirname, '../../loading.html'));
    //console.log(path.join(__dirname, '../../loading.html'));

    // Create the main window
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(process.resourcesPath, 'assets/QuickAi.png'), // Path to your icon file
        show: false,
        webPreferences: {
        preload: path.join(__dirname, 'preload.js'), // Use the preload script
        nodeIntegration: false, // Enable Node.js integration in the renderer process
        contextIsolation: true,
        sandbox: false, // Disable sandboxing
        // Don't enable remote module, that could open up security risks
        //webSecurity: true,
        }
    });


    // Load the main application when it is ready
    mainWindow.loadFile(path.join(__dirname, '../../aichat.html')); // Load your HTML file

    // Show the main window and close the loading window when the main window is ready to show
    mainWindow.once('ready-to-show', () => {
        loadingWindow.close();
        mainWindow.show();
    });

    // Return the main window for reference
    return mainWindow;
}

app.setAppUserModelId('com.quickai.app'); // Set the app user model ID

app.on('ready', () => {
    // Create the main window
    const mainWindow = createWindow();
    const storagePath = path.join(app.getPath('home'), '.quickai.store');
    mainWindow.webContents.send('storagePath', storagePath);

    // Create the tray icon
    const tray = new Tray(path.join(process.resourcesPath, 'assets/QuickAi.png')); // Path to your tray icon

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                } else {
                    createWindow();
                }
            }
        },
        {
            label: 'Quit',
            click: () => {
                app.quit();
            }
        }
    ]);

    tray.setToolTip('QuickAI');
    tray.setContextMenu(contextMenu);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit(); // Quit when all windows are closed, except on macOS
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow(); // Recreate a window if none are open on macOS
    }
});

