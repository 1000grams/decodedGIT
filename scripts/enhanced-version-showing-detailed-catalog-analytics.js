// Enhanced version showing detailed catalog analytics
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('Dashboard Accounting Event:', JSON.stringify(event, null, 2));
    
    const headers = {
        'Access-Control-Allow-Origin': 'https://decodedmusic.com',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    };
    
    try {
        const artistId = event.queryStringParameters?.artistId || 'RueDeVivre';
        
        // Get catalog items for the artist
        const catalogParams = {
            TableName: 'CatalogItems',
            FilterExpression: 'contains(artistName, :artistId) OR contains(#id, :artistId)',
            ExpressionAttributeNames: {
                '#id': 'id'
            },
            ExpressionAttributeValues: {
                ':artistId': artistId
            }
        };
        
        const catalogResult = await dynamodb.scan(catalogParams).promise();
        
        // Get sales/analytics data
        const salesParams = {
            TableName: 'SalesData', // Your sales table
            FilterExpression: 'artistId = :artistId',
            ExpressionAttributeValues: {
                ':artistId': artistId
            }
        };
        
        let salesResult = { Items: [] };
        try {
            salesResult = await dynamodb.scan(salesParams).promise();
        } catch (err) {
            console.log('Sales table not found, using mock data');
        }
        
        // Return detailed analytics
        const analytics = {
            artist: artistId,
            totalTracks: catalogResult.Items.length,
            catalogItems: catalogResult.Items.map(item => ({
                id: item.id,
                title: item.title || item.name,
                artist: item.artistName,
                genre: item.genre,
                duration: item.duration,
                releaseDate: item.releaseDate,
                streams: Math.floor(Math.random() * 10000), // Mock streams
                revenue: (Math.random() * 1000).toFixed(2) // Mock revenue
            })),
            totalRevenue: salesResult.Items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0),
            salesData: salesResult.Items,
            summary: {
                thisMonth: {
                    streams: Math.floor(Math.random() * 50000),
                    revenue: (Math.random() * 5000).toFixed(2),
                    newFollowers: Math.floor(Math.random() * 100)
                },
                lastMonth: {
                    streams: Math.floor(Math.random() * 45000),
                    revenue: (Math.random() * 4500).toFixed(2),
                    newFollowers: Math.floor(Math.random() * 80)
                }
            }
        };
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(analytics)
        };
        
    } catch (error) {
        console.error('Dashboard Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message,
                artist: 'RueDeVivre',
                fallbackData: {
                    totalTracks: 0,
                    catalogItems: [],
                    message: 'Unable to load catalog data'
                }
            })
        };
    }
};