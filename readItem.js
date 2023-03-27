// Modules
const {BrowserWindow} = require('electron')

// Offscreen browser window
let offscreenWindow

// Exported readItem function
module.exports = (url, callback) => {
    // Create offscreen window
    offscreenWindow = new BrowserWindow({
        width: 500, 
        height: 500,
        show: false,
        webPreferences: {
            offscreen: true
        }
    })

    // Load item url
    offscreenWindow.loadURL(url)

    // Wait for content to load
    offscreenWindow.webContents.on('did-finish-load', e => {

        // Page title
        let title = offscreenWindow.getTitle()

        // Get screenshot
        offscreenWindow.webContents.capturePage().then(image => {

            // Get image as dataURL
            let screenshot = image.toDataURL()

            // Execute callback with new item object
            callback({title, screenshot, url})

            // Cleanup
            offscreenWindow.close()
            offscreenWindow = null
        })
    })
}