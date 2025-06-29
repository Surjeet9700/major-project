const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api/voice/conversation-audio';
const sessionId = 'test-session-' + Date.now();

const testCases = [
  {
    description: 'Service info (English)',
    input: 'What photography services do you offer?',
    language: 'en',
  },
  {
    description: 'Pricing inquiry (English)',
    input: 'What are your wedding photography prices?',
    language: 'en',
  },
  {
    description: 'Booking start (English)',
    input: 'I want to book a wedding shoot for next Sunday.',
    language: 'en',
  },
  {
    description: 'Provide name (English)',
    input: 'My name is Rahul.',
    language: 'en',
  },
  {
    description: 'Provide phone (English)',
    input: 'My phone number is 9876543210.',
    language: 'en',
  },
  {
    description: 'Switch to Hindi',
    input: 'अब हिंदी में बात करें।',
    language: 'hi',
  },
  {
    description: 'Service info (Hindi)',
    input: 'आप कौन-कौन सी फोटोग्राफी सेवाएं देते हैं?',
    language: 'hi',
  },
  {
    description: 'Pricing inquiry (Hindi)',
    input: 'शादी की फोटोग्राफी की कीमत क्या है?',
    language: 'hi',
  },
  {
    description: 'Booking start (Hindi)',
    input: 'मैं अगले रविवार के लिए शादी की बुकिंग करना चाहता हूँ।',
    language: 'hi',
  },
  {
    description: 'Provide name (Hindi)',
    input: 'मेरा नाम सुरजीत है।',
    language: 'hi',
  },
  {
    description: 'Provide phone (Hindi)',
    input: 'मेरा नंबर 9876543210 है।',
    language: 'hi',
  },
];

async function runTest() {
  for (const test of testCases) {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        userInput: test.input,
        language: test.language,
      }),
    });
    const data = await res.json();
    console.log(`\n[${test.description}]`);
    console.log('User:', test.input);
    console.log('AI:', data.data?.response || data.response || data);
  }
}

runTest().catch(console.error); 