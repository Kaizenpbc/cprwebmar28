import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../utils/logger';

// Load environment variables
dotenv.config();

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:9005';

// Test users
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
    portal: 'student',
    expectedRole: 'student'
  },
  {
    email: 'admin@example.com',
    password: 'password123',
    portal: 'admin',
    expectedRole: 'sysAdmin'
  }
];

// API endpoints to test
const ENDPOINTS = [
  { path: '/api/auth/me', method: 'GET', requiresAuth: true },
  { path: '/api/organizations', method: 'GET', requiresAuth: true },
  { path: '/api/course-types', method: 'GET', requiresAuth: true },
  { path: '/api/instructors/availability', method: 'GET', requiresAuth: true },
  { path: '/api/course-instances', method: 'GET', requiresAuth: true }
];

async function testAPI() {
  logger.info('Starting API tests...');
  
  for (const user of TEST_USERS) {
    try {
      logger.info(`\n=== Testing API as ${user.email} (${user.portal} portal) ===`);
      
      // Login first
      logger.info('Logging in...');
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email: user.email,
        password: user.password,
        portal: user.portal
      });
      
      if (loginResponse.status !== 200) {
        logger.error(`❌ Login failed: ${loginResponse.status}`);
        continue;
      }
      
      const { token, user: userData } = loginResponse.data;
      logger.info(`✅ Login successful. User role: ${userData.role}`);
      
      // Test each endpoint
      for (const endpoint of ENDPOINTS) {
        try {
          logger.info(`\nTesting ${endpoint.method} ${endpoint.path}...`);
          
          const config = {
            method: endpoint.method,
            url: `${API_URL}${endpoint.path}`,
            headers: endpoint.requiresAuth ? { Authorization: `Bearer ${token}` } : {}
          };
          
          const response = await axios(config);
          
          if (response.status >= 200 && response.status < 300) {
            logger.info(`✅ Request successful (${response.status})`);
            
            // Log response data structure
            if (response.data) {
              if (Array.isArray(response.data)) {
                logger.info(`✅ Response contains array with ${response.data.length} items`);
              } else if (typeof response.data === 'object') {
                logger.info(`✅ Response contains object with keys: ${Object.keys(response.data).join(', ')}`);
              } else {
                logger.info(`✅ Response data type: ${typeof response.data}`);
              }
            }
          } else {
            logger.error(`❌ Unexpected status code: ${response.status}`);
          }
        } catch (error) {
          if (error.response) {
            logger.error(`❌ Request failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
          } else {
            logger.error(`❌ Request error: ${error.message}`);
          }
        }
      }
    } catch (error) {
      logger.error(`❌ Error testing as ${user.email}: ${error.message}`);
    }
  }
  
  logger.info('\nAPI tests completed');
}

// Run the tests
testAPI().catch(error => {
  logger.error('Test script error:', error);
  process.exit(1);
}); 