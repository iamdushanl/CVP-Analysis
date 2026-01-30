// Test different Gemini API endpoints and models
const https = require('https');

const apiKey = 'AIzaSyDq5KB52pOk6dFA8ZpPKmezKikQ6i64ASU';

const testConfigs = [
    { name: 'v1beta1/gemini-pro', path: '/v1beta1/models/gemini-pro:generateContent' },
    { name: 'v1/gemini-pro', path: '/v1/models/gemini-pro:generateContent' },
    { name: 'v1beta/gemini-pro', path: '/v1beta/models/gemini-pro:generateContent' },
    { name: 'v1beta1/gemini-1.5-flash', path: '/v1beta1/models/gemini-1.5-flash:generateContent' },
    { name: 'v1/gemini-1.5-flash', path: '/v1/models/gemini-1.5-flash:generateContent' },
    { name: 'v1beta1/gemini-1.5-pro', path: '/v1beta1/models/gemini-1.5-pro:generateContent' },
];

async function testEndpoint(name, path) {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            contents: [{ parts: [{ text: 'Hi' }] }]
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `${path}?key=${apiKey}`,
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
                console.log(`\n${name}:`);
                console.log(`  Status: ${res.statusCode}`);

                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(body);
                        if (response.candidates) {
                            console.log(`  ✅ WORKS!`);
                            console.log(`  Response: ${response.candidates[0].content.parts[0].text.substring(0, 50)}`);
                        }
                    } catch (e) {
                        console.log(`  ❌ Parse error: ${e.message}`);
                    }
                } else {
                    try {
                        const error = JSON.parse(body);
                        console.log(`  ❌ ${error.error?.message || 'Failed'}`);
                    } catch (e) {
                        console.log(`  ❌ Status ${res.statusCode} - ${body.substring(0, 100) || 'Empty response'}`);
                    }
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.log(`  ❌ Connection error: ${e.message}`);
            resolve();
        });

        req.write(data);
        req.end();
    });
}

async function runTests() {
    console.log('🔍 Testing Gemini API Endpoints...\n');
    console.log('='.repeat(70));

    for (const config of testConfigs) {
        await testEndpoint(config.name, config.path);
    }

    console.log('\n' + '='.repeat(70));
    console.log('Testing complete!');
}

runTests();
