const fetch = require('node-fetch');

async function testAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/voice/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: 'test-123',
        userInput: 'Hello, what services do you offer?',
        language: 'en'
      })
    });

    const result = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
