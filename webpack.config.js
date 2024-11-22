const path = require('path');

module.exports = {
  entry: {
    aichat: './src/common/js/aichat.js'
  },
  output: {
    filename: '_[name].js', // This will generate files named after the entry points
    path: path.resolve(__dirname, './src/common/js'),
  },
  mode: 'development',
};
