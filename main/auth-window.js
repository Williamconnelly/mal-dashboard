const { BrowserWindow } = require('electron')
const malConfig = require('../malconfig.json');
const { decrypt } = require('./main-utils');

function createAuthWindow(authUrl, mainWindow, reqEvent) {

  let authWindow = new BrowserWindow({
    width: 600,
    height: 700,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
    setMenu: null,
    parent: mainWindow,
    modal: true
  });

  const malUtils = JSON.parse(decrypt(malConfig));
  authUrl = `${authUrl}&client_id=${malUtils.cId}`;

  authWindow.loadURL(authUrl);

  authWindow.webContents.on('did-finish-load', e => {
    authWindow.show();
  });

  authWindow.on('closed', () => {
    authWindow = null;
  });

  authWindow.webContents.on('will-navigate', (event, pendingNavUrl) => {
    const validRoutes = [
      'https://myanimelist.net/login.php?from=%2Fdialog%2Fauthorization',
      'https://myanimelist.net/dialog/authorization',
      'https://myanimelist.net/submission/authorization'
    ];
    if (!validRoutes.includes(pendingNavUrl)) {
      event.preventDefault();
    }
  });

  authWindow.webContents.on('did-redirect-navigation', (event, redirectUrl) => {
    console.log('Redirecting:', redirectUrl);
    if (redirectUrl.includes('http://localhost/oauth')) {
      const urlParams = new URLSearchParams(redirectUrl);
      const code = urlParams.get('http://localhost/oauth?code');
      if (code) {
        const state = urlParams.get('state');
        const malConf = JSON.parse(decrypt(malConfig));
        const data = {
          cId: malConf.cId,
          cS: malConf.cS,
          code,
          state
        };
        reqEvent.reply('user-authenticated', data);
      } else {
        reqEvent.reply('user-authenticated', null);
      }
      // Need to call setImmediate here or application crashes(?)
      setImmediate(function() {
        authWindow.close();
      });
    }
  });

  return authWindow;
}

module.exports = {
  createAuthWindow
}