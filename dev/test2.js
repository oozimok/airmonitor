const { OAuth2Client, OAuth2Fetch } = require('@badgateway/oauth2-client');

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

const client = new OAuth2Client({
    grantType: 'client_credentials',
    clientId: 'BPu1bQLGg',
    clientSecret: '08b4839766fd11ebbb0500163e06ed69',
    tokenEndpoint: 'https://oauth.cleargrass.com/oauth2/token',
});

const fetchWrapper = new OAuth2Fetch({
    client,
    getNewToken: async () => {
        return client.clientCredentials();
    },
    onError: (err) => {
        console.log('ERROR', err);
    }
});

const getData = async (mac) => {
    const response = await fetchWrapper
        .fetch('https://apis.cleargrass.com/v1/apis/devices?timestamp=' + new Date().getTime())
        .then((response) => {
            return response.json();
        });

    if (response && response.total > 0 && Array.isArray(response.devices)) {
        const device = response.devices.filter(item => item.info.mac === mac);
        if (device) {
            console.log({
                date: new Date(device[0].data.timestamp.value * 1000 + (new Date()).getTimezoneOffset() * 60000).toLocaleString(),
                timestamp: device[0].data.timestamp.value,
                battery: device[0].data.battery.value,
                temperature: device[0].data.temperature.value,
                humidity: device[0].data.humidity.value,
                tvoc: device[0].data.tvoc.value,
                co2: device[0].data.co2.value,
                pm25: device[0].data.pm25.value,
                pm10: device[0].data.pm10.value,
            });
        }
    } else {
        console.log('Not data');
    }

    setTimeout(async function () {
        await getData(mac);
    }, 3000);
}

(async () => {
    await getData('582D34002A5D');
})();
