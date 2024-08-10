const path = require('path');

// Require bundler
const { Bundler } = require('neutralino-appimage-bundler');

// Create an object with some params
const bundler = new Bundler({
    // .desktop file properties
    desktop: {
        // Name field
        name: 'Aboba Project',

        // Path to the icon
        icon: path.join(__dirname, 'resources/icons/appIcon.png'),

        // Categories (defult is Utilities)
        categories: ['Game']
    },

    // Neutralino binary info
    binary: {
        // Name of the binary (cli.binaryName)
        name: 'neutralino-test',

        // Dist folder path
        dist: path.join(__dirname, 'dist'),
    },

    // Some files or folders to copy inside of the the AppImage
/*     copy: {
        'public': path.join(__dirname, 'test/dist/aboba-amogus/public')
    }, */

    // Should AppImage contain Neutralino's dependencies or not
    // If true, then AppImage will contain binary's shared libraries
    includeLibraries: true,

    // Path to the appimage to save
    output: path.join(__dirname, 'el-passant.AppImage'),

    /**
     * (optional) If set to true, the AppImage will run only with root privileges
     */
    sudo: false,

    // Application version
    version: '2.0.0'
});

// Bundle project
bundler.bundle();