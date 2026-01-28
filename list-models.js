// List available Gemini models
const https = require('https');

const apiKey = 'AIzaSyDq5KB52pOk6dFA8ZpPKmezKikQ6i64ASU';

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
                console.log(`\n${'='.repeat(70)}`);
                console.log(`API Version: ${apiVersion}`);
                console.log('='.repeat(70));
                console.log(`Status: ${res.statusCode}\n`);

                if (res.statusCode === 200) {
                    try {
                        const data = JSON.parse(body);
                        if (data.models && data.models.length > 0) {
                            console.log(`Found ${data.models.length} models:\n`);
                            data.models.forEach(model => {
                                console.log(`  • ${model.name}`);
                                if (model.supportedGenerationMethods) {
                                    console.log(`    Methods: ${model.supportedGenerationMethods.join(', ')}`);
                                }
                            });
                        } else {
                            console.log('No models found');
                        }
                    } catch (e) {
                        console.log('Parse error:', e.message);
                    }
                } else {
                    try {
                        const error = JSON.parse(body);
                        console.log('Error:', error.error?.message || body);
                    } catch (e) {
                        console.log('Raw response:', body.substring(0, 200));
                    }
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.log('Connection error:', e.message);
            resolve();
        });

        req.end();
    });
}

async function run() {
    console.log('🔍 Listing Available Gemini Models...\n');

    await listModels('v1');
    await listModels('v1beta');
    await listModels('v1beta1');

    console.log('\n' + '='.repeat(70));
    console.log('Complete!');
    console.log('='.repeat(70));
}

run();
