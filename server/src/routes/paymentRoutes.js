const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/config', paymentController.getConfig);
router.post('/create-order', protect, paymentController.createOrder);
router.post('/capture-order', protect, paymentController.captureOrder);

module.exports = router;
