import axios from 'axios';
import logger from '../utils/logger';

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:9005';

// Test users for each portal
const TEST_USERS = [
  {
    email: 'instructor1@example.com',
    password: 'password123',
    portal: 'instructor',
    expectedRole: 'instructor',
    description: 'Instructor Portal'
  },
  {
    email: 'admin@example.com',
    password: 'password123',
    portal: 'admin',
    expectedRole: 'sysAdmin',
    description: 'Admin Portal'
  },
  {
    email: 'orgadmin@example.com',
    password: 'password123',
    portal: 'organization',
    expectedRole: 'orgAdmin',
    description: 'Organization Portal'
  }
];

// Invalid test cases
const INVALID_TEST_CASES = [
  {
    email: 'instructor1@example.com',
    password: 'wrongpassword',
    portal: 'instructor',
    description: 'Invalid password for instructor'
  },
  {
    email: 'admin@example.com',
    password: 'password123',
    portal: 'organization', // Wrong portal for admin
    description: 'Admin trying to access organization portal'
  },
  {
    email: 'orgadmin@example.com',
    password: 'password123',
    portal: 'instructor', // Wrong portal for org admin
    description: 'Org admin trying to access instructor portal'
  },
  {
    email: 'nonexistent@example.com',
    password: 'password123',
    portal: 'instructor',
    description: 'Non-existent user'
  },
  {
    email: 'instructor1@example.com',
    password: 'password123',
    portal: 'invalid_portal', // Invalid portal
    description: 'Invalid portal value'
  }
];

async function testAllPortals() {
  logger.info('Starting comprehensive portal tests...');
  
  // Test valid logins for each portal
  logger.info('\n=== Testing Valid Portal Logins ===');
  for (const user of TEST_USERS) {
    try {
      logger.info(`\nTesting ${user.description} login for ${user.email}...`);
      
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: user.email,
        password: user.password,
        portal: user.portal
      });

      if (response.status === 200) {
        const { token, user: userData } = response.data;
        logger.info(`✅ ${user.description} login successful`);
        logger.info(`✅ Token received: ${token.substring(0, 20)}...`);
        logger.info(`✅ User role: ${userData.role}`);
        
        // Verify role matches expected
        if (userData.role === user.expectedRole) {
          logger.info(`✅ User role matches expected: ${userData.role}`);
        } else {
          logger.error(`❌ User role mismatch. Expected: ${user.expectedRole}, Got: ${userData.role}`);
        }
        
        // Test token validation
        try {
          const verifyResponse = await axios.get(`${API_URL}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (verifyResponse.status === 200) {
            logger.info(`✅ Token validation successful for ${user.description}`);
          } else {
            logger.error(`❌ Token validation failed for ${user.description}: ${verifyResponse.status}`);
          }
        } catch (error) {
          logger.error(`❌ Token validation error for ${user.description}:`, error.response?.data || error.message);
        }
      } else {
        logger.error(`❌ Unexpected status code for ${user.description}: ${response.status}`);
      }
    } catch (error) {
      logger.error(`❌ ${user.description} login failed:`, error.response?.status, error.response?.data || error.message);
    }
    logger.info('-----------------------------------');
  }
  
  // Test invalid login cases
  logger.info('\n=== Testing Invalid Login Cases ===');
  for (const testCase of INVALID_TEST_CASES) {
    try {
      logger.info(`\nTesting ${testCase.description}...`);
      
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: testCase.email,
        password: testCase.password,
        portal: testCase.portal
      });
      
      // If we get here, the request succeeded when it should have failed
      logger.error(`❌ Expected error for ${testCase.description}, but got status ${response.status}`);
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Unknown error';
        
        // Check if the error is what we expect
        if (status === 401 || status === 403 || status === 400) {
          logger.info(`✅ Correctly rejected ${testCase.description} with status ${status}: ${message}`);
        } else {
          logger.error(`❌ Unexpected error for ${testCase.description}: ${status} - ${message}`);
        }
      } else {
        logger.error(`❌ Network error for ${testCase.description}: ${error.message}`);
      }
    }
    logger.info('-----------------------------------');
  }
  
  logger.info('\nComprehensive portal tests completed');
}

// Run the tests
testAllPortals().catch(error => {
  logger.error('Test execution failed:', error);
  process.exit(1);
}); 