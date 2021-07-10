const opts = {
    angle: 0.15,     // размах измерительной дуги
    lineWidth: 0.44, // толщина линии
    radiusScale: 1,  // относительный радиус
    pointer: {
        length: 0.6,      // относительно калибровочного радиуса
        strokeWidth: 0.1, // толщина
        color: '#FFFFFF'  // цвет заливки
    },
    limitMax: false,        // если false, максимальное значение автоматически увеличивается, если value > maxValue
    limitMin: false,        // если true, минимальное значение шкалы будет фиксированным
    strokeColor: '#E0E0E0',
    highDpiSupport: true, // Поддержка высокого разрешения
};

// CO2
const co2_target = document.getElementById('chart-co2');
const co2_val = document.getElementById('co2');
const co2_gauge = new Gauge(co2_target).setOptions(Object.assign(opts, {
    staticZones: [
        {strokeStyle: "#30B32D", min: 0, max: 999}, // Green
        {strokeStyle: "#FFDD00", min: 1000, max: 1999}, // Yellow
        {strokeStyle: "#F03E3E", min: 2000, max: 2999}, // Red
        {strokeStyle: "#8900ab", min: 3000, max: 3999}, //
        {strokeStyle: "#6e0002", min: 4000, max: 5000}  //
    ],
}));
co2_gauge.maxValue = 5000;
co2_gauge.minValue = 0;

// HUMIDITY
const humidity_target = document.getElementById('chart-humidity');
const hum_val = document.getElementById('humidity');
const hum_gauge = new Gauge(humidity_target).setOptions(Object.assign(opts, {
    staticZones: [
        {strokeStyle: "#F03E3E", min: 0, max: 14}, // Red
        {strokeStyle: "#FFDD00", min: 15, max: 29}, // Yellow
        {strokeStyle: "#30B32D", min: 30, max: 40}, // Green
        {strokeStyle: "#FFDD00", min: 41, max: 60}, // Yellow
        {strokeStyle: "#F03E3E", min: 61, max: 100}  // Red
    ],
}));
hum_gauge.maxValue = 100;
hum_gauge.minValue = 0;

// PM 2.5
const pm25_target = document.getElementById('chart-pm25');
const pm25_val = document.getElementById('pm25');
const pm25_gauge = new Gauge(pm25_target).setOptions(Object.assign(opts, {
    staticZones: [
        {strokeStyle: "#30B32D", min: 0, max: 35}, // Green
        {strokeStyle: "#FFDD00", min: 36, max: 75}, // Yellow
        {strokeStyle: "#FF8000", min: 76, max: 115}, // Orange
        {strokeStyle: "#F03E3E", min: 116, max: 150},  // Red
        {strokeStyle: "#8900ab", min: 151, max: 250},  //
        {strokeStyle: "#6e0002", min: 251, max: 300}  //
    ]
}));
pm25_gauge.maxValue = 300;
pm25_gauge.minValue = 0;

// TEMPERATURE
const temperature_target = document.getElementById('chart-temperature');
const temp_val = document.getElementById('temperature');
const temp_gauge = new Gauge(temperature_target).setOptions(Object.assign(opts, {
    staticZones: [
        {strokeStyle: "#F03E3E", min: 0, max: 14}, // Red
        {strokeStyle: "#FFDD00", min: 15, max: 21}, // Yellow
        {strokeStyle: "#30B32D", min: 22, max: 25}, // Green
        {strokeStyle: "#FFDD00", min: 26, max: 30}, // Yellow
        {strokeStyle: "#F03E3E", min: 31, max: 50}  // Red
    ],
}));
temp_gauge.maxValue = 50;
temp_gauge.minValue = 0;

// TVOC
const tvoc_target = document.getElementById('chart-tvoc');
const tvoc_val = document.getElementById('tvoc');
const tvoc_gauge = new Gauge(tvoc_target).setOptions(Object.assign(opts, {
    staticZones: [
        {strokeStyle: "#30B32D", min: 0, max: 1.0}, // Green
        {strokeStyle: "#FFDD00", min: 1.1, max: 3.0}, // Yellow
        {strokeStyle: "#F03E3E", min: 3.1, max: 9.0},  // Red
        {strokeStyle: "#8900ab", min: 9.0, max: 10},  //
    ],
}));
tvoc_gauge.maxValue = 10;
tvoc_gauge.minValue = 0;

window.api.send('get-device');

window.api.receive('device-result', (data) => {
    if (data.success) {
        window.api.send('get-data');
        setInterval(() => {
            window.api.send('get-data')
        }, 5000);
    } else {
        window.api.send('get-device');
    }
});

window.api.receive('data-result', (data) => {
    // CO2
    const co2 = parseFloat(data.co2).toFixed(2);
    if (co2_gauge.minValue >= co2 && co2_gauge.maxValue <= co2) {
        co2_gauge.set(0);
        co2_val.innerHTML = co2 + " ppm";
    }

    // HUMIDITY
    const humidity = parseFloat(data.humidity).toFixed(1);
    if (hum_gauge.minValue >= humidity && hum_gauge.maxValue <= humidity) {
        hum_gauge.set(humidity);
        hum_val.innerHTML = humidity + " %";
    }

    // PM 2.5
    const pm25 = parseFloat(data.pm25).toFixed(1);
    if (pm25_gauge.minValue >= pm25 && pm25_gauge.maxValue <= pm25) {
        pm25_gauge.set(pm25);
        pm25_val.innerHTML = pm25 + " µg/m3";
    }

    // TEMPERATURE
    const temperature = parseFloat(data.temperature).toFixed(1);
    if (temp_gauge.minValue >= temperature && temp_gauge.maxValue <= temperature) {
        temp_gauge.set(temperature);
        temp_val.innerHTML = temperature + " °C";
    }

    // TVOC
    const tvoc = parseFloat(data.tvoc).toFixed(3);
    if (tvoc_gauge.minValue >= tvoc && tvoc_gauge.maxValue <= tvoc) {
        tvoc_gauge.set(tvoc);
        tvoc_val.innerHTML = tvoc + " mg/m3";
    }
});
