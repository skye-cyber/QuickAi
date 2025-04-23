const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");

const entries = {
    //hfaichat: './src/renderer/js/hfaichat.js',
    //utility: './src/renderer/js/exportUtilities.js',
    MistralChatsAdmin: './src/renderer/js/MistralChatsAdmin.js',
    chatUtils: './src/renderer/js/chatUtils.js',
    //hfaudio: './src/renderer/js/hfaudio.js',
    visualRenderer: './src/renderer/js/diagraming/visualRenderer.js',
    //preference: './src/renderer/js/preference.js',
    //keyshortcuts: './src/renderer/js/keyshortcuts.js',
    //fileHandler: './src/renderer/js/fileHandler.js',
    mathHandler: './src/renderer/js/MathBase/mathHandler.js'
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
            new CopyPlugin({
                patterns: [
                    {
                        from: path.join(__dirname, "node_modules/katex/dist"),
                        to: "katex"        // <-- this folder will appear in your `dist/`
                    }
                ]
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
                {
                    test: /\.html$/i,
                    loader: "html-loader",
                    options: { sources: false }   // don’t rewrite <link>/@href URLs
                },
                {
                    test: /\.css$/i,
                    use: [
                        'style-loader', // Injects CSS into <style> tags at runtime
                        'css-loader'    // Resolves @import and url()
                    ]
                },
            ],
        },
        devtool: 'source-map',
        mode: 'production',
    };
});
