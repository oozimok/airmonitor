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
let interval = null;

// HIDE SCROLL
document.body.style.overflow = 'hidden';

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
co2_gauge.set(0);

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
hum_gauge.set(0);

// PM 1.0
const pm10_target = document.getElementById('chart-pm10');
const pm10_val = document.getElementById('pm10');
const pm10_gauge = new Gauge(pm10_target).setOptions(Object.assign(opts, {
    staticZones: [
        {strokeStyle: "#30B32D", min: 0, max: 35}, // Green
        {strokeStyle: "#FFDD00", min: 36, max: 75}, // Yellow
        {strokeStyle: "#FF8000", min: 76, max: 115}, // Orange
        {strokeStyle: "#F03E3E", min: 116, max: 150},  // Red
        {strokeStyle: "#8900ab", min: 151, max: 250},  //
        {strokeStyle: "#6e0002", min: 251, max: 300}  //
    ]
}));
pm10_gauge.maxValue = 300;
pm10_gauge.minValue = 0;
pm10_gauge.set(0);

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
pm25_gauge.set(0);

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
temp_gauge.set(0);

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
tvoc_gauge.set(0);

// SELECT DEVICE
const selectLoading = document.getElementById('loading');
const selectDevice = document.getElementById('devices');

// DIFF
const diff_val = document.getElementById('diff');
const setDiff = (value) => {
    let diff = 'diff: --/--/--';
    if (value > 0) {
        const h = Math.floor(value / 3600).toString().padStart(2, '0'),
            m = Math.floor(value % 3600 / 60).toString().padStart(2, '0'),
            s = Math.floor(value % 60).toString().padStart(2, '0');
        diff = `diff: ${h}:${m}:${s}`;
    }
    return diff;
}
diff_val.innerHTML = setDiff(0);

// BATTERY
const battery_val = document.getElementById('battery');
const setBattery = (value = 0) => `battery: ${value}%`
battery_val.innerHTML = setBattery(0);

// ERROR
const error_val = document.getElementById('error');
const setError = (value = 0) => 'error:' + (value > 0 ? '-' : value)
error_val.innerHTML = setError(0);

// SET DEVICES
const setDevices = (devices) => {
    // скрываем анимацию загрузки списка устройств
    selectLoading.style.display = 'none';
    // вещаем обработчик на изменения списка
    selectDevice.addEventListener('change', (e) => {
        // получаем данные с датчика, полученные во время извлечения информации об устройствах
        const device = devices.find(device => device.info.mac === e.target.value);
        // устанавливаем полученные данные с датчика
        setData(device.data);
        // очищаем предыдущий интервал
        clearInterval(interval);
        // устанавливаем настройки устройства
        window.api.send('set-setting', {mac: e.target.value});
        // получаем свежие данные
        window.api.send('get-data', {mac: e.target.value});
        // запускаем опрос данных
        interval = setInterval(() => {
            window.api.send('get-data', {mac: e.target.value})
        }, 5000);
    });
    // заполняем список устройств
    for (let i = 0; i < devices.length; i++) {
        if (devices[i] && devices[i].info) {
            selectDevice.add(new Option(devices[i].info.name, devices[i].info.mac));
            const lastIndex = devices.length - 1;
            // автоматически выбираем первое устройство из списка
            if (i === lastIndex) {
                selectDevice.value = devices[lastIndex].info.mac;
                selectDevice.dispatchEvent(new Event('change'));
            }
        }
    }
}

// SET DATA
const setData = (data) => {
    // CO2
    const co2 = parseFloat(data.co2).toFixed(0);
    if (co2_gauge.minValue <= co2 && co2_gauge.maxValue >= co2) {
        co2_gauge.set(co2);
        co2_val.innerHTML = `${co2} ppm`;
    }

    // HUMIDITY
    const humidity = parseFloat(data.humidity).toFixed(0);
    if (hum_gauge.minValue <= humidity && hum_gauge.maxValue >= humidity) {
        hum_gauge.set(humidity);
        hum_val.innerHTML = `${humidity} %`;
    }

    // PM 1.0
    const pm10 = parseFloat(data.pm10).toFixed(0);
    if (pm10_gauge.minValue <= pm10 && pm10_gauge.maxValue >= pm10) {
        pm10_gauge.set(pm10);
        pm10_val.innerHTML = `${pm10} µg/m3`;
    }

    // PM 2.5
    const pm25 = parseFloat(data.pm25).toFixed(0);
    if (pm25_gauge.minValue <= pm25 && pm25_gauge.maxValue >= pm25) {
        pm25_gauge.set(pm25);
        pm25_val.innerHTML = `${pm25} µg/m3`;
    }

    // TEMPERATURE
    const temperature = parseFloat(data.temperature).toFixed(0);
    if (temp_gauge.minValue <= temperature && temp_gauge.maxValue >= temperature) {
        temp_gauge.set(temperature);
        temp_val.innerHTML = `${temperature} °C`;
    }

    // TVOC
    const tvoc = parseFloat(data.tvoc).toFixed(3);
    if (tvoc_gauge.minValue <= tvoc && tvoc_gauge.maxValue >= tvoc) {
        tvoc_gauge.set(tvoc);
        tvoc_val.innerHTML = `${tvoc} mg/m3`;
    }

    // TIMESTAMP
    const timestamp = parseFloat(data.timestamp).toFixed(0);
    diff_val.innerHTML = setDiff(parseFloat((new Date().getTime() / 1000) - timestamp).toFixed(0));

    // BATTERY
    const battery = parseFloat(data.battery).toFixed(0);
    battery_val.innerHTML = setBattery(battery);
}

// REQUEST LIST DEVICES
window.api.send('get-device');

// RECEIVE DATA
window.api.receive('device-result', setDevices);
window.api.receive('data-result', setData);
window.api.receive('data-error', setError);
