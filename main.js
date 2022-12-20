const { 
  app, 
  globalShortcut, 
  BrowserWindow,
  ipcMain, 
  dialog
} = require('electron');

const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');

const { isMac } = require('./src/validations');
const { createWindows, setDestination } = require('./src/createWindows');
const Store = require('./src/store');

const preferences = new Store({
  configName: 'user-preferences',
  defaults: {
    destination: join(homedir(), 'audios')
  }
});

let destination = preferences.get('destination'); 
if (!existsSync(destination)) {
  mkdirSync(destination);
}

app.name = app.name.replace('-', ' ');
app.name = app.name.charAt(0).toUpperCase() + app.name.substring(1);

app.whenReady().then(() => {
  setDestination(destination);
  createWindows();
  globalShortcut.register('CmdOrCtrl+d', () => {
    BrowserWindow.getAllWindows()[0].setAlwaysOnTop(true);
    BrowserWindow.getAllWindows()[0].setAlwaysOnTop(false);
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    setDestination(destination);
    createWindows();
  }
});

ipcMain.on('save-audio', (event, buffer) => {
  const filePath = join(destination, Date.now().toString());   
  writeFileSync(`${filePath}.ogg`, buffer);
});

ipcMain.handle('show-dialog', async (event) => {
  const result = await dialog.showOpenDialog({ 
    properties: ['openDirectory'] 
  });
  const dirPath = result.filePaths[0];
  
  setDestination(dirPath);
  preferences.set('destination', dirPath);
  destination = preferences.get('destination');

  return destination;
});
