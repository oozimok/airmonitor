const {
    contextBridge,
    ipcRenderer
} = require('electron');

// предоставляем защищенные методы,
// которые позволяют процессу рендеринга использовать ipcRenderer,
// не раскрывая весь объект
contextBridge.exposeInMainWorld(
    'api', {
        send: (channel, data) => {
            // добавить каналы в белый список
            let validChannels = ['get-device', 'get-data'];
            if (validChannels.includes(channel)) {
                console.log('send', {channel, data});
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = ['device-result', 'data-result'];
            if (validChannels.includes(channel)) {
                console.log('receive', {channel});
                // умышленно удалить событие, так как оно включает "отправителя"
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
);
