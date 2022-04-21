![npm](https://img.shields.io/npm/v/dialog-gui)
# Dialog-GUI

This is a simple gui system designed for use on desktop devices.
It is based on zenity and allows you to display:
- Forms (with entries, password fields, calendars, [~~lists~~](https://static.snurf08.de/dialog-gui/Dialog.html#list),combo boxes) [DOES NOT WORK ON WINDOWS/MACOS]
- Notifications
- File selectors
- Info/Error/Question boxes
- Entry boxes
- Progress bars
- Color pickers
- Lists

## Installation
You simply have to install the package using:
`npm i dialog-gui`

Then the package will automatically run an install script which automatically detects your package manager 
on linux, and installs zenity with it (A passwords field may pop up during the installation). If you are on windows / mac, it will download the [Zenity](https://github.com/ncruces/zenity)
package by [ncruces](https://github.com/ncruces). It currently lacks functionallity for forms (the Dialog class) but
everything else works fine.
## Examples
Look at the examples folder for examples on how to use this package.

## Docs
You can find the class documentation here: [Docs](https://static.snurf08.de/dialog-gui/Dialog.html)

## Credits
Thanks to [ncruces](https://github.com/ncruces) for supplying the Zenity package to windows and mac users.