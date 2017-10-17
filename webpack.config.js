const path = require('path');
const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public/scripts')
    },
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
        ]
    },
    plugins: [
        new JavaScriptObfuscator({
            compact: true,
            controlFlowFlattening: false,
            deadCodeInjection: false,
            debugProtection: false,
            disableConsoleOutput: false,
            domainLock: [],
            log: false,
            mangle: true,
            renameGlobals: false,
            reservedNames: [],
            rotateStringArray: true,
            seed: 0,
            selfDefending: true,
            sourceMap: true,
            sourceMapMode: 'separate',
            stringArray: true,
            stringArrayEncoding: 'rc4',
            unicodeEscapeSequence: true
        })
    ]
};
