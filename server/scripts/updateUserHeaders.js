require('dotenv').config({ path: '../.env' }); // Adjust path to .env if running from scripts folder
const { getSheetsService } = require('../src/config/sheets');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('Actualizando encabezados de USUARIOS...');

async function updateHeaders() {
    try {
        const sheets = await getSheetsService();
        const spreadsheetId = process.env.GOOGLE_SHEET_ID_USUARIOS;

        // We need to find the main sheet name. Usually the first one.
        const metadata = await sheets.spreadsheets.get({
            spreadsheetId,
            fields: 'sheets.properties.title'
        });
        const sheetName = metadata.data.sheets[0].properties.title;

        console.log(`Usando hoja: ${sheetName}`);

        // Update M1 and N1
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!M1:N1`,
            valueInputOption: 'RAW',
            resource: { values: [['Tipo_Suscripcion', 'Precio_suscripcion']] }
        });

        console.log('EXITO: Encabezados actualizados a Tipo_Suscripcion y Precio_suscripcion.');

    } catch (error) {
        console.error('Error actualizando encabezados:', error);
    }
}

updateHeaders();
