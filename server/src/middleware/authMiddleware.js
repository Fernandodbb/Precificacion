const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await userService.findUserById(decoded.id);

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const checkSubscription = (req, res, next) => {
    // Allows 'active' and 'prueba'
    // Blocks 'vencido', 'inactivo'
    const validStatuses = ['activo', 'prueba'];

    if (req.user && !validStatuses.includes(req.user.status)) {
        return res.status(403).json({
            message: 'Subscription expired or inactive',
            code: 'ERROR_SUB_001',
            status: req.user.status
        });
    }
    next();
};

module.exports = { protect, checkSubscription };
