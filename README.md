# Gravity File Browser: Because Your File Manager Was Getting Too Comfortable

===========================================================

**Functional Dysfunctional** was the theme of the Lewis Menelaws's Hackathon, and we took it to heart. Our team of mischievists created a file browser that's so bad, it's good. Introducing Gravity File Browser, the file manager that will make you question your life choices.

------------

## What's this abomination?

Gravity File Browser is a [Neutralinojs](https://neutralino.js.org/) based file browser with a unique gravity-inspired interface. Because who needs a normal file browser when you can have one that looks like a hot mess?

------------

## Features

* A gravity-inspired interface that will make you feel like you're floating in a sea of files
* File browsing and management, because you still need to get work done somehow
* Support for directories and files, but don't expect it to work all the time
* File size calculation, because who doesn't love a good game of "guess the file size"?
* Error handling for locked or inaccessible files, which will happen more often than you think

--------

## Credits

We'd like to thank the following people for their contributions to this monstrosity:

* [StefDP](https://github.com/stef-00012/) for their help with the Neutralinojs framework, which we promptly broke
* [CreeperITA104](https://github.com/creeperita09/) for their input on the app's design and user experience, which we ignored :). Also, he made the icons.
*[Smartlinuxcoder](https://github.com/smartlinuxcoder/)for the original idea and most of the ~~spaghetti~~ code-writing
--------

## Release

We're happy to announce that Gravity File Browser is now available for public use, and we're not entirely sure why you'd want to use this but you can download the [latest release](https://github.com/Hackathonification-enforcement-unit/ClearFile-file-explorer/releases) from our repository and use it on your own machine, but it's pretty janky so don't say we didn't warn you.

-------------------

## Prebuilt Binaries

We've also provided prebuilt binaries for Windows, macOS, and Linux, since no one is gonna take their time to compile this. Just download the binary for your platform, extract it, and run the executable. It's that easy!

* Windows: [`gravity-file-browser-win.zip`](https://github.com/Hackathonification-enforcement-unit/ClearFile-file-explorer/releases/download/release/ClearFile.file.explorer-win_x64.exe)
* macOS: [`gravity-file-browser-mac.zip`](https://github.com/Hackathonification-enforcement-unit/ClearFile-file-explorer/releases/download/release/ClearFile.file.explorer-mac_universal)
* Linux: [`gravity-file-browser-linux.zip`](https://github.com/Hackathonification-enforcement-unit/ClearFile-file-explorer/releases/download/release/ClearFile.file.explorer-linux_x64)

---------------

## Requirements and tips

* [Neutralinojs](https://neutralino.js.org/) 5.3.0 or later.
* [Neutralino executables](https://github.com/neutralinojs/neutralinojs/releases) latest stable release.
* [Node.js](https://nodejs.org) 14 or later.
* Only Linux and Windows versions have been tested.
* Ensure the executable and `resources.neu` are in the same directory.

---------------

**Linux Dependencies:**

* `libwebgtk-4.0` is required for the application to start.
* On Ubuntu-based distributions, create symbolic links for the required dependencies:
 	* `sudo ln -sf /usr/lib/x86_64-linux-gnu/libwebkit2gtk-4.1.so.0 /usr/lib/x86_64-linux-gnu/libwebkit2gtk-4.0.so.37`
 	* `sudo ln -sf /usr/lib/x86_64-linux-gnu/libjavascriptcoregtk-4.1.so.0 /usr/lib/x86_64-linux-gnu/libjavascriptcoregtk-4.0.so.18`
 Note: Ubuntu ships a different version of the dependency, requiring these additional steps.

---------------

## Running from source and building (if you're feeling adventurous)

### Running from source
1. Clone the repository: `git clone https://github.com/your-username/gravity-file-browser.git`
2. Run: `neu run`
      
### Building
With the repo open on your terminal of choice run `neu build` to build the executables which you'll find in the `.dist` direcotry

---------------

## Usage

1. Launch the app and navigate to a directory using the file browser, if it works
2. Files will appear across the screen, creating a gravity/water effect, which will probably give you a headache
3. Click on a file to view its details, including size and type, if it works
4. Use the navigation bar to switch between directories and go back to previous locations, but don't expect it to always work

---------------

## License

Gravity File Browser is licensed under the MIT License.

---------------

## Acknowledgments

We'd like to thank [Lewis Menelaws](https://www.youtube.com/@CodingwithLewis) for hosting the [hackathon](https://hackathon.lewismenelaws.com/) and providing a platform for us to showcase our project. We're also grateful to the Open Source community for their contributions and support.
