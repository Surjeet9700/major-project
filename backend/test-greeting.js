const fetch = require('node-fetch');

async function testGreeting() {
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch('http://localhost:3001/api/voice/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: `greeting-test-${i}`,
          userInput: 'Hello',
          language: 'en'
        })
      });

      const result = await response.json();
      console.log(`Greeting ${i + 1}:`, result.data.response);
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

testGreeting();
