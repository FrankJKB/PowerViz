//Modules
const { app, BrowserWindow, ipcMain } = require('electron');
const alert = require('electron-alert');

//Global variables
global.mainWindow = null;
global.quoteWindow = null;

//Variables
let isReminderSet = false;

//Create main window
function createWindow () {
  //Create browser window
  mainWindow = new BrowserWindow({
    width: 700,
    height: 450,
    center: true,
    darkTheme: true,
    frame: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  //Load template file
  mainWindow.loadFile('renderer/mainWindow/main.html');

  //When closing main window
  mainWindow.on('closed',  (e) => {
    mainWindow = null;
  });

  //Display success message when adding a new quote
  ipcMain.on('quote-successfully-added', (e) => {
    let swalOptions = {
      position: 'bottom-end',
      title: 'New Quote Added Successfully',
      icon: 'success',
      showConfirmButton: false,
      background: 'rgb(16,16,16)',
      color: 'rgb(232, 220, 220)',
      timer: 4000
    };

    alert.fireToast(swalOptions);
  });

  //Show reminder notification toast
  ipcMain.on('show-notification', (e, quote) => {
    let swalOptions = {
      position: 'bottom-end',
      title: 'POWER VIZ. Click here to see your quote of the day.',
      showConfirmButton: true,
      confirmButtonText: 'View',
      confirmButtonColor: 'rgb(82, 81, 81)',
      showCloseButton: true,
      background: 'rgb(16,16,16)',
      color: 'rgb(232, 220, 220)',
      timer: 4000
    };
    
    alert.fireToast(swalOptions).then((result) => {
      if (result.isConfirmed) {
        //Open quote window if notification is clicked
        e.sender.send('open-quote');
      }
    });
  });

  //Minimize app
  ipcMain.on('min-app', e => {
    mainWindow.minimize();
  });

  //Close main window and exit app + show confirm dialog before quitting app if reminder is set
  ipcMain.on('close-app', e => {
    if (isReminderSet) {
      e.preventDefault();
      let swalOptions = {
        title: 'Are you sure you want to exit the app? Notifications will be stopped.',
        position: '',
        icon: 'warning',
        showConfirmButton: true,
        confirmButtonText: 'Exit',
        confirmButtonColor: 'rgb(82, 81, 81)',
        showCancelButton: true,
        cancelButtonColor: 'rgb(51, 51, 51)',
        background: 'rgb(16,16,16)',
        color: 'rgb(232, 220, 220)',
      };
      
      alert.fireToast(swalOptions).then((result) => {
        if (result.isConfirmed) {
          mainWindow.close(); 
        }
      });
    } else {
      mainWindow.close(); 
    } 
  });

  //Change reminder status
  ipcMain.on('set-reminder', e => {
    isReminderSet = !isReminderSet;
  });
};

//Create quote window
ipcMain.on('show-quote', (event, args) => {
  if (!quoteWindow) {
    //Create quote browser window
    quoteWindow = new BrowserWindow({
      show: false,
      frame: false,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    quoteWindow.maximize();
    quoteWindow.show();
    quoteWindow.loadFile('renderer/quoteWindow/quote.html');

    ipcMain.on('send-quote', (event) => {
      event.sender.send('receive-quote', args);
    });
  }
});

//When closing quote window
ipcMain.on('close-quote', () => {
    if (quoteWindow) {
      quoteWindow.close();
      quoteWindow = null;
    }
});

//App events
app.on('ready', createWindow);

app.on('window-all-closed', (e) => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});