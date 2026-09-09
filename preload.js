const { contextBridge, ipcRenderer } = require('electron')

contextBridge.executeInMainWorld('api', {
    saveForm: (data) => ipcRenderer.invoke("save-form", data),
})