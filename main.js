const electron = require('electron'); 
const url = require('url'); 
const path = require('path'); 

const {app, BrowserWindow, Menu, ipcMain} = electron; 

let mainWindow; 
let addWindow; 

// app ready
app.on('ready', function(){
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  }); 
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'), 
    protocol: 'file:',
    slashes: true
  }));  
  mainWindow.on('closed', function(){
    app.quit(); 
  });

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);  
}); 

//Handle create add window
function createAddWindow(){
  addWindow = new BrowserWindow({
    width: 300,
    height: 200, 
    title: 'Add Shopping List Item',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  }); 
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'), 
    protocol: 'file:',
    slashes: true
  })); 
  // Garbage collection
  addWindow.on('close', function(){
    addWindow = null; 
  }); 
}

// Catch item: add
ipcMain.on('item:add', function(e, item){
  console.log(item); 
  mainWindow.webContents.send('item:add', item); 
  addWindow.close(); 
}); 

// menu template
const mainMenuTemplate = [
  {
    label: 'File', 
    submenu: [
      {
        label: 'Add Item', 
        click(){
          createAddWindow(); 
        }
      },
      {
        label: 'Clear Items', 
        click(){
          mainWindow.webContents.send('item:clear')
        }
      }, 
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' :
        'Ctrl+Q',
        click(){
          app.quit(); 
        }
      }
    ]
  }
]; 

// For macs, add empty object in menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({}); 
}

// Dev tools if not in prod
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools', 
    submenu: [
      {
        label: 'Toggle DevTools', 
        click(item, focusedWindow){
          focusedWindow.toggleDevTools(); 
        }
      }, 
      {
        role: 'reload'
      }
    ]
  }); 
}

