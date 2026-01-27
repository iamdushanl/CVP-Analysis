const https = require('https');

const apiKey = 'AIzaSyDq5KB52pOk6dFA8ZpPKmezKikQ6i64ASU';

const data = JSON.stringify({
    contents: [{
        parts: [{ text: 'Say hello in one sentence!' }]
    }]
});

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta1/models/gemini-pro:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🔄 Testing Gemini API connection...\n');

const req = https.request(options, (res) => {
    let body = '';

    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(body);

            if (response.candidates && response.candidates[0]) {
                console.log('='.repeat(70));
                console.log('✅ SUCCESS! GEMINI API IS WORKING!');
                console.log('='.repeat(70));
                console.log('\nAI Response:');
                console.log(response.candidates[0].content.parts[0].text);
                console.log('\n' + '='.repeat(70));
                console.log('✅ Chatbot is ready to use!');
                console.log('='.repeat(70));
            } else if (response.error) {
                console.log('❌ API Error:', response.error.message);
                console.log('Status:', response.error.status);
            } else {
                console.log('❌ Unexpected response:', body);
            }
        } catch (e) {
            console.log('❌ Parse error:', e.message);
            console.log('Response body:', body);
        }
    });
});

req.on('error', (e) => {
    console.log('❌ Connection error:', e.message);
});

req.write(data);
req.end();
