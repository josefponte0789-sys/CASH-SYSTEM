const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    saveForm: (data, dateSelected, dateOfCheckSelected) => ipcRenderer.invoke("save-form", data, dateSelected, dateOfCheckSelected),
    readForm: () => ipcRenderer.invoke("get-data"),
    updateForm: (data, editDateSelected, editDateCheckSelected) => ipcRenderer.invoke("update-form", data, editDateSelected, editDateCheckSelected),
    getClientId: (id) => ipcRenderer.invoke("get-client",id),
    exportData:(startDate, endDate) => ipcRenderer.invoke("export-data", startDate, endDate),
    downloadDatabase: () => ipcRenderer.invoke("download-db"),
    deleteEntry: (id) => ipcRenderer.invoke("delete-entry", id),
    exportImages:(startDate, endDate) => ipcRenderer.invoke("export-images", startDate, endDate),
    importDatabase:() => ipcRenderer.invoke("import-db"),
    exportPdf: (startDate, endDate) => ipcRenderer.invoke('export-pdf', startDate, endDate),
})