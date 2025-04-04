import { db } from '../config/db';
import logger from '../utils/logger';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  organization_id: number;
  is_active: boolean;
  created_at: Date;
}

async function checkOrgAdmin() {
  try {
    logger.info('Checking database for organization admin users...');
    
    // Query for any user with 'org' in their role
    const orgUsers = await db('users')
      .select('id', 'username', 'email', 'role', 'organization_id', 'is_active', 'created_at')
      .whereRaw("role ILIKE '%org%'");
    
    if (orgUsers.length === 0) {
      logger.info('No organization-related users found in the database.');
    } else {
      logger.info(`Found ${orgUsers.length} organization-related user(s):`);
      orgUsers.forEach((user: User) => {
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
    allUsers.forEach((user: User) => {
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
    logger.error('Error checking organization admin users:', error);
  }
}

// Run the check
checkOrgAdmin().catch(error => {
  logger.error('Script execution failed:', error);
  process.exit(1);
}); 