const https = require('https');

const apiKey = 'AIzaSyCDkEIVVfelEGroa9fIKpXP2peXEqYjluI';

// Try different models to find one with available quota
const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-pro-latest',
    'gemini-flash-latest',
    'gemini-2.5-pro',
    'gemini-2.0-flash-lite'
];

const data = JSON.stringify({
    contents: [{
        parts: [{ text: 'Say OK' }]
    }]
});

function testModel(model, apiVersion = 'v1') {
    return new Promise((resolve) => {
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/${apiVersion}/models/${model}:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        console.log(`\nTesting: ${model} (${apiVersion})...`);

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (response.candidates && response.candidates[0]) {
                        console.log(`✅ SUCCESS! ${model} has available quota!`);
                        resolve({ success: true, model, apiVersion });
                    } else if (response.error) {
                        if (response.error.code === 429) {
                            console.log(`❌ Quota exhausted`);
                        } else {
                            console.log(`❌ Error: ${response.error.code} - ${response.error.status}`);
                        }
                        resolve({ success: false });
                    }
                } catch (e) {
                    console.log(`❌ Parse error`);
                    resolve({ success: false });
                }
            });
        });

        req.on('error', () => resolve({ success: false }));
        req.write(data);
        req.end();
    });
}

async function findWorkingModel() {
    console.log('='.repeat(70));
    console.log('🔍 Testing different models to find one with available quota...');
    console.log('='.repeat(70));

    // Try v1 API
    for (const model of modelsToTry) {
        const result = await testModel(model, 'v1');
        if (result.success) {
            console.log('\n' + '='.repeat(70));
            console.log('✅ FOUND WORKING MODEL WITH QUOTA!');
            console.log('='.repeat(70));
            console.log(`Model: ${result.model}`);
            console.log(`API Version: ${result.apiVersion}`);
            console.log(`\nUpdate chatbot-service.js line 51 to:`);
            console.log(`const API_URL = \`https://generativelanguage.googleapis.com/${result.apiVersion}/models/${result.model}:generateContent?key=\${this.apiKey}\`;`);
            console.log('='.repeat(70));
            return result;
        }
    }

    // Try v1beta API
    for (const model of modelsToTry) {
        const result = await testModel(model, 'v1beta');
        if (result.success) {
            console.log('\n' + '='.repeat(70));
            console.log('✅ FOUND WORKING MODEL WITH QUOTA!');
            console.log('='.repeat(70));
            console.log(`Model: ${result.model}`);
            console.log(`API Version: ${result.apiVersion}`);
            console.log(`\nUpdate chatbot-service.js line 51 to:`);
            console.log(`const API_URL = \`https://generativelanguage.googleapis.com/${result.apiVersion}/models/${result.model}:generateContent?key=\${this.apiKey}\`;`);
            console.log('='.repeat(70));
            return result;
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('❌ All models have exhausted quotas for this API key');
    console.log('='.repeat(70));
    console.log('\nPossible solutions:');
    console.log('1. Wait 24 hours for quota to reset');
    console.log('2. Create a new Google account and get a fresh API key');
    console.log('3. Enable billing to get higher quotas');
    console.log('='.repeat(70));
}

findWorkingModel();
