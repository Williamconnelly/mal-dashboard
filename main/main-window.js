const { BrowserWindow, ipcMain } = require("electron");
const url = require("url");
const path = require("path");

function createAppWindow() {
  let  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
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