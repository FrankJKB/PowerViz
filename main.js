// Modules
const {app, BrowserWindow, ipcMain} = require('electron')
const windowStateKeeper = require('electron-window-state')
const readItem = require('./readItem')
const appMenu = require('./menu.js')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// Listen for new item request
ipcMain.on('new-item', (e, itemUrl) => {
  // Get new item and send back to renderer
  readItem(itemUrl, item => {
    e.sender.send('new-item-success', item)
  })
})

// Create a new BrowserWindow when `app` is ready
function createWindow () {

  // State remembers the previous state of the app
  let state = windowStateKeeper({
    defaultWidth: 500, defaultHeight: 650
  })

  mainWindow = new BrowserWindow({
    x: state.x, y:state.y,
    width: state.width, height: state.height,
    minWidth: 350, maxWidth: 650, minHeight: 300,
    webPreferences: {
      // --- !! IMPORTANT !! ---
      // Disable 'contextIsolation' to allow 'nodeIntegration'
      // 'contextIsolation' defaults to "true" as from Electron v12
      contextIsolation: false,
      nodeIntegration: true
    }
  })

  // Create main app menu
  appMenu(mainWindow.webContents)

  // Load index.html into the new BrowserWindow
  mainWindow.loadFile('renderer/main.html')

  // Manage new window state
  state.manage(mainWindow)

  // Open DevTools - Remove for PRODUCTION!
  //mainWindow.webContents.openDevTools();

  // Listen for window being closed
  mainWindow.on('closed',  () => {
    mainWindow = null
  })
}

// Check with app.isReady()
app.on('ready', createWindow)

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
  if (mainWindow === null) createWindow()
})

//Check all events here: https://www.electronjs.org/docs/latest/api/app

/*Notes:
npm start
npm run watch
npm i electron-window-state
npm install -g electron-builder
npm i -D electron-builder (mark electron-builder as development dependency)

https://www.electron.build/cli
electron-builder build -win zip
electron-builder build -mwl
From windows, we can only build for -w and -l (not mac) -> use AppVeyor

We need to generate icons for each platform (win, mac, linux) -> CloudConvert
For mac > ICNS
For win > ICO (256x256)
-> create a folder "build" for assets 

When signing an app, the certificate needs to be approved by apple (for max) or Commodo (for win)
From windows:
electron-builder create-self-signed-cert -p publisherName
when run, will be asked for a password, we can leave it blank
*/