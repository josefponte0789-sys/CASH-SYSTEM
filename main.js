const { app, BrowserWindow, ipcMain, dialog } = require('electron/main')

const path = require('path')
const fs = require('fs');
const Database = require('better-sqlite3');

let db;

const createWindow = () => {
    
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences:{
            preload: path.join(__dirname, 'preload.js')
        }
    })
    // win.removeMenu()

    win.loadFile('index.html')

}

app.whenReady().then(() => {
    const dbDir = app.getPath('userData');
    const dbPath = path.join(dbDir, 'clients.db');
  
    db = new Database(dbPath);

    db.exec(`
        CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clientName TEXT NOT NULL,
        codeName TEXT NOT NULL,
        dateTime TEXT NOT NULL,
        userWebcam BLOB
        )
        
    `)

   

    createWindow()
});

ipcMain.handle('save-form', async (event, formData) => {

    try {
        const stmt = db.prepare(
            'INSERT INTO clients (clientName, codeName, dateTime, userWebcam) VALUES (?, ?, ?, ?)'
        );
        stmt.run(formData.clientName, formData.codeName, formData.dateTime, formData.userWebcam);
        
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };

    }
})

ipcMain.handle('get-data', async () => {

    try {
        const rows = db.prepare(
            'SELECT * FROM clients'
        ).all();
    
        
        return { success: true, data:rows };
    } catch (err) {
        return { success: false, error: err.message };

    }
})

ipcMain.handle('get-client', async (event, id) => {

    try {
      const stmt = db.prepare("SELECT * FROM clients WHERE id = ?")
        const client = stmt.get(id);
        return { success: true, client };
    } catch (err) {
        return { success: false, error: err.message };

    }
})


ipcMain.handle('update-form', async (event, formData) => {

    try {
        const stmt = db.prepare(
            'UPDATE clients set clientName = ?, codeName = ?, dateTime =? WHERE id = ?'
        );
        const info = stmt.run(
            formData.clientName, formData.codeName, formData.dateTime, formData.id
        );
        
        return { success: info.changes > 0 };
    } catch (err) {
        return { success: false, error: err.message };

    }
})
