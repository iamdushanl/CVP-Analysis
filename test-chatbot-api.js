const https = require('https');

// Test the API key that's actually in chatbot-service.js
const apiKey = 'AIzaSyAkI5jUx2J0TBmfBQFE8ARVwXwMxeOPXic';

const data = JSON.stringify({
    contents: [{
        parts: [{ text: 'Say hello in one sentence!' }]
    }]
});

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🔄 Testing Gemini API with chatbot-service.js API key...\n');

const req = https.request(options, (res) => {
    let body = '';

    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('HTTP Status:', res.statusCode);
        console.log('Response:', body, '\n');

        try {
            const response = JSON.parse(body);

            if (response.candidates && response.candidates[0]) {
                console.log('='.repeat(70));
                console.log('✅ SUCCESS! API KEY IS VALID!');
                console.log('='.repeat(70));
                console.log('\nAI Response:');
                console.log(response.candidates[0].content.parts[0].text);
                console.log('\n' + '='.repeat(70));
            } else if (response.error) {
                console.log('❌ API Error:', response.error.message);
                console.log('Status:', response.error.status);
                console.log('Code:', response.error.code);
                if (response.error.details) {
                    console.log('Details:', JSON.stringify(response.error.details, null, 2));
                }
            } else {
                console.log('❌ Unexpected response structure');
            }
        } catch (e) {
            console.log('❌ Parse error:', e.message);
        }
    });
});

req.on('error', (e) => {
    console.log('❌ Connection error:', e.message);
});

req.write(data);
req.end();
