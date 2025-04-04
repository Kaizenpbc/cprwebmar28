import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../utils/logger';

// Load environment variables
dotenv.config();

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:9005';
const TEST_USERS = [
  {
    email: 'instructor1@example.com',
    password: 'password123',
    portal: 'instructor',
    expectedRole: 'instructor'
  },
  {
    email: 'student1@example.com',
    password: 'password123',
    portal: 'instructor',
    expectedRole: 'student'
  },
  {
    email: 'admin@example.com',
    password: 'password123',
    portal: 'admin',
    expectedRole: 'sysAdmin'
  }
];

async function testLogin() {
  logger.info('Starting login tests...');
  
  for (const user of TEST_USERS) {
    try {
      logger.info(`Testing login for ${user.email} (${user.portal} portal)...`);
      
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: user.email,
        password: user.password,
        portal: user.portal
      });
      
      // Check response status
      if (response.status === 200) {
        logger.info(`✅ Login successful for ${user.email}`);
        
        // Check response data
        const { token, user: userData } = response.data;
        
        if (token) {
          logger.info('✅ Token received');
        } else {
          logger.error('❌ No token in response');
        }
        
        if (userData && userData.role === user.expectedRole) {
          logger.info(`✅ User role matches expected: ${userData.role}`);
        } else {
          logger.error(`❌ User role mismatch. Expected: ${user.expectedRole}, Got: ${userData?.role}`);
        }
        
        // Test token validity by making an authenticated request
        try {
          const authResponse = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (authResponse.status === 200) {
            logger.info('✅ Token validation successful');
          } else {
            logger.error(`❌ Token validation failed: ${authResponse.status}`);
          }
        } catch (authError) {
          logger.error('❌ Token validation error:', authError.response?.data || authError.message);
        }
      } else {
        logger.error(`❌ Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      if (error.response) {
        logger.error(`❌ Login failed for ${user.email}: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else {
        logger.error(`❌ Login error for ${user.email}: ${error.message}`);
      }
    }
    
    logger.info('-----------------------------------');
  }
  
  // Test invalid credentials
  try {
    logger.info('Testing invalid credentials...');
    
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'invalid@example.com',
      password: 'wrongpassword',
      portal: 'instructor'
    });
    
    logger.error(`❌ Expected error for invalid credentials, but got status ${response.status}`);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logger.info('✅ Invalid credentials correctly rejected');
    } else {
      logger.error(`❌ Unexpected error for invalid credentials: ${error.response?.status || error.message}`);
    }
  }
  
  logger.info('Login tests completed');
}

// Run the tests
testLogin().catch(error => {
  logger.error('Test script error:', error);
  process.exit(1);
}); 