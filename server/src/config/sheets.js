const { google } = require('googleapis');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Function to authenticate using service account
const getAuth = () => {
    // Option 1: Env Var (Best for Production/Render/Railway)
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
        try {
            const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
            return new google.auth.GoogleAuth({
                credentials,
                scopes: SCOPES,
            });
        } catch (error) {
            console.error('Error parsing GOOGLE_CREDENTIALS_JSON:', error);
        }
    }

    // Option 2: Local File (Best for Development)
    const credentialsPath = path.join(__dirname, '../../credentials.json');
    try {
        return new google.auth.GoogleAuth({
            keyFile: credentialsPath,
            scopes: SCOPES,
        });
    } catch (error) {
        console.error('Error loading credentials.json:', error.message);
        throw new Error('Could not load credentials. Set GOOGLE_CREDENTIALS_JSON env var or place credentials.json in server root.');
    }
};

const getSheetsService = async () => {
    const auth = getAuth();
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    return sheets;
};

module.exports = {
    getAuth,
    getSheetsService
};
