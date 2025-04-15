const axios = require('axios');
require('dotenv').config();

let accessToken = '';

async function getAccessToken() {
  try {
    const response = await axios.post('https://api.artsy.net/api/tokens/xapp_token', {
      client_id: process.env.ARTSY_CLIENT_ID,
      client_secret: process.env.ARTSY_CLIENT_SECRET,
    });
    accessToken = response.data.token;
    return accessToken;
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw error;
  }
}

function getCurrentToken() {
  return accessToken;
}

module.exports = {
  getAccessToken,
  getCurrentToken
};