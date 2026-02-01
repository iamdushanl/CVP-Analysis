const https = require('https');
const apiKey = 'AIzaSyCDkEIVVfelEGroa9fIKpXP2peXEqYjluI';

function listModels(apiVersion) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/${apiVersion}/models?key=${apiKey}`,
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                console.log(`\nAPI Version: ${apiVersion}`);
                console.log(`Status: ${res.statusCode}\n`);
                if (res.statusCode === 200) {
                    const data = JSON.parse(body);
                    data.models.forEach(m => console.log(`  • ${m.name}`));
                } else {
                    console.log('Error:', body);
                }
                resolve();
            });
        });
        req.end();
    });
}

listModels('v1beta');
