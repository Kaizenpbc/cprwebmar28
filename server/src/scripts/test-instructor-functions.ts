import axios from 'axios';
import logger from '../utils/logger';

const BASE_URL = 'http://localhost:9005/api';
const INSTRUCTOR_ID = 8;

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

async function testInstructorFunctions() {
  try {
    // Get fresh token
    logger.info('Step 1: Getting fresh token...');
    const token = await getToken();
    logger.info('Token obtained successfully');

    // Test getting instructor's courses
    logger.info('\nStep 2: Testing GET /instructors/8/courses');
    const coursesResponse = await axios.get(`${BASE_URL}/instructors/${INSTRUCTOR_ID}/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    logger.info('Courses response:', {
      status: coursesResponse.status,
      data: coursesResponse.data
    });

    // Test getting instructor's availability
    logger.info('\nStep 3: Testing GET /instructors/8/availability');
    const availabilityResponse = await axios.get(`${BASE_URL}/instructors/${INSTRUCTOR_ID}/availability`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    logger.info('Availability response:', {
      status: availabilityResponse.status,
      data: availabilityResponse.data
    });

    // Test setting instructor's availability
    logger.info('\nStep 4: Testing POST /instructors/8/availability');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const setAvailabilityResponse = await axios.post(
      `${BASE_URL}/instructors/${INSTRUCTOR_ID}/availability`,
      {
        date: tomorrow.toISOString(),
        is_available: true
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    logger.info('Set availability response:', {
      status: setAvailabilityResponse.status,
      data: setAvailabilityResponse.data
    });

    // Verify the new availability was set
    logger.info('\nStep 5: Verifying new availability');
    const updatedAvailabilityResponse = await axios.get(`${BASE_URL}/instructors/${INSTRUCTOR_ID}/availability`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    logger.info('Updated availability response:', {
      status: updatedAvailabilityResponse.status,
      data: updatedAvailabilityResponse.data
    });

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('Request failed:', {
        step: error.config?.url?.includes('availability') ? 'availability' : 'courses',
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

logger.info('Starting instructor functions test...');
testInstructorFunctions().then(() => {
  logger.info('Test completed');
}).catch(error => {
  logger.error('Test failed with error:', error);
}); 