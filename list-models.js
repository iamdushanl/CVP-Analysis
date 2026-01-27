const https = require('https');

const apiKey = 'AIzaSyAkI5jUx2J0TBmfBQFE8ARVwXwMxeOPXic';

function listModels(apiVersion) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/${apiVersion}/models?key=${apiKey}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        console.log(`\n📋 Listing models for API ${apiVersion}...`);

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (response.models) {
                        console.log(`\n✅ Found ${response.models.length} models:`);
                        response.models.forEach(model => {
                            console.log(`   - ${model.name}`);
                            if (model.supportedGenerationMethods) {
                                console.log(`     Methods: ${model.supportedGenerationMethods.join(', ')}`);
                            }
                        });
                        resolve(response.models);
                    } else if (response.error) {
                        console.log(`❌ Error: ${response.error.code} - ${response.error.message}`);
                        resolve([]);
                    }
                } catch (e) {
                    console.log(`❌ Parse error: ${e.message}`);
                    console.log('Response:', body);
                    resolve([]);
                }
            });
        });

        req.on('error', (e) => {
            console.log(`❌ Connection error: ${e.message}`);
            resolve([]);
        });

        req.end();
    });
}

async function main() {
    console.log('='.repeat(70));
    console.log('🔍 Checking available Gemini models for this API key');
    console.log('='.repeat(70));

    const v1Models = await listModels('v1');
    const v1betaModels = await listModels('v1beta');

    console.log('\n' + '='.repeat(70));
    console.log('Summary:');
    console.log(`  v1 models: ${v1Models.length}`);
    console.log(`  v1beta models: ${v1betaModels.length}`);
    console.log('='.repeat(70));
}

main();
