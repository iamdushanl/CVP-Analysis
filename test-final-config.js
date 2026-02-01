// Test the exact configuration we'll use in chatbot-service.js
const https = require('https');

const apiKey = 'AIzaSyCpdpG1a-rKEMSKwImxUImMQ7V-00LXrY4';
const modelName = 'gemini-1.5-flash';
const apiVersion = 'v1beta';

console.log('🧪 Testing Final Configuration...\n');
console.log(`API Version: ${apiVersion}`);
console.log(`Model: ${modelName}`);
console.log(`Key: ${apiKey.substring(0, 20)}...`);
console.log('\n' + '='.repeat(70));

const data = JSON.stringify({
    contents: [{
        role: 'user',
        parts: [{ text: 'Say hello in one sentence' }]
    }],
    generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
    }
});

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`,
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
        console.log(`\nStatus Code: ${res.statusCode}\n`);

        if (res.statusCode === 200) {
            try {
                const response = JSON.parse(body);
                if (response.candidates && response.candidates[0]) {
                    console.log('✅ SUCCESS! Configuration is working!\n');
                    console.log('AI Response:', response.candidates[0].content.parts[0].text);
                    console.log('\n' + '='.repeat(70));
                    console.log('✅ This configuration will work for the chatbot!');
                    console.log('='.repeat(70));
                }
            } catch (e) {
                console.log('❌ Parse error:', e.message);
                console.log('Body:', body);
            }
        } else {
            console.log('❌ FAILED\n');
            try {
                const error = JSON.parse(body);
                console.log('Error:', JSON.stringify(error, null, 2));
            } catch (e) {
                console.log('Raw response:', body);
            }
        }
    });
});

req.on('error', (e) => {
    console.log('❌ Connection error:', e.message);
});

req.write(data);
req.end();
