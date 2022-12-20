module.exports.isDev =
  (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
    ? true
    : false;

module.exports.isMac = (process.platform === 'darwin')
  ? true
  : false;
  