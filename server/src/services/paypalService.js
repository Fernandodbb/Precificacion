const axios = require('axios');

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_URL } = process.env;

const getAccessToken = async () => {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        console.error('MISSING PAYPAL CREDENTIALS IN ENV');
        throw new Error('Missing PayPal Credentials');
    }

    console.log('Attempting to get PayPal Access Token with Client ID starting with:', PAYPAL_CLIENT_ID.substring(0, 5) + '...');

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID.trim()}:${PAYPAL_CLIENT_SECRET.trim()}`).toString('base64');
    try {
        const response = await axios.post(`${PAYPAL_API_URL}/v1/oauth2/token`, 'grant_type=client_credentials', {
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        console.log('PayPal Token Generated Successfully');
        return response.data.access_token;
    } catch (error) {
        console.error('Error generating PayPal Access Token:', error.response?.data || error.message);
        console.error('Full Error:', error);
        throw new Error('Failed to generate PayPal Access Token');
    }
};

const createOrder = async (amount) => {
    const accessToken = await getAccessToken();
    try {
        const response = await axios.post(
            `${PAYPAL_API_URL}/v2/checkout/orders`,
            {
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: 'EUR',
                            value: amount.toString(),
                        },
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating PayPal Order:', error.response?.data || error.message);
        throw new Error('Failed to create PayPal Order');
    }
};

const captureOrder = async (orderId) => {
    const accessToken = await getAccessToken();
    try {
        const response = await axios.post(
            `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error capturing PayPal Order:', error.response?.data || error.message);
        throw new Error('Failed to capture PayPal Order');
    }
};

module.exports = {
    createOrder,
    captureOrder
};
