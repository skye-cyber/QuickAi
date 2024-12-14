const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    aichat: './src/renderer/js/aichat.js',
    utility: './src/renderer/js/exportUtilities.js'
  },
  output: {
    filename: '_[name].js', // This will generate files named after the entry points
    path: path.resolve(__dirname, './src/renderer/js'),
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process', // Provide process polyfill
      Buffer: ['buffer', 'Buffer'], // Provide Buffer
      }),

  ],

  optimization: {
    usedExports: true,
    minimize: true,
  },

  resolve: {
    extensions: ['.js', '.mjs', '.json'],
    fallback: {
      buffer: require.resolve('buffer/'),
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
      crypto: require.resolve('crypto-browserify'),
      vm: require.resolve('vm-browserify'),
      stream: require.resolve('stream-browserify'),
      fs: require.resolve('browserify-fs'),
      util: require.resolve("util/"),
      zlib: require.resolve("browserify-zlib"),
      https: require.resolve("https-browserify"),
      url: require.resolve("url/"),
      http: require.resolve("stream-http"),
      assert: require.resolve("assert/"),
      process: require.resolve('process'),
      child_process:false //'child-process-promise'
    }
  },
  module: {
    rules: [
      {
        //test: /\.js$/,
        //exclude: /node_modules/,
        //use: {
          //loader: 'babel-loader',
        //},
      },
    ],
  },
  devtool: 'source-map', // Consider using source maps for better debugging
  mode: 'production',
};
