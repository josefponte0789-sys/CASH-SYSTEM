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
        dateTime TEXT NOT NULL
        )
        
    `)

   

    createWindow()
});

ipcMain.handle('save-form', async (event, formData) => {

    try {
        const stmt = db.prepare(
            'INSERT INTO clients (clientName, codeName, dateTime) VALUES (?, ?, ?)'
        );
        stmt.run(formData.clientName, formData.codeName, formData.dateTime);
        
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };

    }
})

ipcMain.handle('get-data', async () => {

    try {
        const rows = db.prepare(
            'SELECT * FROM clients ORDER BY id DESC'
        ).all();
    
        
        return { success: true, data:rows };
    } catch (err) {
        return { success: false, error: err.message };

    }
})