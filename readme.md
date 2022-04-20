# Dialog-GUI
![npm](https://img.shields.io/npm/v/lua-libloader/)
This is a simple gui system designed for use on desktop devices.
It is based on zenity and allows you to display:
- Forms (with entries, password fields, calendars, [~~lists~~](https://static.snurf08.de/dialog-gui/Dialog.html#list),combo boxes)
- Notifications
- File selectors
- Info/Error/Question boxes
- Entry boxes
- Progress bars
- Color pickers
- Lists

## Installation
On linux you simply have to install the "zenity" package
using your favourite package manager.
For example using apt:
`apt install zenity`

Windows and mac users will have to download the zenity
binaries somewhere else. The best project I could find
is [https://github.com/ncruces/zenity](https://github.com/ncruces/zenity) by ncruces.
Simplay download the binary and drop it in the 
node_modules/dialog-gui/ folder. With this version,
the Dialog class wont work, everything else (ex. Dialog.info())
should work though.

## Examples
Look at test.js for an example on how to use this package.

## Docs
You can find the class documentation here: [Docs](https://static.snurf08.de/dialog-gui/Dialog.html)