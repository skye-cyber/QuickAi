const path = require('path');
const webpack = require('webpack');

const entries = {
    // Uncomment the ones you want to build
    // hfaichat: './src/renderer/js/hfaichat.js',
    // utility: './src/renderer/js/exportUtilities.js',
    // MistralChatsAdmin: './src/renderer/js/MistralChatsAdmin.js',
    // chatUtils: './src/renderer/js/chatUtils.js',
    // hfaudio: './src/renderer/js/hfaudio.js',
    dotDraw: './src/renderer/js/diagraming/dotDraw.js',
    // preference: './src/renderer/js/preference.js',
    // keyshortcuts: './src/renderer/js/keyshortcuts.js',
    // fileHandler: './src/renderer/js/fileHandler.js'
};

module.exports = Object.entries(entries).map(([name, entryPath]) => {
    const absEntryPath = path.resolve(__dirname, entryPath);
    const outputDir = path.dirname(absEntryPath); // Output to same folder as source

    return {
        name,
        entry: absEntryPath,
        output: {
            filename: `packed_${name}.js`,
            path: outputDir,
        },
        plugins: [
            new webpack.ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer'],
                crypto: ['crypto-browserify'],
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
                util: require.resolve('util/'),
                zlib: require.resolve('browserify-zlib'),
                https: require.resolve('https-browserify'),
                url: require.resolve('url/'),
                http: require.resolve('stream-http'),
                assert: require.resolve('assert/'),
                process: require.resolve('process/browser'),
                child_process: false
            }
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                    },
                },
            ],
        },
        devtool: 'source-map',
        mode: 'production',
    };
});
