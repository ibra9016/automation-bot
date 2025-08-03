const { app, BrowserWindow , ipcMain} = require('electron');
const path = require('path');
const bot = require("./bot.js");
let win;
function createWindow () {
   win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');

  bot.setWindow(win);
}

app.whenReady().then(createWindow);

ipcMain.on('run-bot-script', (event, formData) => {
  bot.runScript(formData)
    .then(() => {
      event.sender.send('bot-status', 'Bot finished successfully');
    })
    .catch(err => {
      event.sender.send('bot-status', `Bot error: ${err.message || err}`);
    });
});

  ipcMain.on('run-size-search',(event,url)=>{
    bot.getAvailableSizes(url)
    .then(() => {
      event.sender.send('bot-status', 'search finished successfully');
    })
    .catch(err => {
      event.sender.send('bot-status', `Bot error: ${err.message || err}`);
    });
  })
