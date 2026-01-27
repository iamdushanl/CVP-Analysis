const https = require('https');

// Test different Gemini models to find which one works
const apiKey = 'AIzaSyAkI5jUx2J0TBmfBQFE8ARVwXwMxeOPXic';

const modelsToTest = [
    'gemini-1.5-pro',
    'gemini-1.5-flash-latest',
    'gemini-pro',
    'gemini-1.0-pro'
];

const data = JSON.stringify({
    contents: [{
        parts: [{ text: 'Reply with just OK' }]
    }]
});

function testModel(modelName, useV1 = false) {
    return new Promise((resolve) => {
        const apiVersion = useV1 ? 'v1' : 'v1beta';
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        console.log(`\nTesting: ${apiVersion}/models/${modelName}`);

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (response.candidates && response.candidates[0]) {
                        console.log(`✅ SUCCESS! Model: ${modelName} with API: ${apiVersion}`);
                        resolve({ success: true, model: modelName, apiVersion });
                    } else if (response.error) {
                        console.log(`❌ Error: ${response.error.code} - ${response.error.message}`);
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
    console.log('🔍 Searching for working Gemini model...\n');
    console.log('='.repeat(70));

    // Test v1 API first
    for (const model of modelsToTest) {
        const result = await testModel(model, true);
        if (result.success) {
            console.log('='.repeat(70));
            console.log(`\n✅ FOUND WORKING MODEL!`);
            console.log(`   Model: ${result.model}`);
            console.log(`   API Version: ${result.apiVersion}`);
            console.log(`   URL: https://generativelanguage.googleapis.com/${result.apiVersion}/models/${result.model}:generateContent`);
            return;
        }
    }

    // Test v1beta API
    for (const model of modelsToTest) {
        const result = await testModel(model, false);
        if (result.success) {
            console.log('='.repeat(70));
            console.log(`\n✅ FOUND WORKING MODEL!`);
            console.log(`   Model: ${result.model}`);
            console.log(`   API Version: ${result.apiVersion}`);
            console.log(`   URL: https://generativelanguage.googleapis.com/${result.apiVersion}/models/${result.model}:generateContent`);
            return;
        }
    }

    console.log('\n❌ No working model found');
}

findWorkingModel();
