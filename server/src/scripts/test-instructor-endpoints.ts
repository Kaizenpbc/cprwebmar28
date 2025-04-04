import axios from 'axios';
import logger from '../utils/logger';

const BASE_URL = 'http://localhost:9005/api';

async function getToken() {
  try {
    logger.info('Attempting to login with credentials:', {
      email: 'instructor1@example.com',
      portal: 'instructor'
    });

    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'instructor1@example.com',
      password: 'password123',
      portal: 'instructor'
    });

    logger.info('Login response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    return response.data.token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('Login request failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
    } else {
      logger.error('Login failed with unexpected error:', error);
    }
    throw error;
  }
}

async function testInstructorEndpoints() {
  try {
    // Get fresh token
    logger.info('Step 1: Getting fresh token...');
    const token = await getToken();
    logger.info('Token obtained successfully:', { token });

    // Test getting instructor by ID
    logger.info('Step 2: Testing GET /instructors/8');
    logger.info('Request details:', {
      url: `${BASE_URL}/instructors/8`,
      headers: { Authorization: `Bearer ${token}` }
    });

    const instructorResponse = await axios.get(`${BASE_URL}/instructors/8`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    logger.info('Instructor details response:', {
      status: instructorResponse.status,
      statusText: instructorResponse.statusText,
      data: instructorResponse.data,
      headers: instructorResponse.headers
    });

    // Test getting instructor availability
    logger.info('Step 3: Testing GET /instructors/8/availability');
    logger.info('Request details:', {
      url: `${BASE_URL}/instructors/8/availability`,
      headers: { Authorization: `Bearer ${token}` }
    });

    const availabilityResponse = await axios.get(`${BASE_URL}/instructors/8/availability`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    logger.info('Availability details response:', {
      status: availabilityResponse.status,
      statusText: availabilityResponse.statusText,
      data: availabilityResponse.data,
      headers: availabilityResponse.headers
    });

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('Request failed:', {
        step: error.config?.url?.includes('availability') ? 'availability' : 'instructor details',
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
    } else {
      logger.error('Request failed with unexpected error:', error);
    }
  }
}

logger.info('Starting instructor endpoints test...');
testInstructorEndpoints().then(() => {
  logger.info('Test completed');
}).catch(error => {
  logger.error('Test failed with error:', error);
}); 