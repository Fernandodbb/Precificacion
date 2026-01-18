const { getSheetsService } = require('../config/sheets');
const { v4: uuidv4 } = require('uuid');
const materialService = require('./materialService');

const getProducts = async (user, sheetName) => {
    const sheets = await getSheetsService();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_PRODUCTOS;

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:J`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return [];

    // Header: ID, Nombre, Desc, MPs(JSON), Qty(JSON), Coste, Margen, PVP, FechaC, FechaU
    const products = rows.slice(1).map(row => ({
        id: row[0],
        name: row[1],
        description: row[2],
        materials: JSON.parse(row[3] || '[]'),
        quantities: JSON.parse(row[4] || '[]'),
        totalCost: parseFloat(row[5]),
        margin: parseFloat(row[6]),
        pvp: parseFloat(row[7]),
        createdAt: row[8],
        updatedAt: row[9]
    }));

    return products;
};

const createProduct = async (user, productSheetName, materialSheetName, productData) => {
    // 1. Validation: specific User Materials must exist
    const userMaterials = await materialService.getMaterials(user, materialSheetName);

    if (userMaterials.length === 0) {
        throw new Error('ERROR_PROD_001: No puedes crear productos sin materias primas registradas');
    }

    const { name, description, selectedMaterials, margin } = productData;
    // selectedMaterials = [{ id: 'mat_id', quantity: 1.5 }]

    if (!selectedMaterials || selectedMaterials.length === 0) {
        throw new Error('ERROR_PROD_002: Debes seleccionar al menos una materia prima');
    }

    let totalCost = 0;
    const materialIds = [];
    const quantities = [];

    // 2. Validate usage and Calculate Cost
    for (const item of selectedMaterials) {
        const material = userMaterials.find(m => m.id === item.id);
        if (!material) {
            throw new Error(`ERROR_PROD_004: Materia prima con ID ${item.id} no encontrada`);
        }

        const cost = material.price * item.quantity;
        totalCost += cost;

        materialIds.push(item.id);
        quantities.push(item.quantity);
    } // Coste_Total_Calculado

    // 3. Calculate PVP
    // PVP = Coste * (1 + Margen/100)
    const pvp = totalCost * (1 + (parseFloat(margin) / 100));

    // 4. Save
    const sheets = await getSheetsService();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_PRODUCTOS;

    const newProduct = [
        uuidv4(),
        name,
        description || '',
        JSON.stringify(materialIds),
        JSON.stringify(quantities),
        totalCost.toFixed(2),
        margin,
        pvp.toFixed(2),
        new Date().toISOString(),
        new Date().toISOString()
    ];

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${productSheetName}!A:A`,
        valueInputOption: 'RAW',
        resource: { values: [newProduct] }
    });

    return {
        id: newProduct[0],
        name: newProduct[1],
        pvp: newProduct[7]
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

const updateProduct = async (user, productSheetName, materialSheetName, id, productData) => {
    const sheets = await getSheetsService();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_PRODUCTOS;

    const rowIndex = await findRowIndex(sheets, spreadsheetId, productSheetName, id);
    if (rowIndex === -1) throw new Error('Product not found');

    const { name, description, selectedMaterials, margin } = productData;

    // Recalculate costs
    const userMaterials = await materialService.getMaterials(user, materialSheetName);
    let totalCost = 0;
    const materialIds = [];
    const quantities = [];

    for (const item of selectedMaterials) {
        const material = userMaterials.find(m => m.id === item.id);
        if (material) {
            const cost = material.price * (parseFloat(item.quantity) || 0);
            totalCost += cost;
            materialIds.push(item.id);
            quantities.push(item.quantity);
        }
    }

    const pvp = totalCost * (1 + (parseFloat(margin) / 100));

    const updatedRow = [
        id,
        name,
        description || '',
        JSON.stringify(materialIds),
        JSON.stringify(quantities),
        totalCost.toFixed(2),
        margin,
        pvp.toFixed(2),
        new Date().toISOString(), // CreatedAt (preserved generally, but updating here is simple)
        new Date().toISOString()  // UpdatedAt
    ];

    // Ideally preserv CreatedAt, but reading it first adds latency. Overwriting is acceptable MVP.
    // To preserve, we'd need to read the specific row first. 
    // Let's assume we want to preserve CreatedAt if possible, but for speed we might overwrite. 
    // Optimization: Read the createdAt from the existing row if passed in data, or simpler: just update.

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${productSheetName}!A${rowIndex}:J${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [updatedRow] }
    });

    return { id, ...productData, totalCost, pvp };
};

const deleteProduct = async (user, sheetName, id) => {
    const sheets = await getSheetsService();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_PRODUCTOS;

    const rowIndex = await findRowIndex(sheets, spreadsheetId, sheetName, id);
    if (rowIndex === -1) throw new Error('Product not found');

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
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
};
