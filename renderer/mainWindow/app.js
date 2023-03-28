//Modules
const { ipcRenderer } = require ('electron');
const fs = require('fs');

//DOM nodes
let showQuoteButton = document.getElementById('show-viz'),
    reminderStatus = document.getElementById('reminder-status'),
    stopReminders = document.getElementById('stop-reminder'),
    newQuoteButton = document.getElementById('new-quote'),
    quoteModal = document.getElementById('modal'),
    closeQuoteModal = document.getElementById('close-modal'),
    addNewQuote = document.getElementById('add-quote'),
    closeApp = document.getElementById('close-app'),
    minApp = document.getElementById('minimize-app'),
    helpButton = document.getElementById('help'),
    helpModal = document.getElementById('help-modal'),
    closeHelpModal =  document.getElementById('close-help');

//Variables
let dailyQuote, 
    timeoutId, 
    currentDay,
    isReminderSet = false;

//Display modal to add new quote
newQuoteButton.addEventListener('click', e => {
    quoteModal.style.display = 'flex';
});

//Display help modal
helpButton.addEventListener('click', e => {
    helpModal.style.display = 'flex';
});

//Close help modal
closeHelpModal.addEventListener('click', e => {
    helpModal.style.display = 'none';
});

//Close modal to add new quote
closeQuoteModal.addEventListener('click', e => {
    quoteModal.style.display = 'none';
});

//Add a new quote to the list
addNewQuote.addEventListener('click', e => {
    fs.readFile('C:/Users/fanny.balestrat/Documents/Fanny/Projects/PowerViz/renderer/storage/quotes.txt', 'utf-8', (err, data) => {
        let numOldQuotes = data.toString().split('\n').length;
        let newQuote = document.getElementById('quote-to-add').value;
        //Add new quote to the list
        fs.appendFile('C:/Users/fanny.balestrat/Documents/Fanny/Projects/PowerViz/renderer/storage/quotes.txt', '\n' + newQuote, () => {});
        document.getElementById('quote-to-add').value = '';
        resetCounters(numOldQuotes);
        closeQuoteModal.click();
        //Display success message
        ipcRenderer.send('quote-successfully-added');
    });
});

//Set counter of quote newly added
function resetCounters(numOldQuotes) {
    //Get minimum counter of quotes already present and set counter of new quote to that number
    fs.readFile('C:/Users/fanny.balestrat/Documents/Fanny/Projects/PowerViz/renderer/storage/quotesSet.txt', 'utf-8',
        (err, data) => {
            const indices = data.split('\n');
            let counts = [];
            for (var i = 0; i < numOldQuotes; i++) {
                counts[i] = 0;
            }

            if (!indices[0] == '') {
                for (var i = 0; i < indices.length; i++) {
                    let num = parseInt(indices[i]);
                    counts[num] = counts[num] ? counts[num] + 1 : 1;
                }

                let minimum = Math.min(...counts);
                for (var i = 0; i < minimum; i++) {
                    fs.appendFile('C:/Users/fanny.balestrat/Documents/Fanny/Projects/PowerViz/renderer/storage/quotesSet.txt', '\n' + numOldQuotes, () => {});
                }
            } 
        }
    );  
}

//Get quote of the day and open quote window
showQuoteButton.addEventListener('click', e => {
    fs.readFile('C:/Users/fanny.balestrat/Documents/Fanny/Projects/PowerViz/renderer/storage/dailyQuote.txt', 'utf-8', (err, data) => {
        const splits = data.split('\n')[0].split('-');
        currentDay = splits;
        //If quote is already defined for the day
        if (splits[0] == new Date().getUTCFullYear() && splits[1] == new Date().getMonth() && splits[2] == new Date().getUTCDate()) {
            dailyQuote = data.split('\n')[1];
        }
        else {
            setQuoteOfTheDay();
        }
    });  
    //Open quote window
    setTimeout(() => {
        ipcRenderer.send('show-quote', [dailyQuote, isReminderSet]);
    }, 400);

});

//Set a new quote for the day
function setQuoteOfTheDay() {
    fs.readFile('C:/Users/fanny.balestrat/Documents/Fanny/Projects/PowerViz/renderer/storage/quotes.txt', 'utf-8',
        (err, data) => {
            const values = data.toString().split('\n');

            let counts = [], minimumIndices = [], indexToUse;
            for (var i = 0; i < values.length; i++) {
                counts[i] = 0;
            }

            //Find index of quote to be used so that all quotes are shown at the same frequency
            fs.readFile('C:/Users/fanny.balestrat/Documents/Fanny/Projects/PowerViz/renderer/storage/quotesSet.txt', 'utf-8',
                (err, data) => {
                    const indices = data.split('\n');

                    if (indices[0] == '') {
                        indexToUse = Math.floor(Math.random() * (counts.length));
                        fs.appendFile('C:/Users/fanny.balestrat/Documents/Fanny/Projects/PowerViz/renderer/storage/quotesSet.txt', indexToUse, () => {});
                    } else {
                        for (var i = 0; i < indices.length; i++) {
                            let num = parseInt(indices[i]);
                            counts[num] = counts[num] ? counts[num] + 1 : 1;
                        }

                        //If all quote counts are all equal, clear the file
                        if (counts.every((val, i, arr) => val === arr[0])) {
                            fs.writeFile('C:/Users/fanny.balestrat/Documents/Fanny/Projects/PowerViz/renderer/storage/quotesSet.txt', '', () => {});
                        }

                        let minimum = Math.min(...counts);
                        let newMinimum = minimum;

                        while (newMinimum == minimum) {
                            minIndex = counts.indexOf(newMinimum);
                            minimumIndices.push(minIndex);
                            counts[minIndex] = counts[minIndex] + 1;
                            newMinimum = Math.min(...counts);
                        } 
    
                        let random = Math.floor(Math.random() * (minimumIndices.length - 1));
                        indexToUse = minimumIndices[random];
                        fs.appendFile('C:/Users/fanny.balestrat/Documents/Fanny/Projects/PowerViz/renderer/storage/quotesSet.txt', '\n' + indexToUse, () => {});
                    }

                    dailyQuote = values[indexToUse];
                    fs.writeFile('C:/Users/fanny.balestrat/Documents/Fanny/Projects/PowerViz/renderer/storage/dailyQuote.txt', 
                    new Date().getUTCFullYear() + '-' + new Date().getMonth() + '-' + new Date().getUTCDate() + '\n' + dailyQuote, 
                    () => {}); 
                }
            );  
        }
    );
}

