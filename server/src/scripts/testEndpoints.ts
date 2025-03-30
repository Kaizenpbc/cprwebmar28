import axios from 'axios';

interface AuthResponse {
    token: string;
}

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
}

interface Organization {
    id: number;
    name: string;
    code: string;
    status: string;
    settings: Record<string, any>;
}

interface CourseType {
    id: number;
    name: string;
    code: string;
    description: string;
}

interface CourseInstance {
    id: number;
    course_number: string;
    requested_date: string;
    location: string;
    status: string;
    organization_id: number;
    course_type_id: number;
    instructor_id: number;
}

interface Student {
    id: number;
    name: string;
    email: string;
    organization_id: number;
}

const API_URL = 'http://localhost:9005';
let authToken: string;

async function testEndpoints() {
    try {
        console.log('🏃 Starting API endpoint tests...\n');

        // Test authentication
        console.log('1️⃣ Testing Authentication:');
        const authResponse = await axios.post<AuthResponse>(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'password123'
        });
        authToken = authResponse.data.token;
        console.log('✅ Authentication successful');
        console.log('Token received:', authToken?.substring(0, 20) + '...\n');

        // Test GET users endpoint
        console.log('2️⃣ Testing Users Endpoint:');
        const usersResponse = await axios.get<User[]>(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Users retrieved successfully');
        console.log('Users count:', usersResponse.data.length);
        console.log('Sample user:', usersResponse.data[0], '\n');

        // Test GET organizations endpoint
        console.log('3️⃣ Testing Organizations Endpoint:');
        const orgsResponse = await axios.get<Organization[]>(`${API_URL}/organizations`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Organizations retrieved successfully');
        console.log('Organizations count:', orgsResponse.data.length);
        console.log('Sample organization:', orgsResponse.data[0], '\n');

        // Test GET course-types endpoint
        console.log('4️⃣ Testing Course Types Endpoint:');
        const courseTypesResponse = await axios.get<CourseType[]>(`${API_URL}/course-types`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Course types retrieved successfully');
        console.log('Course types count:', courseTypesResponse.data.length);
        console.log('Sample course type:', courseTypesResponse.data[0], '\n');

        // Test GET course-instances endpoint
        console.log('5️⃣ Testing Course Instances Endpoint:');
        const coursesResponse = await axios.get<CourseInstance[]>(`${API_URL}/course-instances`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Course instances retrieved successfully');
        console.log('Course instances count:', coursesResponse.data.length);
        console.log('Sample course instance:', coursesResponse.data[0], '\n');

        // Test GET students endpoint
        console.log('6️⃣ Testing Students Endpoint:');
        const studentsResponse = await axios.get<Student[]>(`${API_URL}/students`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Students retrieved successfully');
        console.log('Students count:', studentsResponse.data.length);
        console.log('Sample student:', studentsResponse.data[0], '\n');

        console.log('🎉 All endpoint tests completed successfully!');

    } catch (error: any) {
        console.error('❌ Error during testing:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testEndpoints(); 