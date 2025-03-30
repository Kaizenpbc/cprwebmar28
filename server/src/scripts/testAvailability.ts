import axios from 'axios';

const API_URL = 'http://localhost:9005';
let authToken: string;

interface AuthResponse {
    token: string;
}

async function testAvailability() {
    try {
        console.log('🏃 Testing instructor availability scheduling...\n');

        // 1. Login as instructor
        console.log('1️⃣ Logging in as instructor...');
        const authResponse = await axios.post<AuthResponse>(`${API_URL}/auth/login`, {
            email: 'instructor1@example.com',
            password: 'password123'
        });
        authToken = authResponse.data.token;
        console.log('✅ Login successful!\n');

        // 2. Schedule availability for April 1st
        console.log('2️⃣ Scheduling availability for April 1st...');
        const availabilityResponse = await axios.post(
            `${API_URL}/instructors/availability`,
            {
                date: '2024-04-01',
                status: 'available'
            },
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        console.log('✅ Availability scheduled!\n');
        console.log('Scheduled availability:', availabilityResponse.data);

        // 3. Verify by getting all availability
        console.log('\n3️⃣ Verifying instructor availability...');
        const allAvailability = await axios.get(
            `${API_URL}/instructors/availability/2`,
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        console.log('\nAll availability records:');
        console.log(JSON.stringify(allAvailability.data, null, 2));

    } catch (error: any) {
        console.error('\n❌ Test failed');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

testAvailability(); 