const { Bundler } = require('neutralino-appimage-bundler');
const path = require('node:path');

const bundler = new Bundler({
    desktop: {
        name: 'ClearFile file explorer',
        icon: path.join(__dirname, 'resources/icons/appIcon.png'),
        categories: ['Game']
    },
    binary: {
        name: 'ClearFile file explorer',
        dist: path.join(__dirname, 'dist'),
    },
    copy: {
        'resources': path.join(__dirname, 'resources')
    },
    includeLibraries: true,
    output: path.join(__dirname, 'ClearfileExplorer.AppImage'),
    sudo: false,
    version: '2.0.0'
});

// Bundle project
bundler.bundle();