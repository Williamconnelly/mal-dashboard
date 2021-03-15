const { app, ipcMain, dialog, shell } = require('electron')
const fs = require("fs");
const { createAuthWindow } = require('./main/auth-window');
const { createAppWindow } = require('./main/main-window');
const malConfig = require('./malconfig.json');
const { decrypt, encrypt } = require('./main/main-utils');
const { exception } = require('console');
const fsPromises = fs.promises;

let mainWindow;

function createWindow() {
  mainWindow = createAppWindow();
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

ipcMain.handle('directory-contents', async (e, path) => {
  return getDirectoryContents(path).then(
    // Filter file types
    res => res.filter(file => (file.includes('mkv') || file.includes('.mp4') || file.includes('m4v')))
  );
});

async function getDirectoryContents(path) {
  try {
    return fsPromises.readdir(path);
  } catch (err) {
    throw new exception('getDirectoryContents - Failed to read directory')
  }
}

ipcMain.handle('set-directory', async e => {
  return dialog.showOpenDialog(mainWindow, { properties: ['openDirectory']}).then(
    pathResponse => {
      if (!pathResponse.canceled && pathResponse.filePaths.length) {
        return pathResponse.filePaths[0];
      } else {
        return null;
      }
    }
  ).catch (
    err => err
  );
});

ipcMain.handle('get-media-config', async e => {
  return await fsPromises.readFile('./mediaconfig.json', 'utf-8');
});

ipcMain.handle('set-media-config', async (e, config) => {
  return await fsPromises.writeFile('./mediaconfig.json', config, 'utf-8');
});

function checkFile(filename) {
  fs.open(filename, 'r', (err, fd) => {
    if (err) {
      fs.writeFile(filename, '', err => {
        if (err) {
          console.log('Failed to create file');
        } else {
          console.log('Created File!');
        }
      });
    } else {
      console.log('File Exists!');
    }
  })
}

ipcMain.handle('open-file', (e, path) => {
  return shell.openExternal(path);
})