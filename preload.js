const { contextBridge, ipcRenderer } = require('electron');
const { captureRejectionSymbol } = require('events');

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
});

contextBridge.exposeInMainWorld('auth',{
    hasUsers: () => ipcRenderer.invoke('auth:hasUsers'),
    register:(data) => ipcRenderer.invoke('auth:register', data),
    login:(data) => ipcRenderer.invoke('auth:login', data),
    logout: () => ipcRenderer.invoke('auth:logout'),
    currentUser: () => ipcRenderer.invoke('auth:currentUser'),
});

contextBridge.exposeInMainWorld('appInfo',{
    getVersion: () => ipcRenderer.invoke('get-app-version'),
})