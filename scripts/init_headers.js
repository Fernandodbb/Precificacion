const { google } = require('googleapis');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const CREDENTIALS_PATH = path.join(__dirname, '../server/credentials.json');

if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ Error: credentials.json not found in server directory.');
    process.exit(1);
}

const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const setupHeaders = async (spreadsheetId, sheetName, headers) => {
    try {
        console.log(`Setting headers for Spreadsheet: ${spreadsheetId}...`);
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `A1`, // Implicitly targets the first sheet
            valueInputOption: 'RAW',
            resource: {
                values: [headers]
            }
        });
        console.log(`✅ Headers set successfully.`);
    } catch (err) {
        console.error(`❌ Failed to set headers for ${spreadsheetId}:`, err.message);
        console.error('   Make sure you shared the sheet with the Service Account email as Editor.');
    }
}

const main = async () => {
    console.log('🚀 Initializing Headers for Manual Sheets...');

    const usersId = process.env.GOOGLE_SHEET_ID_USUARIOS;
    const productsId = process.env.GOOGLE_SHEET_ID_PRODUCTOS;
    const materialsId = process.env.GOOGLE_SHEET_ID_MATERIAS;
    const accountingId = process.env.GOOGLE_SHEET_ID_CONTABILIDAD;

    // Headers Definition
    const userHeaders = [
        'ID_Usuario', 'Email', 'Password_Hash', 'Nombre', 'Fecha_Registro',
        'Estado_Suscripcion', 'Fecha_Inicio_Suscripcion', 'Fecha_Fin_Suscripcion',
        'Rol', 'Nombre_Hoja_Productos', 'Nombre_Hoja_Materias', 'Nombre_Hoja_Contabilidad'
    ];
    // Note: Products, Materials, and Accounting are "Sheet-per-user" systems.
    // The "DB" spreadsheets themselves don't strictly need headers on the default Sheet1, 
    // but we can put a placeholder so it's not empty.

    // 1. USUARIOS (Sheet1)
    await setupHeaders(usersId, null, userHeaders);

    console.log('ℹ️  Note: For Products, Materials, and Accounting, headers are created dynamically when a new User is registered.');
    console.log('✨ Header Initialization Complete!');
};

main();
