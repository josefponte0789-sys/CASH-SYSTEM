const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    saveForm: (data) => ipcRenderer.invoke("save-form", data),
    readForm: () => ipcRenderer.invoke("get-data"),
})