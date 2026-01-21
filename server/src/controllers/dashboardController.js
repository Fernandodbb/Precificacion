const { getSheetsService } = require('../config/sheets');

const getDashboardStats = async (req, res) => {
    try {
        const sheets = await getSheetsService();
        // Assuming user has access to their own 'Accounting' sheet. 
        // We actually need the Sheet Name which is stored in the User Record. 
        // Req.user should have it if we update authMiddleware, OR we re-fetch user.
        // For efficiency, let's assume req.user is populated with enough info OR we query by User ID.
        // authMiddleware populates req.user with the DB record from findUserById/Email usually.
        // Let's verify authMiddleware content.

        // However, we can also use the general accounting sheet ID and search for the specific sheet name of the user.
        // User's accounting sheet name is usually `Usuario_${userId}`.

        const userId = req.user.id;
        const sheetName = `Usuario_${userId}`;

        // Fetch Accounting Data (Ingresos y Gastos)
        const accountingResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID_CONTABILIDAD,
            range: `${sheetName}!A:G`, // Fetch enough columns (Date, Type, Amount, etc.)
        });

        const rows = accountingResponse.data.values;
        // Headers: ID, Fecha, Concepto, Tipo, Categoria, Producto_Relacionado_ID, Importe
        // Indexes: 0   1      2         3     4          5                        6

        // Filter for Current Month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let totalIncome = 0;
        let totalExpenses = 0;
        let productsSold = 0;

        if (rows && rows.length > 1) {
            const data = rows.slice(1);
            data.forEach(row => {
                const dateStr = row[1]; // YYYY-MM-DD
                if (!dateStr) return;
                const date = new Date(dateStr);

                if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                    const type = row[3]?.toLowerCase();
                    const amount = parseFloat(row[6]) || 0;

                    if (type === 'ingreso') {
                        totalIncome += amount;
                        // Count product sales (Assumption: Type 'ingreso' + Category 'Ventas' or just 'ingreso' depending on logic)
                        // User said "productos vendidos en el mes".
                        // Usually linked to "Ventas".
                        if (row[4] === 'Ventas' || row[5]) { // If Category is Ventas OR has Related Product ID
                            productsSold++;
                        }
                    } else if (type === 'gasto') {
                        totalExpenses += amount;
                    }
                }
            });
        }

        const balance = totalIncome; // "balance del mes la suma de los productos vendidos" -> User meant REVENUE from sales? Or Balance = Income - Expenses?
        // User said: "balance del mes la suma de los productos vendidos durante el mes en curso" -> interpreting as Total Revenue (Sales)
        // But usually Balance means Net.
        // Let's stick to user request: "Balance del Mes" = Sum of Products Sold (Revenue).
        // Wait, "Rentabilidad el % de beneficio del mes en curso teniendo en cuenta todos los costes".

        let profitability = 0;
        if (totalExpenses > 0) {
            profitability = ((totalIncome - totalExpenses) / totalExpenses) * 100;
        }

        res.json({
            productsSold,
            balanceMonth: totalIncome, // displaying Gross Revenue as "Balance" per specific user text? Or maybe they meant Net Balance? "suma de los productos vendidos" suggests Revenue.
            profitability: profitability.toFixed(2)
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error retrieving stats' });
    }
};

module.exports = { getDashboardStats };
