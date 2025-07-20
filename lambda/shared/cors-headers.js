module.exports = {
    headers: {
        'Access-Control-Allow-Origin': 'https://decodedmusic.com',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE'
    },
    successResponse: (data) => ({ statusCode: 200, headers: this.headers, body: JSON.stringify(data) }),
    errorResponse: (error, statusCode = 500) => ({ statusCode, headers: this.headers, body: JSON.stringify({ error: error.message || error, timestamp: new Date().toISOString() }) })
};
