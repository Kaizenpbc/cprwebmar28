import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface LoginResponse {
    token: string;
}

interface CoursePayment {
    id: number;
    course_instance_id: number;
    organization_id: number;
    amount: number;
    payment_method: string;
    status: string;
    recorded_by: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

interface FinancialRecord {
    id: number;
    organization_id: number;
    amount: number;
    type: string;
    reference_id?: number;
    description?: string;
    created_at: string;
    updated_at: string;
}

const API_URL = process.env.API_URL || 'http://localhost:9005';

async function testAccounting() {
    try {
        // Login as accounting user
        console.log('Logging in as accounting user...');
        const loginResponse = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
            email: 'accounting@example.com',
            password: 'password123'
        });
        const token = loginResponse.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        // Record a course payment
        console.log('\nRecording a course payment...');
        const paymentData = {
            amount: 500.00,
            payment_method: 'CREDIT_CARD',
            status: 'PAID'
        };
        const createResponse = await axios.post<CoursePayment>(
            `${API_URL}/api/accounting/course/1/payment`,
            paymentData,
            { headers }
        );
        console.log('Created payment:', createResponse.data);
        
        // Get payment status
        console.log('\nFetching payment status...');
        const paymentResponse = await axios.get<CoursePayment>(
            `${API_URL}/api/accounting/course/1/payment`,
            { headers }
        );
        console.log('Payment status:', paymentResponse.data);

        // Get all financial records
        console.log('\nFetching all financial records...');
        const recordsResponse = await axios.get<FinancialRecord[]>(
            `${API_URL}/api/accounting`,
            { headers }
        );
        console.log('Financial records:', recordsResponse.data);

        // Get organization financial records
        console.log('\nFetching organization financial records...');
        const orgRecordsResponse = await axios.get<FinancialRecord[]>(
            `${API_URL}/api/accounting/organization/1`,
            { headers }
        );
        console.log('Organization records:', orgRecordsResponse.data);

        // Get financial summary
        console.log('\nFetching financial summary...');
        const today = new Date().toISOString().split('T')[0];
        const summaryResponse = await axios.get(
            `${API_URL}/api/accounting/summary`,
            {
                headers,
                params: {
                    start_date: '2024-01-01',
                    end_date: today
                }
            }
        );
        console.log('Financial summary:', summaryResponse.data);

        console.log('\nAll tests completed successfully!');
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Test failed:', {
            message: err.message,
            details: err
        });
    }
}

testAccounting(); 