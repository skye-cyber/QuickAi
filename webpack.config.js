const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    aichat: './src/renderer/js/aichat.js',
    utility: './src/renderer/js/aichat.js'
  },
  output: {
    filename: '_[name].js', // This will generate files named after the entry points
    path: path.resolve(__dirname, './src/renderer/js'),
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser', // Provide process polyfill
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    }),

  ],

  optimization: {
    usedExports: true,
    minimize: true,
  },

  resolve: {
    //extensions: ['.js', '.mjs', '.json'],
    fallback: {
      buffer: require.resolve('buffer/'),
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
      crypto: require.resolve('crypto-browserify'),
      vm: require.resolve('vm-browserify'),
      stream: require.resolve('stream-browserify'),
      fs: require.resolve('fs')
    }
  },
  //devtool: false,
  mode: 'production',
};
