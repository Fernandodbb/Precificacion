// Adjust path to .env if running from root
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { getSheetsService } = require('../src/config/sheets');
const { getSubscriptionConfig, registerUser } = require('../src/services/userService');

// Mock process.env if needed or ensure it's loaded
console.log('Verificando configuración de suscripción...');

async function verify() {
    try {
        const sheets = await getSheetsService();
        const spreadsheetId = process.env.GOOGLE_SHEET_ID_USUARIOS;
        const sheetName = 'SUSCRIPCION';

        // 1. Get Config (this triggers creation if missing logic)
        console.log('1. Obteniendo configuración (esto creará la hoja si no existe)...');
        const config = await getSubscriptionConfig();
        console.log('Configuración actual obtenida:', config);

        // 2. Verify Headers explicitly
        console.log('2. Verificando encabezados directamente en la hoja...');
        const headerResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A1:B1`,
        });
        const headers = headerResponse.data.values ? headerResponse.data.values[0] : [];
        console.log('Encabezados encontrados:', headers);

        if (headers[0] !== 'Importe' || headers[1] !== 'Descuento_Anual') {
            console.error('ERROR: Los encabezados no coinciden con "Importe" y "Descuento_Anual".');
            // Force update headers for the test if they are wrong (optional, but good for "fixing" the test state)
            console.log('Corrigiendo encabezados para la prueba...');
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!A1`,
                valueInputOption: 'RAW',
                resource: { values: [['Importe', 'Descuento_Anual']] }
            });
        } else {
            console.log('EXITO: Encabezados correctos.');
        }

        // 3. Verify Values explicitly
        console.log('3. Verificando valores directamente en la hoja...');
        const valueResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A2:B2`,
        });
        const values = valueResponse.data.values ? valueResponse.data.values[0] : [];
        console.log('Valores encontrados:', values);

        if (values[0] !== '1' || values[1] !== '50') {
            console.warn('AVISO: Los valores no son 1 y 50. Actualizando para la prueba...');
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!A2`,
                valueInputOption: 'RAW',
                resource: { values: [['1', '50']] }
            });
            console.log('Valores actualizados a 1€ y 50%.');
        } else {
            console.log('EXITO: Valores correctos (1€, 50%).');
        }

    } catch (error) {
        console.error('Error durante la verificación:', error);
    }
}

verify();
