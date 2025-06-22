const fetch = require('node-fetch');

async function testOpenRouterLlama() {
  const API_KEY = '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';
  const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

  const payload = {
    model: 'meta-llama/llama-4-scout:free',
    messages: [
      {
        role: 'system',
        content: 'You are an AI assistant helping customers with photography services. Be helpful and concise.'
      },
      {
        role: 'user',
        content: 'Hello, I need information about wedding photography packages.'
      }
    ],
    temperature: 0.7,
    max_tokens: 150
  };

  console.log('Testing OpenRouter with DeepSeek R1...');
  console.log('API URL:', API_URL);
  console.log('Model:', payload.model);
  console.log('Request payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://voxbiz.ai',
        'X-Title': 'VoxBiz AI Voice Agent'
      },
      body: JSON.stringify(payload)
    });

    console.log('\nResponse status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('\nRaw response:', responseText);

    if (!response.ok) {
      console.error('Error response:', responseText);
      return;
    }

    const data = JSON.parse(responseText);
    console.log('\nParsed response:', JSON.stringify(data, null, 2));

    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('\n✅ SUCCESS! LLM Response:');
      console.log(data.choices[0].message.content);
    } else {
      console.log('\n❌ FAILED! No valid response content found');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

testOpenRouterLlama();
