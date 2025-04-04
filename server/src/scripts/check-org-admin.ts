import { db } from '../config/db';
import logger from '../utils/logger';
import { UserRole } from '../types/user';

async function checkUsers() {
  try {
    logger.info('Checking database for users...');
    
    // Query for instructor users
    const instructors = await db('users')
      .select('id', 'username', 'email', 'role', 'organization_id', 'is_active', 'created_at')
      .where('role', UserRole.INSTRUCTOR);
    
    if (instructors.length === 0) {
      logger.info('No instructor users found in the database.');
    } else {
      logger.info(`Found ${instructors.length} instructor user(s):`);
      instructors.forEach((user) => {
        logger.info(`
          ID: ${user.id}
          Username: ${user.username}
          Email: ${user.email}
          Role: ${user.role}
          Organization ID: ${user.organization_id}
          Active: ${user.is_active}
          Created: ${user.created_at}
        `);
      });
    }

    // Also check for all users to see what roles exist
    const allUsers = await db('users')
      .select('id', 'username', 'email', 'role', 'organization_id', 'is_active', 'created_at');
    
    logger.info('\nAll users in the database:');
    allUsers.forEach((user) => {
      logger.info(`
        ID: ${user.id}
        Username: ${user.username}
        Email: ${user.email}
        Role: ${user.role}
        Organization ID: ${user.organization_id}
        Active: ${user.is_active}
        Created: ${user.created_at}
      `);
    });

  } catch (error) {
    logger.error('Error checking users:', error);
  }
}

checkUsers(); 