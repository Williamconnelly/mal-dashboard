const { app, ipcMain } = require('electron')
const fs = require("fs");
const { createAuthWindow } = require('./main/auth-window');
const { createAppWindow } = require('./main/main-window');
const malConfig = require('./malconfig.json');
const { decrypt, encrypt } = require('./main/main-utils');

let mainWindow;

function createWindow() {
  mainWindow = createAppWindow();
  mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', function () {
  if (mainWindow === null) createWindow()
});

ipcMain.on('authorize-user', (event, authUrl) => {
  createAuthWindow(authUrl, mainWindow, event);
});

ipcMain.on('store-token', (event, token) => {
  const malConf = JSON.parse(decrypt(malConfig));
  malConf.refresh = token;
  const eConf = encrypt(JSON.stringify(malConf));
  fs.writeFile('malconfig.json', JSON.stringify(eConf), 'utf8', (err) => {
    if (err) {
      console.log(err);
    }
  });
});

ipcMain.on('refresh-token', event => {
  const malConf = JSON.parse(decrypt(malConfig));
  if (malConf.refresh) {
    const tokenInfo = {
      cId: malConf.cId,
      cS: malConf.cS,
      refresh_token: malConf.refresh
    };
    event.reply('token-refreshed', tokenInfo);
  } else {
    event.reply('token-refreshed', null);
  }
});