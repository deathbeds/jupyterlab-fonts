const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    filename: 'nbjss.js',
    library: 'nbjss',
    libraryTarget: 'var',
    path: path.resolve(__dirname, 'nbjss', 'static'),
  }
};
