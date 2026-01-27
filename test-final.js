const https = require('https');

const apiKey = 'AIzaSyAkI5jUx2J0TBmfBQFE8ARVwXwMxeOPXic';

const data = JSON.stringify({
    contents: [{
        parts: [{ text: 'What is 2+2? Reply with just the number.' }]
    }]
});

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🧪 Testing chatbot with corrected model: gemini-2.0-flash\n');

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
        console.log('HTTP Status:', res.statusCode);
        try {
            const response = JSON.parse(body);
            if (response.candidates && response.candidates[0]) {
                console.log('\n' + '='.repeat(70));
                console.log('✅ SUCCESS! CHATBOT API IS NOW WORKING!');
                console.log('='.repeat(70));
                console.log('\nAI Response:', response.candidates[0].content.parts[0].text);
                console.log('\n' + '='.repeat(70));
                console.log('✅ Chatbot is ready! Refresh your browser to test it.');
                console.log('='.repeat(70));
            } else if (response.error) {
                console.log('❌ Error:', response.error.message);
            }
        } catch (e) {
            console.log('❌ Parse error:', e.message);
            console.log('Response:', body);
        }
    });
});

req.on('error', (e) => console.log('❌ Error:', e.message));
req.write(data);
req.end();
