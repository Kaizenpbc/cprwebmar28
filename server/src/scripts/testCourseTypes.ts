import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface LoginResponse {
    token: string;
}

interface CourseType {
    id: number;
    name: string;
    code: string;
    description: string;
    created_at: string;
    updated_at: string;
}

const API_URL = process.env.API_URL || 'http://localhost:9005';

async function testCourseTypes() {
    try {
        // Login as sysAdmin
        console.log('Logging in as sysAdmin...');
        const loginResponse = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'password123'
        });
        const token = loginResponse.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        // Create a new course type
        console.log('\nCreating new course type...');
        const createResponse = await axios.post<CourseType>(`${API_URL}/api/course-types`, {
            name: 'Test Course',
            code: 'TST',
            description: 'A test course type'
        }, { headers });
        console.log('Created course type:', createResponse.data);
        const courseTypeId = createResponse.data.id;

        // Get all course types
        console.log('\nFetching all course types...');
        const getAllResponse = await axios.get<CourseType[]>(`${API_URL}/api/course-types`, { headers });
        console.log('All course types:', getAllResponse.data);

        // Get course type by ID
        console.log('\nFetching course type by ID...');
        const getOneResponse = await axios.get<CourseType>(`${API_URL}/api/course-types/${courseTypeId}`, { headers });
        console.log('Single course type:', getOneResponse.data);

        // Update course type
        console.log('\nUpdating course type...');
        const updateResponse = await axios.put<CourseType>(`${API_URL}/api/course-types/${courseTypeId}`, {
            name: 'Updated Test Course',
            code: 'UTS',
            description: 'An updated test course type'
        }, { headers });
        console.log('Updated course type:', updateResponse.data);

        // Delete course type
        console.log('\nDeleting course type...');
        const deleteResponse = await axios.delete<{ message: string }>(`${API_URL}/api/course-types/${courseTypeId}`, { headers });
        console.log('Delete response:', deleteResponse.data);

        console.log('\nAll tests completed successfully!');
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Test failed:', {
            message: err.message,
            details: err
        });
    }
}

testCourseTypes(); 