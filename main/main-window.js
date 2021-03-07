const { BrowserWindow, ipcMain } = require("electron");
const url = require("url");
const path = require("path");

function createAppWindow() {
  let  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    setMenu: null
  });
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/../dist/index.html`),
      protocol: "file:",
      slashes: true
    })
  );
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  return mainWindow;
}

module.exports = {
  createAppWindow
};