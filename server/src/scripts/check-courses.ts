import { db } from '../config/db';
import logger from '../utils/logger';

async function checkCourses() {
  try {
    logger.info('Checking course instances in the database...');
    
    const courses = await db('course_instances')
      .select('*')
      .orderBy('date', 'desc');
    
    if (courses.length === 0) {
      logger.info('No course instances found in the database.');
    } else {
      logger.info(`Found ${courses.length} course instance(s):`);
      courses.forEach((course) => {
        logger.info(`
          ID: ${course.id}
          Course Number: ${course.course_number}
          Course Type ID: ${course.course_type_id}
          Organization ID: ${course.organization_id}
          Date: ${course.date}
          Location: ${course.location}
          Instructor ID: ${course.instructor_id}
          Status: ${course.status}
          Notes: ${course.notes}
          Created: ${course.created_at}
          Updated: ${course.updated_at}
        `);
      });
    }

  } catch (error) {
    logger.error('Error checking course instances:', error);
  }
}

checkCourses(); 