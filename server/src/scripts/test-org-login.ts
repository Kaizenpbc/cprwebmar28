import axios from 'axios';
import logger from '../utils/logger';

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:9005';

const TEST_ORG_USERS = [
  {
    email: 'orgadmin@example.com',
    password: 'password123',
    portal: 'organization',
    expectedRole: 'orgAdmin'
  }
];

async function testOrgLogin() {
  logger.info('Starting organization login tests...');
  
  for (const user of TEST_ORG_USERS) {
    try {
      logger.info(`Testing login for ${user.email} (${user.portal} portal)...`);
      
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: user.email,
        password: user.password,
        portal: user.portal
      });

      if (response.status === 200) {
        const { token, user: userData } = response.data;
        logger.info('✅ Login successful');
        logger.info('✅ Token received:', token.substring(0, 20) + '...');
        logger.info('✅ User role:', userData.role);
        
        // Test token validation
        try {
          const verifyResponse = await axios.get(`${API_URL}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (verifyResponse.status === 200) {
            logger.info('✅ Token validation successful');
          }
        } catch (error) {
          logger.error('❌ Token validation failed:', error.response?.data || error.message);
        }
      }
    } catch (error) {
      logger.error(`❌ Login failed for ${user.email}:`, 
        error.response?.status, 
        error.response?.data || error.message
      );
    }
    logger.info('-----------------------------------');
  }
  
  // Test invalid credentials
  try {
    logger.info('Testing invalid credentials...');
    
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'invalid@example.com',
      password: 'wrongpassword',
      portal: 'organization'
    });
    
    logger.error(`❌ Expected error for invalid credentials, but got status ${response.status}`);
  } catch (error) {
    if (error.response?.status === 401) {
      logger.info('✅ Invalid credentials correctly rejected');
    } else {
      logger.error(`❌ Unexpected error for invalid credentials: ${error.response?.status || error.message}`);
    }
  }
  
  logger.info('Organization login tests completed');
}

// Run the tests
testOrgLogin().catch(error => {
  logger.error('Test execution failed:', error);
  process.exit(1);
}); 