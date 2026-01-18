const { getSheetsService } = require('../config/sheets');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const USERS_SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID_USUARIOS;
const PRODUCTS_SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID_PRODUCTOS;
const MATERIALS_SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID_MATERIAS;
const ACCOUNTING_SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID_CONTABILIDAD;

// Helper to create a new sheet for a user in a specific spreadsheet
const createUserSheet = async (sheets, spreadsheetId, title) => {
    try {
        const response = await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: title,
                            },
                        },
                    },
                ],
            },
        });
        return response.data.replies[0].addSheet.properties.sheetId;
    } catch (error) {
        console.error(`Error creating sheet ${title} in ${spreadsheetId}:`, error.message);
        throw error;
    }
};

const setupSheetHeaders = async (sheets, spreadsheetId, sheetName, headers) => {
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: { values: [headers] }
    });
};

// Helper to get the first sheet name dynamically
const getFirstSheetName = async (sheets, spreadsheetId) => {
    try {
        const metadata = await sheets.spreadsheets.get({
            spreadsheetId,
            fields: 'sheets.properties.title'
        });
        return metadata.data.sheets[0].properties.title;
    } catch (error) {
        console.error(`Error fetching sheet name for ${spreadsheetId}:`, error.message);
        return 'Sheet1'; // Fallback
    }
};

const findUserByEmail = async (email) => {
    const sheets = await getSheetsService();
    const sheetName = await getFirstSheetName(sheets, process.env.GOOGLE_SHEET_ID_USUARIOS);

    // Assume Sheet1 is the main list. We need to fetch all data.
    // Warning: For large datasets this is inefficient, but for a prototype it's fine.
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID_USUARIOS,
        range: `${sheetName}!A:L`, // Columns A to L
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return null;

    // Skip header
    const headers = rows[0];
    const data = rows.slice(1);

    const userRow = data.find(row => row[1] === email); // Email is column Index 1
    if (!userRow) return null;

    return {
        id: userRow[0],
        email: userRow[1],
        password: userRow[2],
        name: userRow[3],
        status: userRow[5],
        role: userRow[8],
        productsWaitId: userRow[9], // Note: This might be saved as SheetName or SheetID. Plan says "Reference ID".
        materialsWaitId: userRow[10],
        accountingWaitId: userRow[11]
    };
};

const findUserById = async (id) => {
    const sheets = await getSheetsService();
    const sheetName = await getFirstSheetName(sheets, process.env.GOOGLE_SHEET_ID_USUARIOS);

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID_USUARIOS,
        range: `${sheetName}!A:L`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return null;

    // Skip header
    const data = rows.slice(1);
    const userRow = data.find(row => row[0] === id); // ID is column Index 0

    if (!userRow) return null;

    return {
        id: userRow[0],
        email: userRow[1],
        password: userRow[2],
        name: userRow[3],
        status: userRow[5],
        role: userRow[8],
        productsSheetName: userRow[9],
        materialsSheetName: userRow[10],
        accountingSheetName: userRow[11]
    };
};

const registerUser = async (userData) => {
    const { email, password, name } = userData;
    const sheets = await getSheetsService();

    // 1. Check if user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw new Error('Email already registered');
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Generate IDs and Dates
    const userId = uuidv4();
    const registerDate = new Date().toISOString();
    const startDate = new Date().toISOString();
    // 14 days trial ?
    const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    // 4. Create User Specific Sheets
    const sheetName = `Usuario_${userId}`;

    // Create in Products DB
    await createUserSheet(sheets, process.env.GOOGLE_SHEET_ID_PRODUCTOS, sheetName);
    await setupSheetHeaders(sheets, process.env.GOOGLE_SHEET_ID_PRODUCTOS, sheetName, [
        'ID_Producto', 'Nombre_Producto', 'Descripción', 'Materias_Primas_Usadas',
        'Cantidades_Usadas', 'Coste_Total_Calculado', 'Margen_Beneficio_Porcentaje',
        'PVP_Calculado', 'Fecha_Creacion', 'Fecha_Actualizacion'
    ]);

    // Create in Materials DB
    await createUserSheet(sheets, process.env.GOOGLE_SHEET_ID_MATERIAS, sheetName);
    await setupSheetHeaders(sheets, process.env.GOOGLE_SHEET_ID_MATERIAS, sheetName, [
        'ID_Materia_Prima', 'Nombre', 'Unidad_Medida', 'Precio_Por_Unidad',
        'Proveedor', 'Stock_Actual', 'Stock_Minimo', 'Fecha_Ultima_Compra', 'Notas'
    ]);

    // Create in Accounting DB
    await createUserSheet(sheets, process.env.GOOGLE_SHEET_ID_CONTABILIDAD, sheetName);
    await setupSheetHeaders(sheets, process.env.GOOGLE_SHEET_ID_CONTABILIDAD, sheetName, [
        'ID_Registro', 'Fecha', 'Concepto', 'Tipo', 'Categoria',
        'Producto_Relacionado_ID', 'Importe', 'Metodo_Pago', 'Notas', 'Factura_URL'
    ]);

    // 5. Save to USUARIOS Sheet
    const newRow = [
        userId, email, passwordHash, name, registerDate,
        'prueba', startDate, endDate, 'usuario',
        sheetName, sheetName, sheetName // Saving the Sheet Name as reference
    ];

    // Get dynamic sheet name for append
    const mainSheetName = await getFirstSheetName(sheets, process.env.GOOGLE_SHEET_ID_USUARIOS);

    await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID_USUARIOS,
        range: `${mainSheetName}!A:A`,
        valueInputOption: 'RAW',
        resource: { values: [newRow] }
    });

    return { id: userId, email, name, status: 'prueba' };
};

module.exports = {
    findUserByEmail,
    findUserById,
    registerUser
};
