const { google } = require('googleapis');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Load credentials
const CREDENTIALS_PATH = path.join(__dirname, '../server/credentials.json');
const ENV_PATH = path.join(__dirname, '../server/.env');

if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ Error: credentials.json not found in server directory.');
    console.error('Please place your Google Cloud Service Account credentials in server/credentials.json');
    process.exit(1);
}

const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const createSpreadsheet = async (title) => {
    try {
        const resource = {
            properties: {
                title,
            },
        };
        const spreadsheet = await sheets.spreadsheets.create({
            resource,
            fields: 'spreadsheetId',
        });
        console.log(`✅ Created "${title}" with ID: ${spreadsheet.data.spreadsheetId}`);
        return spreadsheet.data.spreadsheetId;
    } catch (err) {
        console.error(`❌ Failed to create "${title}":`, err.message);
        throw err;
    }
};

const setupHeaders = async (spreadsheetId, sheetName, headers) => {
    // This is a placeholder. In reality, we would create a specific sheet or update the first one.
    // For now, we assume the default sheet "Sheet1" exists or we create a new one.
    // We will just update 'Sheet1' for simplicity as the prompt says "Spreadsheet USUARIOS (un solo archivo, una sola hoja)".
    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Sheet1!A1',
            valueInputOption: 'RAW',
            resource: {
                values: [headers]
            }
        });
        console.log(`   Headers set for ${sheetName}`);
    } catch (err) {
        console.error(`   Failed to set headers for ${spreadsheetId}:`, err.message);
    }
}

const main = async () => {
    console.log('🚀 Starting Google Sheets Initialization...');
    console.log(' Using credentials from:', CREDENTIALS_PATH);

    try {
        // 1. USUARIOS
        const usersId = await createSpreadsheet('APP_USUARIOS');
        await setupHeaders(usersId, 'Sheet1', [
            'ID_Usuario', 'Email', 'Password_Hash', 'Nombre', 'Fecha_Registro',
            'Estado_Suscripcion', 'Fecha_Inicio_Suscripcion', 'Fecha_Fin_Suscripcion',
            'Rol', 'ID_Hoja_Productos', 'ID_Hoja_Materias_Primas', 'ID_Hoja_Contabilidad'
        ]);

        // 2. PRODUCTOS (Template or Container)
        // The prompt says "Spreadsheet PRODUCTOS (un solo archivo, múltiples hojas)".
        // So we create one Spreadsheet to hold all user sheets.
        const productsId = await createSpreadsheet('APP_PRODUCTOS_DB');

        // 3. MATERIAS PRIMAS
        const materialsId = await createSpreadsheet('APP_MATERIAS_PRIMAS_DB');

        // 4. CONTABILIDAD
        const accountingId = await createSpreadsheet('APP_CONTABILIDAD_DB');

        console.log('\n✨ Initialization Complete!\n');
        console.log('PLEASE SAVE THESE IDs IN YOUR .env FILE:');
        console.log('----------------------------------------');
        console.log(`GOOGLE_SHEET_ID_USUARIOS=${usersId}`);
        console.log(`GOOGLE_SHEET_ID_PRODUCTOS=${productsId}`);
        console.log(`GOOGLE_SHEET_ID_MATERIAS=${materialsId}`);
        console.log(`GOOGLE_SHEET_ID_CONTABILIDAD=${accountingId}`);
        console.log('----------------------------------------');

        // Optional: Append to .env automatically
        // ...

    } catch (error) {
        console.error('Fatal Error:', error);
    }
};

main();
