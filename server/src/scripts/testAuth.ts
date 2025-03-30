import axios from 'axios';

interface AuthResponse {
    token: string;
}

async function testAuth() {
    try {
        console.log('Testing authentication endpoint...');
        
        // Test with valid credentials
        console.log('\n1. Testing with valid credentials:');
        const validResponse = await axios.post<AuthResponse>('http://localhost:9005/auth/login', {
            email: 'admin@example.com',
            password: 'password123'
        });
        console.log('✅ Success! Token received:', validResponse.data.token.substring(0, 20) + '...');

        // Test with invalid credentials
        console.log('\n2. Testing with invalid credentials:');
        try {
            await axios.post('http://localhost:9005/auth/login', {
                email: 'wrong@example.com',
                password: 'wrongpassword'
            });
        } catch (error: any) {
            if (error.response?.status === 401) {
                console.log('✅ Success! Correctly rejected invalid credentials');
            } else {
                throw error;
            }
        }

        console.log('\n✨ All authentication tests passed!');
    } catch (error: any) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testAuth(); 