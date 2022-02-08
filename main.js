const {app,BrowserWindow} = require("electron")
const path = require('path')
const a =  require("electron-reload")

if (process.env.NODE_ENV !== "production") {
    require('electron-reload')(__dirname,{
        electron: path.join(__dirname,"node_modules",".bin","electron"),
        hardResetMethod: 'exit'
    })
}

let ventanaPrincipal
app.allowRendererProcessReuse = true;
app.whenReady().then(createWindow);

function createWindow() {
    ventanaPrincipal = new BrowserWindow({
        webPreferences:{
            nodeIntegration:true,
            contextIsolation:false
        }
    });
    ventanaPrincipal.loadFile('index.html');
    ventanaPrincipal.maximize()
}

