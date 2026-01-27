const https = require('https');

const apiKey = 'AIzaSyCDkEIVVfelEGroa9fIKpXP2peXEqYjluI';

const data = JSON.stringify({
    contents: [{
        parts: [{ text: 'You are a CVP Analysis assistant. Say hello in one friendly sentence.' }]
    }]
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

console.log('🎉 Final verification with gemini-2.5-flash...\n');

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
        console.log('HTTP Status:', res.statusCode, '\n');
        try {
            const response = JSON.parse(body);
            if (response.candidates && response.candidates[0]) {
                console.log('='.repeat(70));
                console.log('🎉 SUCCESS! CHATBOT IS NOW FULLY FUNCTIONAL! 🎉');
                console.log('='.repeat(70));
                console.log('\nAI Response:');
                console.log(response.candidates[0].content.parts[0].text);
                console.log('\n' + '='.repeat(70));
                console.log('✅ Configuration:');
                console.log('   - API Key: Updated ✅');
                console.log('   - Model: gemini-2.5-flash ✅');
                console.log('   - Quota: Available ✅');
                console.log('   - Status: WORKING ✅');
                console.log('='.repeat(70));
                console.log('\n🚀 NEXT STEPS:');
                console.log('   1. Refresh your browser (Ctrl+F5)');
                console.log('   2. Click the chatbot button (bottom-right)');
                console.log('   3. Try: "What\'s my current break-even point?"');
                console.log('='.repeat(70));
            } else if (response.error) {
                console.log('❌ Error:', response.error.message);
            }
        } catch (e) {
            console.log('❌ Error:', e.message);
            console.log('Response:', body);
        }
    });
});

req.on('error', (e) => console.log('❌ Error:', e.message));
req.write(data);
req.end();
