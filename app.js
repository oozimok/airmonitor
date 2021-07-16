const { app, BrowserWindow, screen, ipcMain } = require('electron');
const miio = require('miio');
const path = require('path');
const dev = false;

if (dev) {
    try {
        require('electron-reloader')(module);
    } catch (e) {
        console.log(e);
    }
}

class ClearGrassAirMonitor {

    constructor(config, log) {
        this.ip = config.ip;
        this.token = config.token;
        this.log = log;
        this.win = null;
        this.device = null;
    }

    createWindow() {
        const { width } = screen.getPrimaryDisplay().workAreaSize;
        this.win = new BrowserWindow({
            width,
            height: 250,
            y: 0,
            x: width,
            title: 'AirMonitor',
            frame: true,
            backgroundColor: '#000000',
            webPreferences: {
                nodeIntegration: false, // значение по умолчанию после Electron v5
                contextIsolation: true, // защита от загрязнения прототипа
                enableRemoteModule: false, // выключить удаленный
                preload: path.join(__dirname, 'js', 'preload.js')
            }
        })
        this.win.loadFile('index.html');
        if (dev) {
            this.win.webContents.openDevTools()
        }
    }

    listener() {
        ipcMain.on('get-device', async (event, args) => {
            const success = await this.getDevice();
            this.win.webContents.send('device-result', { success });
        });

        ipcMain.on('get-data', async (event, args) => {
            const value = await this.getData();
            this.win.webContents.send('data-result', value);
        });
    }

    async getDevice() {
        return miio.device({ address: this.ip, token: this.token })
            .then(device => {
                this.log.debug('Discovered Mi Clear Grass (%s) at %s ', device.miioModel, this.ip );
                if (device.miioModel === 'cgllc.airmonitor.s1') {
                    this.device = device;
                    return true;
                }
                return false;
            })
            .catch(err => {
                this.log.debug('Failed to discover Clear Grass at %s', this.ip);
                return false;
            });
    }

    async getData() {
        if (!this.device) {
            return {};
        }
        return await this.device.call("get_prop", ["co2","pm25","tvoc","temperature","humidity"])
            .then(this.convertData)
            .catch(err => this.log.debug('Failed to get_prop  %s', err));
    }

    convertData(result = {co2: 0, pm25: 0, tvoc: 0, temperature:0, humidity:0}) {
        return {
            co2        : Number(parseFloat(result.co2).toFixed(2)),
            pm25       : Number(parseFloat(result.pm25).toFixed(1)),
            tvoc       : Number((parseFloat(result.tvoc) * 0.11 / 24.45).toFixed(3)),
            temperature: Number(parseFloat(result.temperature).toFixed(1)),
            humidity   : Number(parseFloat(result.humidity).toFixed(1)),
        };
    }
}

app.whenReady().then(() => {
    const cgim = new ClearGrassAirMonitor({
        ip: '192.168.2.2',
        //token: '6542485a75706143416f517471645968',
    }, console);
    cgim.createWindow();
    cgim.listener();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) cgim.createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
