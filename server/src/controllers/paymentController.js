const paypalService = require('../services/paypalService');
const userService = require('../services/userService');

const createOrder = async (req, res) => {
    try {
        const { plan } = req.body; // 'mensual' or 'anual'
        // Define prices dynamically from config
        const config = await userService.getSubscriptionConfig();
        const basePrice = config.price;
        const discount = config.discount;

        let price;
        if (plan === 'anual') {
            const yearlyTotal = basePrice * 12;
            const discountedTotal = yearlyTotal * (1 - discount / 100);
            price = discountedTotal.toFixed(2);
        } else {
            price = basePrice.toFixed(2);
        }

        const order = await paypalService.createOrder(price);
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const captureOrder = async (req, res) => {
    const { orderID, plan } = req.body;
    try {
        const captureData = await paypalService.captureOrder(orderID);

        if (captureData.status === 'COMPLETED') {
            // Update User Subscription
            const userId = req.user.id;

            let newEndDate = new Date();
            // If user has active subscription, add to it? For now just reset from today.
            if (req.user.endDate && new Date(req.user.endDate) > new Date()) {
                newEndDate = new Date(req.user.endDate);
            }

            if (plan === 'anual') {
                newEndDate.setFullYear(newEndDate.getFullYear() + 1);
            } else {
                newEndDate.setMonth(newEndDate.getMonth() + 1);
            }

            // Recalculate amount for record keeping
            const config = await userService.getSubscriptionConfig();
            const basePrice = config.price;
            const discount = config.discount;
            let amountStr;

            if (plan === 'anual') {
                const yearlyTotal = basePrice * 12;
                const discountedTotal = yearlyTotal * (1 - discount / 100);
                amountStr = discountedTotal.toFixed(2);
            } else {
                amountStr = basePrice.toFixed(2);
            }

            const updatedUser = await userService.updateUserStatus(userId, 'activo', newEndDate.toISOString(), plan, amountStr);
            res.json({ ...captureData, user: updatedUser });
        } else {
            res.status(400).json({ message: 'Payment not completed', details: captureData });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const getConfig = async (req, res) => {
    const config = await userService.getSubscriptionConfig();
    res.json({
        clientId: process.env.PAYPAL_CLIENT_ID,
        price: config.price,
        discount: config.discount
    });
};

module.exports = {
    createOrder,
    captureOrder,
    getConfig
};
