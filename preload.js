const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    saveForm: (data, dateSelected) => ipcRenderer.invoke("save-form", data, dateSelected),
    readForm: () => ipcRenderer.invoke("get-data"),
    updateForm: (data, editDateSelected) => ipcRenderer.invoke("update-form", data, editDateSelected),
    getClientId: (id) => ipcRenderer.invoke("get-client",id),
    exportData:(startDate, endDate) => ipcRenderer.invoke("export-data", startDate, endDate),
    downloadDatabase: () => ipcRenderer.invoke("download-db"),
    deleteEntry: (id) => ipcRenderer.invoke("delete-entry", id),
    exportImages:(startDate, endDate) => ipcRenderer.invoke("export-images", startDate, endDate),
    importDatabase:() => ipcRenderer.invoke("import-db"),
})