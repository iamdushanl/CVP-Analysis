const https = require('https');

// Test with the corrected model name
const apiKey = 'AIzaSyAkI5jUx2J0TBmfBQFE8ARVwXwMxeOPXic';

const data = JSON.stringify({
    contents: [{
        parts: [{ text: 'Say hello in one sentence!' }]
    }]
});

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🔄 Testing Gemini API with CORRECTED model (gemini-1.5-flash)...\n');

const req = https.request(options, (res) => {
    let body = '';

    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('HTTP Status:', res.statusCode);

        try {
            const response = JSON.parse(body);

            if (response.candidates && response.candidates[0]) {
                console.log('='.repeat(70));
                console.log('✅ SUCCESS! API IS WORKING WITH CORRECTED MODEL!');
                console.log('='.repeat(70));
                console.log('\nAI Response:');
                console.log(response.candidates[0].content.parts[0].text);
                console.log('\n' + '='.repeat(70));
                console.log('✅ Chatbot should now work correctly!');
                console.log('='.repeat(70));
            } else if (response.error) {
                console.log('❌ API Error:', response.error.message);
                console.log('Status:', response.error.status);
                console.log('Code:', response.error.code);
            } else {
                console.log('Response:', body);
            }
        } catch (e) {
            console.log('❌ Parse error:', e.message);
            console.log('Response:', body);
        }
    });
});

req.on('error', (e) => {
    console.log('❌ Connection error:', e.message);
});

req.write(data);
req.end();