//Set reminder for quote
ipcRenderer.on('send-notification', (e, data) => {
    reminderStatus.innerHTML = "A notification reminder is in progress for today's quote.";
    stopReminders.style.display = 'inline';
    
    //Change reminder status
    isReminderSet = true;
    ipcRenderer.send('set-reminder');

    //Set random reminder or fixed interval reminder
    data[0] == 'intervals'? setIntervalNotifications(data) : setRandomNotifications(data);
});

//Set fixed interval reminders
let setIntervalNotifications = (data) => {
    const interval = data[2];
    const count = data[1];

    let currentCount = 0;
    startIntervals();
    //TO DO: Stop notifications if next day
    function startIntervals() {
        if (currentCount < count) {
            timeoutId = setTimeout(startIntervals, interval * 60000);
        } else {
            unsetReminder();
        }
        if (currentCount != 0) {
            sendNotification();
        }
        currentCount++;
    } 
};

//Set random reminders
let setRandomNotifications = (data) => {
    const count = data[1];

    const endTime = data[2];
    const endTimeMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    const startTime = new Date();
    const startTimeMinutes = startTime.getHours() * 60 + startTime.getMinutes();

    const range = endTimeMinutes - startTimeMinutes;
    const averageInterval = range/count;
    const max = averageInterval + averageInterval * 0.15;
    const min = Math.max(averageInterval - averageInterval * 0.3, 0.5);

    let arrayOfRandomIntervals = [], sum = 0, currentInterval;
    for (var i = 0; i < count; i++) {
        if (i != count - 1) {
            currentInterval = Math.random() * (max - min + 1) + min; 
        } else {
            currentInterval = Math.max(range - sum, 0.5);
        }
        arrayOfRandomIntervals.push(currentInterval);
        sum += currentInterval;
    }

    //Reduce intervals if total of all intervals is larger than required range
    if (sum > range) {
        let diff = sum - range;
        let individualDiff = diff/count;
        for (var i = 0; i < count; i++) {
            arrayOfRandomIntervals[i] = Math.max(arrayOfRandomIntervals[i] - individualDiff, 0);
        }
    }

    //If final interval is calculated to be negative
    if (currentInterval < 0) {
        let diff = Math.abs(currentInterval);
        let individualDiff = diff/(count - 1);
        for (var i = 0; i < count - 1; i++) {
            arrayOfRandomIntervals[i] = Math.max(arrayOfRandomIntervals[i] - individualDiff, 0);
        }
        arrayOfRandomIntervals[arrayOfRandomIntervals.length - 1] = 0.5;
    }

    let currentCount = 0;
    startRandom();

    function startRandom() {
        if (currentCount < count) {
            timeoutId = setTimeout(startRandom, arrayOfRandomIntervals[currentCount] * 60000);
        } else {
            unsetReminder();
        }
        if (currentCount != 0) {
            sendNotification();
        }
        currentCount++;
    } 
};

//Show quote window
ipcRenderer.on('open-quote', e => {
    showQuoteButton.click();
});

//Send reminder notification
let sendNotification = () => {
    //If we've reached the following day, stop notifications
    //TO DO: Test if notifications are stopped if next day
    if (currentDay[0] == new Date().getUTCFullYear() && currentDay[1] == new Date().getMonth() && currentDay[2] == new Date().getUTCDate()) {
        ipcRenderer.send('show-notification', dailyQuote);
    } else {
        stopReminders.click();
    }
};

//Stop reminder
stopReminders.addEventListener('click', e => {
    unsetReminder();
    clearTimeout(timeoutId);
});

//Unset reminder and remove message
function unsetReminder() {
    reminderStatus.innerHTML = '';
    stopReminders.style.display = 'none';

    //Change reminder status
    isReminderSet = false;
    ipcRenderer.send('set-reminder');
}

//Minimize window
minApp.addEventListener('click', e => {
    ipcRenderer.send('min-app');
});

//Close window and exit app
closeApp.addEventListener('click', e => {
    ipcRenderer.send('close-app');
});