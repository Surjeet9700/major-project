const fetch = require('node-fetch');

async function testServiceInquiry() {
  try {
    const response = await fetch('http://localhost:3001/api/voice/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: 'service-test-123',
        userInput: 'Hello, what services do you offer?',
        language: 'en'
      })
    });

    const result = await response.json();
    console.log('Service inquiry response:', result.data.response);
    console.log('Should detect as services_info, not greeting');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testServiceInquiry();
