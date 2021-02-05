const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const miio = require('miio');

app.use(express.static(__dirname));

class ClearGrassAirMonitor {

    constructor(config, io, log) {
        this.ip = config.ip;
        this.token = config.token;
        this.io = io;
        this.log = log;
        this.discover();
    }

    discover() {
        const log = this.log;
        const that = this;

        miio.device({
                address: this.ip,
                token: this.token
            })
            .then(device => {
                log.debug('Discovered Mi Clear Grass (%s) at %s ', device.miioModel, this.ip );

                if (device.miioModel == 'cgllc.airmonitor.s1') {
                    that.device = device;
			        that.loadData();
                }
            })
            .catch(err => {
                log.debug('Failed to discover Clear Grass at %s', this.ip);
                console.log('Will retry after 30 seconds' + err);
                setTimeout(function() {
                    that.discover();
                }, 30000);
            });
    }

    loadData() {
        let io = this.io;
        let log = this.log;
        let that = this;

	    that.device.call("get_prop", ["co2","pm25","tvoc","temperature","humidity"]).then(result => {
            // log.debug('result :  %s', JSON.stringify(result));
            io.emit('message', result);
        }).catch(function(err) {
            log.debug('Failed to get_prop  %s', err);
        });

        setTimeout(function() {
            that.loadData();
        }, 5000);
    }
    
};

const server = http.listen(3000, () => {
    console.log('server is running on port', server.address().port);

    new ClearGrassAirMonitor({
        ip: '192.168.2.3',
        token: '6542485a75706143416f517471645968',
    }, io, console);

});