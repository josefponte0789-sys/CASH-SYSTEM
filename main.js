const { app, BrowserWindow, ipcMain, dialog } = require('electron/main')

const path = require('path')
const fs = require('fs');
const Database = require('better-sqlite3');
const { start } = require('repl');

let db;
app.commandLine.appendSwitch('lang', 'en-US');

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

ipcMain.handle('save-form', async (event, formData, dateSelected) => {

    try {
        const stmt = db.prepare(
            'INSERT INTO clients (clientName, codeName, dateTime, userWebcam) VALUES (?, ?, ?, ?)'
        );
        stmt.run(formData.clientName, formData.codeName, dateSelected, formData.userWebcam);
        
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };

    }
})


//for the table
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


//just the clients
ipcMain.handle('get-client', async (event, id) => {

    try {
      const stmt = db.prepare("SELECT * FROM clients WHERE id = ?")
        const client = stmt.get(id);
        if (client && client.userWebcam) {
            client.userWebcamUrl = `data:image/png;base64,${client.userWebcam.toString('base64')}`;
            delete client.userWebcam;
        }
        return { success: true, client };
    } catch (err) {
        return { success: false, error: err.message };

    }
})


ipcMain.handle('update-form', async (event, formData, editDateSelected) => {
    try {
        let info;

        if (formData.userWebcam) {
            const stmt = db.prepare(`
                UPDATE clients
                SET clientName = ?,
                    codeName = ?,
                    dateTime = ?,
                    userWebcam = ?
                WHERE id = ?
            `);

            info = stmt.run(
                formData.clientName,
                formData.codeName,
                editDateSelected,
                Buffer.from(formData.userWebcam),
                formData.id
            );
        } else {
            const stmt = db.prepare(`
                UPDATE clients
                SET clientName = ?,
                    codeName = ?,
                    dateTime = ?
                WHERE id = ?
            `);

            info = stmt.run(
                formData.clientName,
                formData.codeName,
                editDateSelected,
                formData.id
            );
        }

        return {
            success: info.changes > 0
        };

    } catch (err) {
        console.error(err);

        return {
            success: false,
            error: err.message
        };
    }
});

ipcMain.handle('export-data', async(event, startDate, endDate)=>{

try{
    const rows = db.prepare(`SELECT id, clientName, codeName, dateTime FROM clients WHERE date(dateTime) BETWEEN  date(?) AND date(?) 
        ORDER BY dateTime ASC`).all(startDate, endDate);

        if (rows.length === 0){
            return{
                success: false,
                message: "No records found for this date range.",
            }
        }

        const csv = convertToCSV(rows);

          const saveResult = await dialog.showSaveDialog({
            title: "Export Records",
            defaultPath: `records_${startDate}_to_${endDate}.csv`,
            filters: [
                {
                    name: "CSV Files",
                    extensions: ["csv"]
                }
            ]
        });

        if (saveResult.canceled) {
            return {
                success: false,
                message: "Export cancelled."
            };
        }

        fs.writeFileSync(
            saveResult.filePath,
            csv,
            "utf8"
        );

        return {
            success: true,
            count: rows.length,
            path: saveResult.filePath
        };

    } catch (error) {

        console.error(error);

        return {
            success: false,
            message: error.message
        };
    }
});


function convertToCSV(rows){
    if(rows.length === 0){
        return "";
    }

    const headers = Object.keys(rows[0]);

    const csvRows = [
        headers.join(","),
        ...rows.map(row => headers.map(header =>`"${String(row[header] ?? "").replace(/"/g, '""')}"`)
    .join(","))
    ];
    return csvRows.join("\n");
}


ipcMain.handle('download-db', async (event) => {
    const dbPath  = path.join(app.getPath('userData'), 'clients.db');
    const {canceled, filePath} = await dialog.showSaveDialog({
        title: 'Save Database File',
        defaultPath: path.join(app.getPath('desktop'),'clients.db'),
        filters: [{name:'Database Files', extensions:['db']}]
    });

    if (canceled || !filePath) return {success: false};

    try{
        fs.copyFileSync(dbPath, filePath);
        return{success: true, path:filePath};
    }
    catch(err){
        return{success: false, error: err.message};
    }

    });