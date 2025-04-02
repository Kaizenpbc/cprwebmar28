import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkToken() {
    try {
        // Get a token through login
        const response = await fetch('http://localhost:9005/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'instructor1@example.com',
                password: 'password123',
                portal: 'instructor'
            })
        });

        const data = await response.json();
        const token = data.token;

        console.log('\nToken Details:');
        console.log('===============');
        
        // Decode token without verification
        const decoded = jwt.decode(token);
        console.log('\nDecoded Token (without verification):');
        console.log(JSON.stringify(decoded, null, 2));

        // Verify token with correct secret
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'cpr_secret_key_2024');
        console.log('\nVerified Token:');
        console.log(JSON.stringify(verified, null, 2));

        // Check token expiration
        const expirationDate = new Date((decoded as any).exp * 1000);
        console.log('\nToken Expiration:', expirationDate.toLocaleString());
        console.log('Time until expiration:', Math.round((expirationDate.getTime() - Date.now()) / 1000 / 60), 'minutes');

        // Verify token with server
        const verifyResponse = await fetch('http://localhost:9005/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('\nServer Verification Status:', verifyResponse.status);
        if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            console.log('Server Verification Response:', JSON.stringify(verifyData, null, 2));
        } else {
            console.log('Server Verification Failed');
        }

    } catch (error) {
        console.error('Error checking token:', error);
    }
}

checkToken(); 