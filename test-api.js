import https from 'https';

const options = {
    hostname: '2h2oj7u446.execute-api.eu-central-1.amazonaws.com',
    path: '/dashboard/catalog', // Corrected path
    method: 'GET',
    headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' // Replace with a valid token
    }
};

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log(`Body: ${data}`);
    });
});

req.on('error', (error) => {
    console.error(`Error: ${error.message}`);
});

req.end();