const { getSheetsService } = require('../config/sheets');
const { v4: uuidv4 } = require('uuid');

const getMaterials = async (user, sheetName) => {
    const sheets = await getSheetsService();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_MATERIAS;

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:I`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return []; // Only header or empty

    // Map rows to objects
    // Header: ID, Nombre, Unidad, Precio, Proveedor, Stock, Minimo, Fecha, Notas
    const materials = rows.slice(1).map(row => ({
        id: row[0],
        name: row[1],
        unit: row[2],
        price: parseFloat((row[3] || '0').replace(',', '.')),
        provider: row[4],
        stock: parseFloat((row[5] || '0').replace(',', '.')),
        minStock: parseFloat((row[6] || '0').replace(',', '.')),
        lastPurchase: row[7],
        notes: row[8]
    }));

    return materials;
};

const createMaterial = async (user, sheetName, materialData) => {
    const sheets = await getSheetsService();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_MATERIAS;

    // Validate inputs
    if (!materialData.name || !materialData.price) {
        throw new Error('Name and Price are required');
    }

    const newMaterial = [
        uuidv4(),
        materialData.name,
        materialData.unit || 'units',
        materialData.price,
        materialData.provider || '',
        materialData.stock || 0,
        materialData.minStock || 0,
        new Date().toISOString().split('T')[0], // YYYY-MM-DD
        materialData.notes || ''
    ];

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'RAW',
        resource: { values: [newMaterial] }
    });

    return {
        id: newMaterial[0],
        name: newMaterial[1],
        price: newMaterial[3]
    };
};

const findRowIndex = async (sheets, spreadsheetId, sheetName, id) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:A`, // Optimized: read only IDs
    });
    const rows = response.data.values;
    if (!rows || rows.length === 0) return -1;

    // Find index (1-based sheet index)
    // rows[0] is header if it exists. row index 0 in array = sheet row 1.
    const index = rows.findIndex(row => row[0] === id);
    return index !== -1 ? index + 1 : -1;
};

const updateMaterial = async (user, sheetName, id, materialData) => {
    const sheets = await getSheetsService();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_MATERIAS;

    const rowIndex = await findRowIndex(sheets, spreadsheetId, sheetName, id);
    if (rowIndex === -1) throw new Error('Material not found');

    const updatedRow = [
        id,
        materialData.name,
        materialData.unit || 'units',
        materialData.price,
        materialData.provider || '',
        materialData.stock || 0,
        materialData.minStock || 0,
        new Date().toISOString().split('T')[0],
        materialData.notes || ''
    ];

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex}:I${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [updatedRow] }
    });

    return { id, ...materialData };
};

const deleteMaterial = async (user, sheetName, id) => {
    const sheets = await getSheetsService();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_MATERIAS;

    const rowIndex = await findRowIndex(sheets, spreadsheetId, sheetName, id);
    if (rowIndex === -1) throw new Error('Material not found');

    // Get sheetId to perform deleteDimension
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
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial
};
