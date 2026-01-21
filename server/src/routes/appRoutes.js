const express = require('express');
const router = express.Router();
const { protect, checkSubscription } = require('../middleware/authMiddleware');
const productService = require('../services/productService');
const materialService = require('../services/materialService');
const accountingService = require('../services/accountingService');
const dashboardController = require('../controllers/dashboardController');

// -- DASHBOARD --
router.get('/dashboard', protect, dashboardController.getDashboardStats);

// -- PRODUCTS --
router.get('/products', protect, checkSubscription, async (req, res) => {
    try {
        const products = await productService.getProducts(req.user, req.user.productsSheetName);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/products', protect, checkSubscription, async (req, res) => {
    try {
        const product = await productService.createProduct(
            req.user,
            req.user.productsSheetName,
            req.user.materialsSheetName,
            req.body
        );
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/products/:id', protect, checkSubscription, async (req, res) => {
    try {
        const product = await productService.updateProduct(
            req.user,
            req.user.productsSheetName,
            req.user.materialsSheetName,
            req.params.id,
            req.body
        );
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/products/:id', protect, checkSubscription, async (req, res) => {
    try {
        await productService.deleteProduct(req.user, req.user.productsSheetName, req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// -- MATERIALS --
router.get('/materials', protect, checkSubscription, async (req, res) => {
    try {
        const materials = await materialService.getMaterials(req.user, req.user.materialsSheetName);
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/materials', protect, checkSubscription, async (req, res) => {
    try {
        const material = await materialService.createMaterial(req.user, req.user.materialsSheetName, req.body);
        res.status(201).json(material);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/materials/:id', protect, checkSubscription, async (req, res) => {
    try {
        const material = await materialService.updateMaterial(req.user, req.user.materialsSheetName, req.params.id, req.body);
        res.json(material);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/materials/:id', protect, checkSubscription, async (req, res) => {
    try {
        await materialService.deleteMaterial(req.user, req.user.materialsSheetName, req.params.id);
        res.json({ message: 'Material deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// -- ACCOUNTING --
router.get('/accounting', protect, checkSubscription, async (req, res) => {
    try {
        const records = await accountingService.getAccountingRecords(req.user, req.user.accountingSheetName);
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/accounting', protect, checkSubscription, async (req, res) => {
    try {
        const record = await accountingService.createAccountingRecord(req.user, req.user.accountingSheetName, req.body);
        res.status(201).json(record);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/accounting/:id', protect, checkSubscription, async (req, res) => {
    try {
        const record = await accountingService.updateAccountingRecord(req.user, req.user.accountingSheetName, req.params.id, req.body);
        res.json(record);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/accounting/:id', protect, checkSubscription, async (req, res) => {
    try {
        await accountingService.deleteAccountingRecord(req.user, req.user.accountingSheetName, req.params.id);
        res.json({ message: 'Record deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
