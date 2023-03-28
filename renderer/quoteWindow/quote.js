//Modules
const { ipcRenderer, remote } = require ('electron');

//DOM nodes
let closeButton = document.getElementById('close-window'),
    setReminderModal = document.getElementById('set-reminder'),
    reminderModal = document.getElementById('modal'),
    intervalType = document.getElementById('type1'),
    randomType = document.getElementById('type2'),
    intervalSection = document.getElementById('intervals'),
    randomSection = document.getElementById('random'),
    saveReminder = document.getElementById('save-reminder'),
    closeReminderModal = document.getElementById('close-modal'),
    errors = document.getElementById('errors');

//Receive daily quote from main
ipcRenderer.send('send-quote');
ipcRenderer.on('receive-quote', (event, args) => {
    let dailyQuote = args[0];
    let isReminderSet = args[1];
    document.getElementById('quote').innerHTML = dailyQuote;

    if (isReminderSet) {
        setReminderModal.style.display = 'none';
    } else {
        setReminderModal.style.display = 'inline';
    }
});

//Close window
closeButton.addEventListener('click', e => {
    ipcRenderer.send('close-quote');
});

//Set reminder
setReminderModal.addEventListener('click', e => {
    reminderModal.style.display = 'flex';
    setReminderModal.style.display = 'none';
    if (intervalType.checked) {
        intervalSection.style.display = 'flex';
    }
    else {
        randomSection.style.display = 'flex';
    }
});

//Display interval section
intervalType.addEventListener('click', e => {
    intervalSection.style.display = 'flex';
    randomSection.style.display = 'none';
    errors.innerHTML = '';
});

//Display random section
randomType.addEventListener('click', e => {
    intervalSection.style.display = 'none';
    randomSection.style.display = 'flex';
    errors.innerHTML = '';
});

//Close reminder modal
closeReminderModal.addEventListener('click', e => {
    reminderModal.style.display = 'none';
    setReminderModal.style.display = 'inline';
});

//Set reminder
saveReminder.addEventListener('click', e => {
    const type = intervalType.checked? 'intervals' : 'random';
    const number = document.getElementById('times').value;

    if (type == 'intervals') {
        frequency = document.getElementById('freq').value;
        //If frequency reaches next day
        if (parseInt(new Date().getHours()*60 + new Date().getMinutes()) + parseInt(frequency) > 1439) {
            errors.innerHTML = 'Frequency is too high. Choose a lower frequency.';
        } else {
            let data = [type, number, frequency];
            ipcRenderer.sendTo(remote.getGlobal('mainWindow').webContents.id, 'send-notification', data);
            closeButton.click();
        }
    } else {
        endTime = document.getElementById('end-time').value;
        //If set time is earlier than current time
        if (endTime.split(':')[0] <= new Date().getHours() && endTime.split(':')[1] <= new Date().getMinutes()) {
            errors.innerHTML = 'End time must be later than current time.';
        } else {
            let data = [type, number, endTime];
            ipcRenderer.sendTo(remote.getGlobal('mainWindow').webContents.id, 'send-notification', data);
            closeButton.click();
        }   
    } 
});

