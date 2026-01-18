const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { google } = require('googleapis');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Routes
const authRoutes = require('./routes/authRoutes');
const appRoutes = require('./routes/appRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/users', authRoutes);
app.use('/api/app', appRoutes);
app.use('/api/ai', chatRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Cost/Price Management API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
