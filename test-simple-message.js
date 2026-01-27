const https = require('https');

const apiKey = 'AIzaSyCDkEIVVfelEGroa9fIKpXP2peXEqYjluI';

// Test simple message WITHOUT function calling
const data = JSON.stringify({
    contents: [{
        parts: [{ text: 'What is 2+2? Reply with just the answer.' }]
    }]
});

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🧪 Testing simple message (no function calling)...\n');

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
        console.log('HTTP Status:', res.statusCode);
        if (res.statusCode === 200) {
            const response = JSON.parse(body);
            console.log('✅ SUCCESS - Simple message works');
            console.log('Response:', response.candidates[0].content.parts[0].text);
        } else {
            console.log('❌ ERROR:', body);
        }
    });
});

req.on('error', (e) => console.log('❌ Error:', e.message));
req.write(data);
req.end();
