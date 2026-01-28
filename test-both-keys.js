// Direct API Test for Gemini
const https = require('https');

console.log('🔍 Testing both API keys...\n');

const keys = [
    { name: 'Key from test-api.js', key: 'AIzaSyDq5KB52pOk6dFA8ZpPKmezKikQ6i64ASU' },
    { name: 'Original key', key: 'AIzaSyCDkEIVVfelEGroa9fIKpXP2peXEqYjluI' }
];

async function testKey(name, apiKey) {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            contents: [{ parts: [{ text: 'Hello' }] }]
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

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                console.log(`\n${'='.repeat(70)}`);
                console.log(`Testing: ${name}`);
                console.log('='.repeat(70));
                console.log(`Status Code: ${res.statusCode}`);

                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(body);
                        if (response.candidates && response.candidates[0]) {
                            console.log('✅ SUCCESS! API key is valid and working!');
                            console.log('Response:', response.candidates[0].content.parts[0].text);
                        }
                    } catch (e) {
                        console.log('❌ Parse error:', e.message);
                    }
                } else {
                    console.log('❌ FAILED');
                    try {
                        const error = JSON.parse(body);
                        console.log('Error:', JSON.stringify(error, null, 2));
                    } catch (e) {
                        console.log('Raw response:', body);
                    }
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.log('❌ Connection error:', e.message);
            resolve();
        });

        req.write(data);
        req.end();
    });
}

async function runTests() {
    for (const keyInfo of keys) {
        await testKey(keyInfo.name, keyInfo.key);
    }
    console.log('\n' + '='.repeat(70));
    console.log('Testing complete!');
    console.log('='.repeat(70));
}

runTests();
