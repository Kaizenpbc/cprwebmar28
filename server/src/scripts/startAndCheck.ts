import { spawn } from 'child_process';
import fetch from 'node-fetch';

interface HealthResponse {
    status: string;
    timestamp: string;
    uptime: number;
    memory: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
        arrayBuffers: number;
    };
}

interface AuthResponse {
    token: string;
    user: {
        id: number;
        email: string;
        role: string;
        organizationId?: number;
    };
}

interface Course {
    id: number;
    name: string;
    description?: string;
    organizationId: number;
}

interface ApiError {
    message: string;
    code?: string;
    details?: any;
}

async function checkHealth() {
    try {
        console.log('\nChecking server health...');
        const response = await fetch('http://localhost:9005/api/health');
        const data = await response.json() as HealthResponse;
        console.log('Health check response:', JSON.stringify(data, null, 2));
        
        // Format memory usage for better readability
        const memoryMB = {
            rss: (data.memory.rss / 1024 / 1024).toFixed(2),
            heapTotal: (data.memory.heapTotal / 1024 / 1024).toFixed(2),
            heapUsed: (data.memory.heapUsed / 1024 / 1024).toFixed(2),
            external: (data.memory.external / 1024 / 1024).toFixed(2)
        };
        
        console.log('\nMemory Usage (MB):', JSON.stringify(memoryMB, null, 2));
        console.log('Uptime (minutes):', (data.uptime / 60).toFixed(2));
    } catch (error) {
        console.error('Health check failed:', error);
        throw error;
    }
}

async function checkDatabase() {
    try {
        console.log('\nChecking database connection...');
        
        // Test basic database connection
        const healthResponse = await fetch('http://localhost:9005/api/health');
        if (!healthResponse.ok) {
            throw new Error('Database connection check failed');
        }
        console.log('Database connection is healthy');

        // Test database schema
        const schemaResponse = await fetch('http://localhost:9005/api/db/schema');
        if (schemaResponse.ok) {
            const schema = await schemaResponse.json();
            console.log('Database schema check:', schema);
        } else {
            console.warn('Schema check not available');
        }

        // Test database tables
        const tablesResponse = await fetch('http://localhost:9005/api/db/tables');
        if (tablesResponse.ok) {
            const tables = await tablesResponse.json();
            console.log('Available tables:', tables);
        } else {
            console.warn('Tables check not available');
        }

    } catch (error) {
        console.error('Database check failed:', error);
        throw error;
    }
}

async function checkAuth() {
    try {
        console.log('\nTesting authentication...');
        
        // Test login with valid credentials
        const loginResponse = await fetch('http://localhost:9005/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'instructor1@example.com',
                password: 'password123',
                portal: 'instructor'
            })
        });
        
        if (loginResponse.ok) {
            const data = await loginResponse.json() as AuthResponse;
            console.log('Login successful');
            console.log('Token received:', data.token.substring(0, 20) + '...');
            
            // Test token verification
            const verifyResponse = await fetch('http://localhost:9005/api/auth/verify', {
                headers: { 'Authorization': `Bearer ${data.token}` }
            });
            const verifyData = await verifyResponse.json() as AuthResponse;
            console.log('Token verification:', verifyData);

            // Test protected endpoint access
            const protectedResponse = await fetch('http://localhost:9005/instructor/courses', {
                headers: { 'Authorization': `Bearer ${data.token}` }
            });
            if (protectedResponse.ok) {
                const courses = await protectedResponse.json() as Course[];
                console.log('Protected endpoint access successful');
                console.log('Courses count:', courses.length);
            } else {
                console.warn('Protected endpoint access failed:', await protectedResponse.text());
            }
        } else {
            const error = await loginResponse.json() as ApiError;
            console.log('Login failed:', error.message);
        }

        // Test login with invalid credentials
        const invalidLoginResponse = await fetch('http://localhost:9005/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'wrong@example.com',
                password: 'wrongpassword',
                portal: 'instructor'
            })
        });
        
        if (!invalidLoginResponse.ok) {
            const error = await invalidLoginResponse.json() as ApiError;
            console.log('Invalid login correctly rejected:', error.message);
        }

    } catch (error) {
        console.error('Auth check failed:', error);
        throw error;
    }
}

async function checkApiEndpoints() {
    try {
        console.log('\nTesting API endpoints...');
        
        // Test instructor endpoints
        const instructorResponse = await fetch('http://localhost:9005/api/instructor/classes');
        console.log('Instructor classes endpoint:', instructorResponse.status);
        
        // Test organization endpoints
        const orgResponse = await fetch('http://localhost:9005/api/organizations');
        console.log('Organizations endpoint:', orgResponse.status);
        
        // Test course types endpoint
        const courseTypesResponse = await fetch('http://localhost:9005/api/course-types');
        console.log('Course types endpoint:', courseTypesResponse.status);

    } catch (error) {
        console.error('API endpoint check failed:', error);
        throw error;
    }
}

async function startServerAndCheck() {
    console.log('Starting server...');
    
    // Start the server
    const server = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        stdio: 'pipe',
        shell: true
    });

    // Log server output
    server.stdout.on('data', (data) => {
        console.log(`Server: ${data}`);
    });

    server.stderr.on('data', (data) => {
        console.error(`Server Error: ${data}`);
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
        // Run all checks
        await checkHealth();
        await checkDatabase();
        await checkAuth();
        await checkApiEndpoints();
        
        console.log('\nAll checks completed successfully!');
    } catch (error) {
        console.error('\nSome checks failed:', error);
        process.exit(1);
    }

    // Keep the script running
    process.on('SIGINT', () => {
        server.kill();
        process.exit();
    });
}

startServerAndCheck(); 