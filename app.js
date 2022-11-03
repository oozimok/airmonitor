const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const configuration = require('./config.json');
const {OAuth2Client, OAuth2Fetch} = require("@badgateway/oauth2-client");
const dev = false;

if (dev) {
    try {
        require('electron-reloader')(module);
    } catch (e) {
        console.log(e);
    }
}

if (!global.fetch) {
    const nodeFetch = require('node-fetch');
    global.fetch = nodeFetch;
    global.Headers = nodeFetch.Headers;
    global.Request = nodeFetch.Request;
    global.Response = nodeFetch.Response;
}

if (global.btoa === undefined) {
    global.btoa = input => {
        return Buffer.from(input).toString('base64');
    };
}

class ClearGrassAirMonitor {

    constructor(config, log) {
        this.log = log;
        this.win = null;
        this.error = 0;
        this.client = new OAuth2Client(config);
        this.fetchWrapper = new OAuth2Fetch({
            client: this.client,
            getNewToken: async () => {
                return this.client.clientCredentials();
            },
            onError: (err) => {
                this.log.error(err);
            }
        });
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
            titleBarStyle: 'hidden',
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
            const value = await this.getDevice();
            if (value) {
                this.win.webContents.send('device-result', value);
                this.cleanError();
            } else {
                this.incError();
            }
        });

        ipcMain.on('set-setting', async (event, args) => {
            if (args && args.mac) {
                const success = await this.setSetting(args.mac);
                return this.log.info('set-setting', success);
            }
            this.incError();
        });

        ipcMain.on('get-data', async (event, args) => {
            if (args && args.mac) {
                const value = await this.getData(args.mac);
                if (value) {
                    return this.win.webContents.send('data-result', value);
                }
            }
            this.incError();
        });
    }

    async getDevice() {
        const timestamp = new Date().getTime();
        return this.fetchWrapper
            .fetch('https://apis.cleargrass.com/v1/apis/devices?timestamp=' + timestamp)
            .then((response) => response.json())
            .then((response) => {
                let result = [];
                if (response && response.total > 0 && Array.isArray(response.devices)) {
                    result = response.devices.map(device => {
                        return {
                            info: device.info ? this.convertInfo(device.info) : null,
                            data: device.data ? this.convertData(device.data) : null,
                        };
                    });
                }
                return result;
            })
            .catch((error) => this.log.error(error));
    }

    async setSetting(mac) {
        const timestamp = new Date().getTime();
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mac: [mac],
                report_interval: 10,
                collect_interval: 5,
                timestamp,
            })
        };
        return this.fetchWrapper
            .fetch('https://apis.cleargrass.com/v1/apis/devices/settings', requestOptions)
            .then((response) => response.status === 200)
            .catch((error) => this.log.error(error));
    }

    async getData(mac) {
        const timestamp = new Date().getTime();
        const end_time = timestamp / 1000 | 0;
        const start_time = end_time - 86000;
        return this.fetchWrapper
            .fetch('https://apis.cleargrass.com/v1/apis/devices/data?mac=' + mac + '&limit=100&start_time=' + start_time + '&end_time=' + end_time + '&timestamp=' + timestamp)
            .then((response) => response.json())
            .then((response) => {
                console.log(response);
                if (response && response.total > 0 && Array.isArray(response.data)) {
                    return response.data[0] ? this.convertData(response.data[0]) : null;
                }
            })
            .catch((error) => this.log.error(error));
    }

    convertInfo(info) {
        return {
            name: info.name,
            mac: info.mac,
        };
    }

    convertData(data) {
        return {
            timestamp  : parseFloat(data.timestamp.value).toFixed(0),
            battery    : parseFloat(data.battery.value).toFixed(2),
            co2        : parseFloat(data.co2.value).toFixed(2),
            pm10       : parseFloat(data.pm10.value).toFixed(1),
            pm25       : parseFloat(data.pm25.value).toFixed(1),
            tvoc       : (parseFloat(data.tvoc.value) * 0.11 / 24.45).toFixed(3),
            temperature: parseFloat(data.temperature.value).toFixed(1),
            humidity   : parseFloat(data.humidity.value).toFixed(1),
        };
    }

    cleanError() {
        this.error = 0;
    }

    incError() {
        this.error++;
        const count = this.error > 99 ? '99+' : this.error;
        this.win.webContents.send('data-error', count);
    }
}

app.whenReady().then(() => {
    const cgim = new ClearGrassAirMonitor(configuration, console);
    cgim.createWindow();
    cgim.listener();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) cgim.createWindow();
    });
});

app.on('window-all-closed', () => {
    app.quit();
});
