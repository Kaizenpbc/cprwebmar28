import axios from 'axios';

const API_URL = 'http://localhost:9005';
let authToken: string;

interface AuthResponse {
    token: string;
}

interface Availability {
    id: number;
    instructor_id: number;
    date: string;
    status: string;
    created_at: string;
    updated_at: string;
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

async function testInstructorEndpoints() {
    try {
        console.log('🏃 Starting instructor endpoints test...\n');

        // Login as instructor
        console.log('1️⃣ Authenticating as instructor...');
        try {
            console.log('Sending authentication request to:', `${API_URL}/auth/login`);
            const authResponse = await axios.post<AuthResponse>(`${API_URL}/auth/login`, {
                email: 'instructor1@example.com',
                password: 'password123'
            });
            
            authToken = authResponse.data.token;
            console.log('✅ Authentication successful\n');
        } catch (error: any) {
            console.error('Authentication failed:');
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            throw error;
        }

        // Test GET instructor's availability
        console.log('2️⃣ Testing GET instructor availability:');
        try {
            const availabilityResponse = await axios.get<Availability[]>(`${API_URL}/instructors/availability/2`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✅ Availability retrieved successfully');
            console.log('Availability count:', availabilityResponse.data.length);
            console.log('Sample availability:', availabilityResponse.data[0], '\n');
        } catch (error: any) {
            console.error('GET availability failed:');
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            throw error;
        }

        // Test POST instructor's availability
        console.log('3️⃣ Testing POST instructor availability:');
        const newAvailability = {
            date: '2024-05-01',
            status: 'available'
        };
        try {
            const createResponse = await axios.post<Availability>(
                `${API_URL}/instructors/availability`,
                newAvailability,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            console.log('✅ Availability created successfully');
            console.log('Created availability:', createResponse.data, '\n');
        } catch (error: any) {
            console.error('POST availability failed:');
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            throw error;
        }

        // Test GET instructor's courses
        console.log('4️⃣ Testing GET instructor courses:');
        try {
            const coursesResponse = await axios.get<CourseInstance[]>(`${API_URL}/instructors/courses/2`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✅ Courses retrieved successfully');
            console.log('Courses count:', coursesResponse.data.length);
            console.log('Sample course:', coursesResponse.data[0], '\n');

            if (coursesResponse.data.length > 0) {
                // Test PUT course status update
                console.log('5️⃣ Testing PUT course status update:');
                const updateData = {
                    status: 'completed'
                };
                const updateResponse = await axios.put<CourseInstance>(
                    `${API_URL}/instructors/courses/${coursesResponse.data[0].id}`,
                    updateData,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
                console.log('✅ Course status updated successfully');
                console.log('Updated course:', updateResponse.data, '\n');
            }
        } catch (error: any) {
            console.error('Course operation failed:');
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            throw error;
        }

        console.log('🎉 All instructor tests completed successfully!');

    } catch (error) {
        console.error('\n❌ Test failed');
        process.exit(1);
    }
}

testInstructorEndpoints(); 