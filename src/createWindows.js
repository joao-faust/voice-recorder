const { 
  app, 
  Menu, 
  BrowserWindow,
  shell 
} = require('electron');

const { join } = require('path');

const { isDev, isMac } = require('./validations');

const windowsPath = './src/windows';
const icon = join('src', 'windows', 'images', 'icon.png');

let destination;
function setDestination(dest) {
  destination = dest;
}

function preferencesWindow() {
  const win = new BrowserWindow({
    width: isDev ? 900 : 500,
    height: 150,
    resizable: isDev ? true : false,
    backgroundColor: '#234',
    show: false,
    icon: icon,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(`${windowsPath}/preferences/index.html`);
  
  win.once('ready-to-show', () => {
    win.show();
    if (isDev) win.webContents.openDevTools();
    win.webContents.send('update-dest-path', destination);
  });
}

function mainWindow() {
  const win = new BrowserWindow({
    width: isDev ? 900 : 500,
    height: 300,
    resizable: isDev ? true : false,
    backgroundColor: '#234',
    show: false,
    icon: icon,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(`${windowsPath}/main/index.html`);
  win.once('ready-to-show', () => {
    win.show();
    if (isDev) win.webContents.openDevTools();
  });

  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        { label: 'Preferences', click: () => preferencesWindow() },
        { label: 'Open destination folder', click: () => shell.openPath(destination) }
      ]
    },
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' },
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
}

module.exports = {
  createWindows: () => mainWindow(),
  setDestination: (destination) => setDestination(destination)
}
