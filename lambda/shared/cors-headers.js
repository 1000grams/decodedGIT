const headers = {
    'Access-Control-Allow-Origin': 'https://decodedmusic.com',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE'
};

function successResponse(data) {
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
    };
}

function errorResponse(error, statusCode = 500) {
    return {
        statusCode,
        headers,
        body: JSON.stringify({
            error: error.message || error,
            timestamp: new Date().toISOString()
        })
    };
}

module.exports = {
    headers,
    successResponse,
    errorResponse
};
