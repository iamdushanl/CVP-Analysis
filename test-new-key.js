const https = require('https');

// Test the new API key
const apiKey = 'AIzaSyCDkEIVVfelEGroa9fIKpXP2peXEqYjluI';

const data = JSON.stringify({
    contents: [{
        parts: [{ text: 'Say "Hello! I am your CVP Analysis assistant." in one sentence.' }]
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

console.log('🧪 Testing NEW API key with gemini-2.0-flash...\n');

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
        console.log('HTTP Status:', res.statusCode, '\n');
        try {
            const response = JSON.parse(body);
            if (response.candidates && response.candidates[0]) {
                console.log('='.repeat(70));
                console.log('✅ SUCCESS! NEW API KEY IS WORKING!');
                console.log('='.repeat(70));
                console.log('\nAI Response:');
                console.log(response.candidates[0].content.parts[0].text);
                console.log('\n' + '='.repeat(70));
                console.log('✅ CHATBOT IS NOW FULLY FUNCTIONAL!');
                console.log('✅ Refresh your browser to test it.');
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

req.on('error', (e) => console.log('❌ Error:', e.message));
req.write(data);
req.end();
