require('dotenv').config();
const fetch = require('node-fetch');

async function testOpenRouter() {
    const apiKey = process.env.OPENROUTER_API_KEY;    const model = 'meta-llama/llama-4-scout:free';
    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

    console.log('🔄 Testing OpenRouter API with Llama 4 Scout...');
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT FOUND');
    console.log('Model:', model);

    if (!apiKey) {
        console.error('❌ OPENROUTER_API_KEY not found in environment variables');
        return;
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'http://localhost:3001',
                'X-Title': 'Yuva Digital Studio Voice Bot',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI assistant for a photography studio. Respond briefly and naturally.'
                    },
                    {
                        role: 'user',
                        content: 'Hello, what services do you offer?'
                    }
                ],
                max_tokens: 150,
                temperature: 0.7,
                stream: false,
            }),
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ OpenRouter API error: ${response.status} ${response.statusText}`);
            console.error('Error details:', errorText);
            return;
        }

        const result = await response.json();
        console.log('✅ OpenRouter API response:');
        console.log('Full response:', JSON.stringify(result, null, 2));
        
        if (result.choices && result.choices[0] && result.choices[0].message) {
            console.log('🤖 AI Response:', result.choices[0].message.content);
        } else {
            console.warn('⚠️ Unexpected response format');
        }

    } catch (error) {
        console.error('❌ Error testing OpenRouter:', error.message);
        console.error('Stack:', error.stack);
    }
}

testOpenRouter();
