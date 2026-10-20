const { app, BrowserWindow, ipcMain, dialog } = require('electron/main')

const path = require('path')
const fs = require('fs');
const Database = require('better-sqlite3');
const { start } = require('repl');
const { error } = require('console');

let db;
app.commandLine.appendSwitch('lang', 'en-US');

const createWindow = () => {
    
    const win = new BrowserWindow({
        width: 1366,
        height: 768,
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
        authorizedPersonnel TEXT NOT NULL,
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
            'INSERT INTO clients (clientName, authorizedPersonnel, codeName, dateTime, userWebcam) VALUES (?, ?, ?, ?, ?)'
        );
        stmt.run(formData.clientName, formData.authorizedPersonnel, formData.codeName, dateSelected, formData.userWebcam);
        
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
                    authorizedPersonnel = ?,
                    codeName = ?,
                    dateTime = ?,
                    userWebcam = ?
                WHERE id = ?
            `);

            info = stmt.run(
                formData.clientName,
                formData.authorizedPersonnel,
                formData.codeName,
                editDateSelected,
                Buffer.from(formData.userWebcam),
                formData.id
            );
        } else {
            const stmt = db.prepare(`
                UPDATE clients
                SET clientName = ?,
                authorizedPersonnel = ?,
                    codeName = ?,
                    dateTime = ?
                WHERE id = ?
            `);

            info = stmt.run(
                formData.clientName,
                formData.authorizedPersonnel,
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
    const rows = db.prepare(`SELECT clientName, authorizedPersonnel, codeName, dateTime FROM clients WHERE date(dateTime) BETWEEN  date(?) AND date(?) 
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

    if (canceled || !filePath) return {success: false, message: "Download cancelled."};

    try{
        fs.copyFileSync(dbPath, filePath);
        return{success: true, path:filePath};
    }
    catch(err){
        return{success: false, error: err.message};
    }

});
    
ipcMain.handle('delete-entry', async (event, id) => {
    try {
        const stmt = db.prepare(`DELETE FROM clients WHERE id = ?`);
        stmt.run(id);
        return { success: true }
    } catch (err) {
        return { success: false, error: err.message };
    }
});


ipcMain.handle('export-images', async (event, startDate, endDate) => {
  try {
    const rows = db.prepare(`
      SELECT id, userWebcam, dateTime, clientName, authorizedPersonnel
      FROM clients
      WHERE date(dateTime) BETWEEN date(?) AND date(?)
        AND userWebcam IS NOT NULL
      ORDER BY dateTime ASC
    `).all(startDate, endDate);

     if (rows.length === 0){
            return{
                success: false,
                message: "No records found for this date range.",
            }
        }

    const win = BrowserWindow.fromWebContents(event.sender);
      const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: "Export images",
        properties: ['openDirectory', 'createDirectory'],
        defaultPath:path.join(app.getPath("pictures"))
    });
    if (canceled || !filePaths[0]) return { success: false, canceled: true };

    const outputDir = filePaths[0];
    let count = 0;

    for (const row of rows) {
      let buffer;
      let ext = '.png';

      if (Buffer.isBuffer(row.userWebcam)) {
        buffer = row.userWebcam;
      } else if (typeof row.userWebcam === 'string') {
        const match = row.userWebcam.match(/^data:image\/(\w+);base64,(.+)$/);
        if (match) {
          ext = '.' + (match[1] === 'jpeg' ? 'jpg' : match[1]);
          buffer = Buffer.from(match[2], 'base64');
        } else {
          buffer = Buffer.from(row.userWebcam, 'base64');
        }
      } else {
        continue;
      }

      const datePart = String(row.dateTime).slice(0, 10);
      const personnelName = String(row.clientName);
      const outPath = path.join(outputDir, `${count}_${datePart}_${personnelName}${ext}`);
      await fs.promises.writeFile(outPath, buffer);
      count++;
    }

    return { success: true, count };
  } catch (err) {
    return { success: false, error: err.message };
  }
});


