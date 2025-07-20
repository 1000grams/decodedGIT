exports.handler = async (event) => {
    console.log('📝 Auth Signup - decodedmusic Platform');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            body: ''
        };
    }
    
    try {
        const body = event.body ? JSON.parse(event.body) : {};
        const { name, email, password, artistProfile } = body;
        
        console.log('Signup attempt for:', email);
        
        if (!name || !email || !password) {
            throw new Error('Name, email, and password are required');
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Please provide a valid email address');
        }
        
        const userId = 'user-' + Math.random().toString(36).substr(2, 9);
        
        const response = {
            success: true,
            userId: userId,
            user: {
                id: userId,
                name: name,
                email: email,
                artistProfile: artistProfile || {},
                platform: 'decodedmusic',
                createdAt: new Date().toISOString()
            },
            message: 'Account created successfully - Welcome to the decodedmusic community!',
            nextSteps: [
                'Complete your artist profile',
                'Upload your first track',
                'Join our Discord community'
            ],
            timestamp: new Date().toISOString()
        };
        
        console.log('Signup successful for:', email);
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(response)
        };
    } catch (error) {
        console.error('Signup error:', error.message);
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: error.message,
                platform: 'decodedmusic'
            })
        };
    }
};
