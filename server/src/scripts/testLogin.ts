import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface LoginResponse {
    token: string;
    user: {
        id: number;
        email: string;
        role: string;
        organizationId: number;
    };
}

interface ServerStatus {
    status: string;
    timestamp: string;
    uptime: number;
    memory: {
        heapUsed: number;
        heapTotal: number;
        external: number;
    };
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Function to write logs to file
function writeLog(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    const logFile = path.join(logsDir, `test-${timestamp.split('T')[0]}.log`);
    
    fs.appendFileSync(logFile, logMessage);
    if (error) {
        fs.appendFileSync(logFile, `Error details: ${JSON.stringify(error, null, 2)}\n`);
    }
}

async function checkServerStatus(): Promise<boolean> {
    try {
        console.log('Checking server status...');
        writeLog('Checking server status...');
        
        const response = await axios.get<ServerStatus>('http://localhost:9005/api/health');
        const status = response.data;
        
        console.log('✅ Server is running and healthy');
        console.log(`Uptime: ${Math.round(status.uptime)} seconds`);
        console.log(`Memory Usage: ${Math.round(status.memory.heapUsed / 1024 / 1024)}MB / ${Math.round(status.memory.heapTotal / 1024 / 1024)}MB`);
        
        writeLog('Server is running and healthy', status);
        return true;
    } catch (error: any) {
        const errorMessage = error.response ? 
            `Server error: ${error.response.status} - ${error.response.data}` :
            `Server is not running or not healthy: ${error.message}`;
            
        console.error('❌', errorMessage);
        writeLog(errorMessage, error);
        return false;
    }
}

async function testLogin() {
    const startTime = new Date().toISOString();
    writeLog('Starting login tests...');
    
    try {
        // First check server status
        const isServerRunning = await checkServerStatus();
        if (!isServerRunning) {
            const message = 'Please start the server before running tests';
            console.log(message);
            writeLog(message);
            return;
        }

        console.log('\nStarting login tests...\n');
        writeLog('Starting login tests...');

        // Test 1: Valid instructor login
        console.log('1. Testing valid instructor login:');
        writeLog('Testing valid instructor login...');
        
        const instructorResponse = await axios.post<LoginResponse>('http://localhost:9005/api/auth/login', {
            email: 'instructor1@example.com',
            password: 'password123',
            portal: 'instructor'
        });
        
        console.log('✅ Success! Instructor login successful');
        console.log('Token received:', instructorResponse.data.token.substring(0, 20) + '...');
        console.log('User role:', instructorResponse.data.user.role);
        writeLog('Instructor login successful', { 
            role: instructorResponse.data.user.role,
            tokenPreview: instructorResponse.data.token.substring(0, 20) + '...'
        });

        // Test 2: Invalid password
        console.log('\n2. Testing invalid password:');
        writeLog('Testing invalid password...');
        
        try {
            await axios.post('http://localhost:9005/api/auth/login', {
                email: 'instructor1@example.com',
                password: 'wrongpassword',
                portal: 'instructor'
            });
        } catch (error: any) {
            if (error.response?.status === 401) {
                console.log('✅ Success! Correctly rejected invalid password');
                writeLog('Invalid password test passed');
            } else {
                throw error;
            }
        }

        // Test 3: Invalid portal
        console.log('\n3. Testing invalid portal:');
        writeLog('Testing invalid portal...');
        
        try {
            await axios.post('http://localhost:9005/api/auth/login', {
                email: 'instructor1@example.com',
                password: 'password123',
                portal: 'student'
            });
        } catch (error: any) {
            if (error.response?.status === 401) {
                console.log('✅ Success! Correctly rejected invalid portal');
                writeLog('Invalid portal test passed');
            } else {
                throw error;
            }
        }

        // Test 4: Non-existent user
        console.log('\n4. Testing non-existent user:');
        writeLog('Testing non-existent user...');
        
        try {
            await axios.post('http://localhost:9005/api/auth/login', {
                email: 'nonexistent@example.com',
                password: 'password123',
                portal: 'instructor'
            });
        } catch (error: any) {
            if (error.response?.status === 401) {
                console.log('✅ Success! Correctly rejected non-existent user');
                writeLog('Non-existent user test passed');
            } else {
                throw error;
            }
        }

        const endTime = new Date().toISOString();
        const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
        
        console.log('\n✨ All login tests passed successfully!');
        writeLog(`All tests completed successfully. Duration: ${duration}ms`);
    } catch (error: any) {
        const errorMessage = error.response ? 
            `Test failed: ${error.response.status} - ${JSON.stringify(error.response.data)}` :
            `Test failed: ${error.message}`;
            
        console.error('\n❌', errorMessage);
        writeLog(errorMessage, error);
    }
}

// Run the tests
testLogin(); 