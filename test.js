const miio = require('miio');


miio.device({ address: '192.168.2.2' })
  .then(device => {

    console.log('Connected to', device)
    device.call("get_prop", ["co2","pm25","tvoc","temperature","humidity"])
            .then(console.log)
            .catch(console.log);
  })
  .catch(console.log);