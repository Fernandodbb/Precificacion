const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        const user = await userService.registerUser({ email, password, name });

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
            startDate: user.startDate,
            endDate: user.endDate,
            token: generateToken(user.id),
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await userService.findUserByEmail(email);

        if (user && (await bcrypt.compare(password, user.password))) {
            // Check expiry and update if needed
            user = await userService.checkSubscriptionStatus(user);

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                status: user.status, // Subscription status
                startDate: user.startDate,
                endDate: user.endDate,
                tipo_suscripcion: user.tipo_suscripcion,
                precio_suscripcion: user.precio_suscripcion,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getMe = async (req, res) => {
    // Requires Auth Middleware to populate req.user
    res.status(200).json(req.user);
};

const updateSubscription = async (req, res) => {
    try {
        const { status, endDate } = req.body;
        const userId = req.user.id; // From authMiddleware

        const updatedUser = await userService.updateUserStatus(userId, status, endDate);

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error('Update Subscription Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateSubscription
};
