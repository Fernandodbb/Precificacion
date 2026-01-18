const { getSheetsService } = require('../config/sheets');
const { v4: uuidv4 } = require('uuid');

const getAccountingRecords = async (user, sheetName) => {
    const sheets = await getSheetsService();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_CONTABILIDAD;

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:K`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return [];

    // Header: ID, Fecha, Concepto, Tipo, Categoria, Rel_ID, Importe, Metodo, Notas, URL, Coste_MP
    const records = rows.slice(1).map(row => ({
        id: row[0],
        date: row[1],
        concept: row[2],
        type: row[3], // ingreso / gasto
        category: row[4],
        relatedId: row[5],
        amount: parseFloat((row[6] || '0').replace(',', '.')),
        paymentMethod: row[7],
        notes: row[8],
        invoiceUrl: row[9],
        materialCost: parseFloat((row[10] || '0').replace(',', '.'))
    }));

    return records;
};

const createAccountingRecord = async (user, sheetName, recordData) => {
    const sheets = await getSheetsService();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_CONTABILIDAD;

    const { date, concept, type, category, relatedId, amount, paymentMethod, notes, invoiceUrl, materialCost } = recordData;

    const newRecord = [
        uuidv4(),
        date || new Date().toISOString().split('T')[0],
        concept,
        type,
        category,
        relatedId || '',
        amount,
        paymentMethod || '',
        notes || '',
        invoiceUrl || '',
        materialCost || 0
    ];

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'RAW',
        resource: { values: [newRecord] }
    });

    return {
        id: newRecord[0],
        concept: newRecord[2],
        amount: newRecord[6],
        materialCost: newRecord[10]
    };
};

const findRowIndex = async (sheets, spreadsheetId, sheetName, id) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:A`,
    });
    const rows = response.data.values;
    if (!rows || rows.length === 0) return -1;
    const index = rows.findIndex(row => row[0] === id);
    return index !== -1 ? index + 1 : -1;
};

const updateAccountingRecord = async (user, sheetName, id, recordData) => {
    const sheets = await getSheetsService();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_CONTABILIDAD;

    const rowIndex = await findRowIndex(sheets, spreadsheetId, sheetName, id);
    if (rowIndex === -1) throw new Error('Record not found');

    const { date, concept, type, category, relatedId, amount, paymentMethod, notes, invoiceUrl, materialCost } = recordData;

    const updatedRow = [
        id,
        date,
        concept,
        type,
        category,
        relatedId || '',
        amount,
        paymentMethod || '',
        notes || '',
        invoiceUrl || '',
        materialCost || 0
    ];

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex}:K${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [updatedRow] }
    });

    return { id, ...recordData };
};

const deleteAccountingRecord = async (user, sheetName, id) => {
    const sheets = await getSheetsService();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_CONTABILIDAD;

    const rowIndex = await findRowIndex(sheets, spreadsheetId, sheetName, id);
    if (rowIndex === -1) throw new Error('Record not found');

    const sheetMetadata = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetObj = sheetMetadata.data.sheets.find(s => s.properties.title === sheetName);
    if (!sheetObj) throw new Error('Sheet not found');
    const sheetId = sheetObj.properties.sheetId;

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: sheetId,
                        dimension: "ROWS",
                        startIndex: rowIndex - 1,
                        endIndex: rowIndex
                    }
                }
            }]
        }
    });

    return { success: true };
};

module.exports = {
    getAccountingRecords,
    createAccountingRecord,
    updateAccountingRecord,
    deleteAccountingRecord
};
