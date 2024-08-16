const { Bundler } = require('neutralino-appimage-bundler');
const path = require('node:path');

const bundler = new Bundler({
    desktop: {
        name: 'ClearFile file explorer',
        icon: path.join(__dirname, 'resources/icons/appImageIcon.png'),
        categories: ['FileManager']
    },
    binary: {
        name: 'ClearFile file explorer',
        dist: path.join(__dirname, 'dist'),
    },
    includeLibraries: true,
    output: path.join(__dirname, 'ClearFileExplorer.AppImage'),
    sudo: false,
    version: '1.0.4'
});

bundler.bundle();