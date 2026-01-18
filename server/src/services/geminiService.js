const { getGeminiModel } = require('../config/gemini');
const productService = require('./productService');
const materialService = require('./materialService');
const accountingService = require('./accountingService');

const SYSTEM_PROMPT = `
Eres un asistente experto en gestión de costes y precios para una aplicación web.
Tu objetivo es ayudar al usuario a gestionar sus productos, materias primas y contabilidad.
TIENES ACCESO EXCLUSIVO A LOS DATOS DEL USUARIO ACTUAL. NO PUEDES VER DATOS DE OTROS.

REGLAS ESTRICTAS:
1. Solo respondes preguntas sobre los datos proporcionados en el contexto. sI TE PREGUNTAN POR DATOS DE OTROS USUARIOS, DÍ QUE SOLO PUEDES VER LOS SUYOS.
2. Si el usuario quiere ejecutar una acción (crear, borrar), CONFIRMA primero los detalles y genera una respuesta estructurada que la UI pueda entender (por ahora solo responde en texto indicando qué herramienta usaría si tuviera tools, pero actúa como consultor).
3. Si el usuario intenta crear un producto pero NO tiene materias primas, indícale amablemente que primero debe registrar materias primas.
4. Sé conciso y profesional.

CONTEXTO DE DATOS DE ESTE USUARIO:
`;

const chatWithGemini = async (user, message) => {
    const model = getGeminiModel();
    if (!model) {
        return "El servicio de IA no está configurado correctamente (Falta API Key).";
    }

    // 1. Gather User Context (RAG - Retrieval Augmented Generation lite)
    // We fetch their data to inject into the prompt.
    // Warning: Context window limits apply. For MVP we inject everything, for Prod we'd need vector search.

    const [products, materials, accounting] = await Promise.all([
        productService.getProducts(user, user.productsSheetName),
        materialService.getMaterials(user, user.materialsSheetName),
        accountingService.getAccountingRecords(user, user.accountingSheetName)
    ]);

    const userContext = JSON.stringify({
        products: products.map(p => ({ name: p.name, pvp: p.pvp, materials: p.materials })),
        materials: materials.map(m => ({ name: m.name, price: m.price, stock: m.stock })),
        accounting_summary: {
            total_records: accounting.length,
            // We could calculate balance here
        }
    });

    const prompt = `${SYSTEM_PROMPT}\n\nDATOS DEL USUARIO:\n${userContext}\n\nPREGUNTA DEL USUARIO: "${message}"`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Error:', error);
        return "Lo siento, tuve un problema procesando tu solicitud. Por favor intenta de nuevo.";
    }
};

module.exports = {
    chatWithGemini
};