ipcMain.handle('import-db', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: 'Import Database File',
        properties: ['openFile'],
        filters: [{ name: 'Database Files', extensions: ['db', 'sqlite', 'sqlite3'] }]
    });

    if (canceled || !filePaths[0]) return { success: false, canceled: true };

    const importPath = filePaths[0];
    let attached = false;

    try {
        await db.backup(path.join(app.getPath('userData'), `backup-${Date.now()}.db`));

        db.prepare('ATTACH DATABASE ? AS imported').run(importPath);
        attached = true;

        const hasTable = db.prepare(
            `SELECT 1 FROM imported.sqlite_master WHERE type = 'table' AND name = 'clients'`
        ).get();
        if (!hasTable) {
            return { success: false, error: 'This file has no "clients" table.' };
        }

        const srcCols = db.pragma('imported.table_info(clients)').map(c => c.name);
        const required = ['clientName', 'codeName', 'dateTime'];
        const missing = required.filter(c => !srcCols.includes(c));
        if (missing.length) {
            return { success: false, error: `Missing columns: ${missing.join(', ')}` };
        }

        const webcamExpr = srcCols.includes('userWebcam') ? 's.userWebcam' : 'NULL';

        const total = db.prepare('SELECT COUNT(*) AS n FROM imported.clients').get().n;

        const info = db.transaction(() => {
            return db.prepare(`
                INSERT INTO main.clients (clientName, codeName, dateTime, userWebcam)
                SELECT s.clientName, s.codeName, s.dateTime, ${webcamExpr}
                FROM imported.clients s
                WHERE NOT EXISTS (
                    SELECT 1 FROM main.clients c
                    WHERE c.clientName = s.clientName
                      AND c.authorizedPersonnel = s.authorizedPersonnel
                      AND c.codeName   = s.codeName
                      AND c.dateTime   = s.dateTime
                )
                ORDER BY s.id
            `).run();
        })();

        return {
            success: true,
            added: info.changes,
            skipped: total - info.changes
        };
    } catch (err) {
        console.error(err);
        return { success: false, error: err.message };
    } finally {
        if (attached) {
            try { db.exec('DETACH DATABASE imported'); } catch {}
        }
    }
});



/// JUST A TEST FROM CLAUDE FOR EXPORT-PDF CUZ IDK HOW TO MAKE IT:

const os = require('os');

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function blobToDataUri(buf) {
  if (!buf || !buf.length) return '';
  // Detect the real image type from the first bytes
  let mime = 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50) mime = 'image/png';
  else if (buf[0] === 0x52 && buf[1] === 0x49) mime = 'image/webp';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

ipcMain.handle('export-pdf', async (event, startDate, endDate) => {
  let win;
  let tmp;
  try {
    const rows = db.prepare(`
      SELECT clientName, authorizedPersonnel, codeName, dateTime, userWebcam
      FROM clients
      WHERE date(dateTime) BETWEEN date(?) AND date(?)
      ORDER BY dateTime ASC
    `).all(startDate, endDate);

    if (rows.length === 0) {
      return { success: false, message: 'No records found for this date range.' };
    }

    const saveResult = await dialog.showSaveDialog({
      title: 'Export Records',
      defaultPath: `records_${startDate}_to_${endDate}.pdf`,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
    });
    if (saveResult.canceled || !saveResult.filePath) {
      return { success: false, message: 'Export cancelled.' };
    }

    const cards = rows.map(r => {
      const src = blobToDataUri(r.userWebcam);
      return `
        <div class="client">
          ${src ? `<img src="${src}">` : `<div class="noimg">No image</div>`}
          <h2>${esc(r.clientName)}</h2>
          <p><b>Authorized personnel:</b> ${esc(r.authorizedPersonnel)}</p>
          <p><b>Code name:</b> ${esc(r.codeName)}</p>
          <p><b>Date/time:</b> ${esc(r.dateTime)}</p>
        </div>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
     body { font-family: Arial, sans-serif; margin: 0; color: #222; }

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.client {
  text-align: center;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  break-inside: avoid;
}

.client img, .noimg {
    width: 100%;
    height: auto;
    max-height: none;
    object-fit: contain;
}
.noimg {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  color: #888;
  font-size: 12px;
}

h2 { margin: 8px 0 4px; font-size: 14px; }
p { margin: 2px 0; font-size: 11px; color: #444; word-break: break-word; }
    </style></head><body><div class="grid">${cards}</div></body></html>`;

    // Temp file avoids data: URL size limits when there are many images
    tmp = path.join(os.tmpdir(), `export-${Date.now()}.html`);
    fs.writeFileSync(tmp, html, 'utf8');

    win = new BrowserWindow({ show: false });
    await win.loadFile(tmp);
    const pdf = await win.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      margins: { marginType: 'default' },
    });

    fs.writeFileSync(saveResult.filePath, pdf);

    return { success: true, count: rows.length, path: saveResult.filePath };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  } finally {
    if (win && !win.isDestroyed()) win.destroy();
    if (tmp && fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
});