const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    aichat: './src/renderer/js/aichat.js'
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
    })
  ],
  optimization: {
    usedExports: true,
    minimize: true,
    //minimizer: [new TerserPlugin()],
  },

  resolve: {
    fallback: {
      buffer: require.resolve('buffer/'),
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
      crypto: require.resolve('crypto-browserify'),
      vm: require.resolve('vm-browserify'),
      buffer: require.resolve('buffer/'),
      stream: require.resolve('stream-browserify'),
      fs: require.resolve('fs')
    }
  },
  mode: 'production',
};
