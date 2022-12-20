const { app } = require('electron');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

function parseDataFile(filePath, defaults) {
  try {
    return JSON.parse(readFileSync(filePath));
  } catch {
    return defaults;
  }
}

class Store {
  constructor(options) {
    const userDataPath = app.getPath('userData');
    this._path = join(userDataPath, options.configName + '.json');
    this._data = parseDataFile(this._path, options.defaults);
  }

  get(key) {
    return this._data[key];
  }

  set(key, value) {
    this._data[key] = value;
    writeFileSync(this._path, JSON.stringify(this._data));
  }
}

module.exports = Store;
