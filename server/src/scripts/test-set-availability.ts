import axios from 'axios';
import logger from '../utils/logger';

const BASE_URL = 'http://localhost:9005/api';
const INSTRUCTOR_ID = 8; // instructor1@example.com

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

async function testSetAvailability() {
  try {
    // Get fresh token
    const token = await getToken();
    logger.info('Token obtained successfully');

    // Set availability for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    logger.info('Setting availability for:', dateStr);
    
    const response = await axios.post(
      `${BASE_URL}/instructors/${INSTRUCTOR_ID}/availability`,
      {
        date: dateStr,
        is_available: true
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    logger.info('Set availability response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    // Verify the availability was set
    const verifyResponse = await axios.get(
      `${BASE_URL}/instructors/${INSTRUCTOR_ID}/availability`,
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

testSetAvailability(); 