import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { verify } from 'jsonwebtoken';

// Load environment variables
dotenv.config();

interface TokenData {
    token: string;
}

async function checkToken() {
    try {
        const data = JSON.parse(process.argv[2]) as TokenData;
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
        console.error('Error:', error);
        process.exit(1);
    }
}

checkToken(); 