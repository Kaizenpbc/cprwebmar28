import axios from 'axios';
import logger from '../utils/logger';

const BASE_URL = 'http://localhost:9005/api';

async function getToken() {
  try {
    logger.info('Getting fresh token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'instructor1@example.com',
      password: 'password123',
      portal: 'instructor'
    });

    logger.info('Login response:', {
      status: loginResponse.status,
      statusText: loginResponse.statusText,
      data: loginResponse.data
    });

    return loginResponse.data.token;
  } catch (error) {
    logger.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testClientAvailability() {
  try {
    // Get fresh token
    const token = await getToken();
    logger.info('Token obtained successfully');

    // First, get current availability
    logger.info('Fetching current availability...');
    const getResponse = await axios.get(
      `${BASE_URL}/instructor/availability`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    logger.info('Current availability:', {
      status: getResponse.status,
      statusText: getResponse.statusText,
      data: getResponse.data
    });

    // Set availability for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    logger.info('Setting availability for:', dateStr);
    
    const setResponse = await axios.post(
      `${BASE_URL}/instructor/availability`,
      {
        date: dateStr
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info('Set availability response:', {
      status: setResponse.status,
      statusText: setResponse.statusText,
      data: setResponse.data
    });

    // Verify the availability was set
    const verifyResponse = await axios.get(
      `${BASE_URL}/instructor/availability`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    logger.info('Verification response:', {
      status: verifyResponse.status,
      statusText: verifyResponse.statusText,
      data: verifyResponse.data
    });

  } catch (error) {
    logger.error('Error:', error.response?.data || error.message);
  }
}

testClientAvailability(); 