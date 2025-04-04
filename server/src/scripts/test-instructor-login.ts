import axios from 'axios';
import logger from '../utils/logger';

async function testInstructorLogin() {
  try {
    const response = await axios.post('http://localhost:9005/api/auth/login', {
      username: 'instructor1',
      password: 'password123',
      portal: 'instructor'
    });

    logger.info('Login successful!');
    logger.info('Token:', response.data.token);
    logger.info('User:', response.data.user);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('Login failed:', error.response?.data);
    } else {
      logger.error('Login failed:', error);
    }
  }
}

testInstructorLogin(); 