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
    email: 'admin@example.com',
    password: 'password123',
    portal: 'admin',
    expectedRole: 'sysAdmin'
  },
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
  }
];

// API endpoints to test
const ENDPOINTS = [
  { path: '/api/auth/me', method: 'GET', requiresAuth: true },
  { path: '/api/organizations', method: 'GET', requiresAuth: true, adminOnly: true },
  { path: '/api/course-types', method: 'GET', requiresAuth: true },
  { path: '/api/instructor/availability', method: 'GET', requiresAuth: true },
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
      
      const token = loginResponse.data.token;
      logger.info(`✅ Login successful. User role: ${loginResponse.data.user.role}`);
      
      // Test each endpoint
      for (const endpoint of ENDPOINTS) {
        // Skip admin-only endpoints for non-admin users
        if (endpoint.adminOnly && user.expectedRole !== 'sysAdmin') {
          logger.info(`\nSkipping ${endpoint.method} ${endpoint.path} (admin only)`);
          continue;
        }
        
        logger.info(`\nTesting ${endpoint.method} ${endpoint.path}...`);
        try {
          const response = await axios({
            method: endpoint.method,
            url: `${API_URL}${endpoint.path}`,
            headers: endpoint.requiresAuth ? { Authorization: `Bearer ${token}` } : {}
          });
          
          logger.info(`✅ Request successful (${response.status})`);
          if (response.data) {
            logger.info('✅ Response contains data');
          }
        } catch (error: any) {
          logger.error(`❌ Request failed: ${error.response?.status || 'unknown'} - ${JSON.stringify(error.response?.data || error.message)}`);
        }
      }
    } catch (error: any) {
      logger.error(`❌ Test failed for ${user.email}: ${error.message}`);
    }
  }
  
  logger.info('\nAPI tests completed');
}

// Run the tests
testAPI().catch(error => {
  logger.error('Test suite failed:', error);
  process.exit(1);
}); 