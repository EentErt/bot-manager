const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { startBot, stopBot, isRunning } = require('./engine');

const BASE_WIDTH = 240;
const LOG_WIDTH = 432;

const bots = JSON.parse(fs.readFileSync(path.join(__dirname, 'bots.json'), 'utf8'));
let win;

Menu.setApplicationMenu(null)

function createWindow() {
    win = new BrowserWindow({
        width: BASE_WIDTH,
        height: 240,
        useContentSize: true,
        /*
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#1e1f22',        // background behind the buttons
            symbolColor: '#e3e5e8',  // the glyph color (the ✕, –, ☐)
            height: 32,
        },
        */
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    win.loadFile('index.html');
}

app.whenReady().then(createWindow);
app.on('windows-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})

ipcMain.handle('bots:list', () =>
    bots.map(b => ({ ...b, running: isRunning(b.id) }))
);

ipcMain.handle('bot:start', (event, id) => {
    const bot = bots.find(b => b.id === id);
    if (!bot) return;
    startBot(
        bot,
        (botId, line) => win.webContents.send('bot:log', botId, line),
        (botId) => win.webContents.send('bot:status', botId, false),
    );
    win.webContents.send('bot:status', id, true);
});

ipcMain.handle('bot:stop', (event, id) => {
    stopBot(id);
});

ipcMain.handle('window:setLogOpen', (event, open) => {
    const [, height] = win.getContentSize();
    win.setContentSize(open ? BASE_WIDTH + LOG_WIDTH : BASE_WIDTH, height);
})