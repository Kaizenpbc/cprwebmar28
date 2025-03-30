import axios from 'axios';

const API_URL = 'http://localhost:9005';
let authToken: string;

interface AuthResponse {
    token: string;
}

interface Organization {
    id: number;
    name: string;
    code: string;
    status: string;
    settings: any;
    created_at: string;
    updated_at: string;
}

async function testOrganizations() {
    try {
        console.log('🏃 Starting organization endpoints test...\n');

        // Login first
        console.log('1️⃣ Authenticating as admin...');
        try {
            console.log('Sending authentication request to:', `${API_URL}/auth/login`);
            console.log('With credentials:', {
                email: 'admin@example.com',
                password: 'password123'
            });
            
            const authResponse = await axios.post<AuthResponse>(`${API_URL}/auth/login`, {
                email: 'admin@example.com',
                password: 'password123'
            });
            
            console.log('Auth response status:', authResponse.status);
            console.log('Auth response headers:', authResponse.headers);
            console.log('Auth response data:', authResponse.data);
            
            authToken = authResponse.data.token;
            console.log('✅ Authentication successful\n');
        } catch (error: any) {
            console.error('Authentication failed:');
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
                console.error('Response data:', error.response.data);
            } else if (error.request) {
                console.error('No response received');
                console.error('Request details:', error.request);
            } else {
                console.error('Error setting up request:', error.message);
            }
            console.error('Full error:', error);
            throw error;
        }

        // Test GET all organizations
        console.log('2️⃣ Testing GET all organizations:');
        try {
            const orgsResponse = await axios.get<Organization[]>(`${API_URL}/organizations`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✅ Organizations retrieved successfully');
            console.log('Organizations count:', orgsResponse.data.length);
            console.log('Sample organization:', orgsResponse.data[0], '\n');
        } catch (error: any) {
            console.error('GET organizations failed:');
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            console.error('Error:', error.message);
            throw error;
        }

        // Test POST new organization
        console.log('3️⃣ Testing POST new organization:');
        const newOrg = {
            name: 'Test Organization 3',
            code: 'TO3',
            status: 'active',
            settings: { contactPhone: '555-555-5555' }
        };
        try {
            const createResponse = await axios.post<Organization>(`${API_URL}/organizations`, newOrg, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✅ Organization created successfully');
            console.log('Created organization:', createResponse.data, '\n');

            // Test PUT update organization
            console.log('4️⃣ Testing PUT update organization:');
            const updateData = {
                name: 'Test Organization 3 Updated',
                code: 'TO3',
                status: 'active',
                settings: { contactPhone: '666-666-6666' }
            };
            const updateResponse = await axios.put<Organization>(
                `${API_URL}/organizations/${createResponse.data.id}`,
                updateData,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            console.log('✅ Organization updated successfully');
            console.log('Updated organization:', updateResponse.data, '\n');

            // Test DELETE organization
            console.log('5️⃣ Testing DELETE organization:');
            await axios.delete(`${API_URL}/organizations/${createResponse.data.id}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✅ Organization deleted successfully\n');

        } catch (error: any) {
            console.error('Organization operation failed:');
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            console.error('Error:', error.message);
            throw error;
        }

        console.log('🎉 All organization tests completed successfully!');

    } catch (error) {
        console.error('\n❌ Test failed');
        process.exit(1);
    }
}

testOrganizations(); 