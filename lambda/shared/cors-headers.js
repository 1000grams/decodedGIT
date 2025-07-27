const headers = {
    'Access-Control-Allow-Origin': 'https://decodedmusic.com',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json'
};

function response(statusCode, body) {
    return {
        statusCode,
        headers,
        body: JSON.stringify(body)
    };
}

function successResponse(data) {
    return response(200, data);
}

function errorResponse(error, statusCode = 500) {
    return response(statusCode, {
        error: error.message || error,
        timestamp: new Date().toISOString()
    });
}

module.exports = {
    headers,
    response,
    successResponse,
    errorResponse
};
