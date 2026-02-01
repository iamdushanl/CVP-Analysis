const https = require('https');

const apiKey = 'AIzaSyBYN19xPqIxpQOza4kyedCOxTXsfkoYiic';
const modelName = 'gemini-1.5-flash';

const data = JSON.stringify({
    contents: [{ parts: [{ text: 'Hi' }] }]
});

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1/models/${modelName}:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', body);
    });
});

req.on('error', (e) => console.log('Error:', e.message));
req.write(data);
req.end();
