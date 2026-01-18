const express = require('express');
const router = express.Router();
const { protect, checkSubscription } = require('../middleware/authMiddleware');
const geminiService = require('../services/geminiService');

router.post('/chat', protect, checkSubscription, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const reply = await geminiService.chatWithGemini(req.user, message);
        res.json({ reply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing chat request' });
    }
});

module.exports = router;
