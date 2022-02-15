const {app,BrowserWindow} = require("electron")
const path = require('path')
var isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() == "true") : false;

if (isDev) {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    });
}
app.on('ready', () => {

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

        ventanaPrincipal.on('closed', () => {
            app.quit();
          });
    }

})
