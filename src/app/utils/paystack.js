// paystack.js
const axios = require('axios');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

/**
 * Initialize Paystack Transaction
 */
async function initializePayment(email, amount) {
  const url = 'https://api.paystack.co/transaction/initialize';

  const data = {
    email: email,
    amount: amount * 100, // Paystack expects amount in kobo (for NGN)
    callback_url: process.env.PAYSTACK_CALLBACK_URL
  };

  const config = {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    }
  };

  try {
    const response = await axios.post(url, data, config);
    return response.data; // Paystack responds with authorization_url, access_code, etc.
  } catch (error) {
    console.error('Error initializing Paystack payment:', error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = { loadPaystack };
