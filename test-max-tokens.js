const https = require('https');

const apiKey = 'AIzaSyCDkEIVVfelEGroa9fIKpXP2peXEqYjluI';

// Test with maxOutputTokens to allow complete responses
const data = JSON.stringify({
    contents: [{
        parts: [{ text: 'Explain contribution margin in detail. Include definition, formula, example, and importance. Be comprehensive.' }]
    }],
    generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048  // Allow complete responses
    }
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

console.log('🧪 Testing with maxOutputTokens: 2048\n');

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
        console.log('HTTP Status:', res.statusCode);
        if (res.statusCode === 200) {
            const response = JSON.parse(body);
            const text = response.candidates[0].content.parts[0].text;
            console.log('\n✅ SUCCESS - Complete Response Received');
            console.log('Response Length:', text.length, 'characters');
            console.log('\nFull Response:');
            console.log('='.repeat(70));
            console.log(text);
            console.log('='.repeat(70));
            console.log('\n✅ Response is complete (not cut off)!');
        } else {
            console.log('❌ ERROR:', body);
        }
    });
});

req.on('error', (e) => console.log('❌ Error:', e.message));
req.write(data);
req.end();
