exports.handler = async (event) => {
    console.log(' Subscription Create - decodedmusic Platform');
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
        const { userId, planType, paymentMethod } = body;
        
        console.log('Subscription request:', { userId, planType });
        
        if (!userId || !planType) {
            throw new Error('userId and planType are required');
        }
        
        // decodedmusic Pricing Plans - Price Revolution!
        const plans = {
            'artist-starter': { 
                name: 'Artist Starter', 
                price: 19, 
                currency: 'USD',
                features: ['Basic Analytics', 'Upload Music', 'Community Access', 'Discord Support'],
                limits: { tracks: 10, storage: '1GB' }
            },
            'pro-creator': { 
                name: 'Pro Creator', 
                price: 89, 
                currency: 'USD',
                features: ['Advanced Analytics', 'AI Insights', 'Marketing Tools', 'Spotify Integration'],
                limits: { tracks: 'unlimited', storage: '10GB' }
            },
            'industry-pro': { 
                name: 'Industry Pro', 
                price: 249, 
                currency: 'USD',
                features: ['Full Platform', 'Bedrock AI', 'Enterprise Features', 'Priority Support'],
                limits: { tracks: 'unlimited', storage: '100GB' }
            }
        };
        
        const plan = plans[planType];
        if (!plan) {
            throw new Error('Invalid plan type. Available: ' + Object.keys(plans).join(', '));
        }
        
        const subscriptionId = 'sub-' + Math.random().toString(36).substr(2, 9);
        const checkoutSessionId = 'cs-' + Math.random().toString(36).substr(2, 12);
        
        const response = {
            success: true,
            subscriptionId: subscriptionId,
            plan: plan,
            userId: userId,
            pricing: {
                amount: plan.price,
                currency: plan.currency,
                billing: 'monthly',
                priceRevolution: 'Starting from $0.99 - Music industry pricing disrupted!'
            },
            paymentUrl: `https://checkout.stripe.com/pay/${checkoutSessionId}`,
            message: `${plan.name} subscription created!  Price Revolution in action!`,
            platform: 'decodedmusic',
            timestamp: new Date().toISOString()
        };
        
        console.log('Subscription created:', subscriptionId);
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(response)
        };
    } catch (error) {
        console.error('Subscription error:', error.message);
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
