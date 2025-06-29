const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = 'surjeethkumar4@gmail.com';

async function testResponseOnly() {
  console.log('🧪 Testing Conversation Responses (No TTS)');
  console.log('=' .repeat(60));
  
  const sessionId = 'response-test-' + Date.now();
  
  try {
    // Set email first
    console.log('\n📧 Setting email for session...');
    await axios.post(`${BASE_URL}/api/voice/set-email`, {
      sessionId,
      email: TEST_EMAIL
    });
    console.log('✅ Email set successfully');
    
    // Test conversation flow without TTS
    const testInputs = [
      { input: "hello", description: "Greeting" },
      { input: "I want to book photography", description: "Booking intent" },
      { input: "my name is Surjeet Kumar", description: "Name provided" },
      { input: "my phone number is 9876543210", description: "Phone provided" },
      { input: "wedding photography", description: "Service selected" },
      { input: "July 15th 2024", description: "Date provided" },
      { input: "2:00 PM", description: "Time provided" }
    ];
    
    for (let i = 0; i < testInputs.length; i++) {
      const test = testInputs[i];
      console.log(`\n📋 Test ${i + 1}: ${test.description}`);
      console.log(`Input: "${test.input}"`);
      
      try {
        const response = await axios.post(`${BASE_URL}/api/voice/conversation-audio`, {
          sessionId,
          userInput: test.input,
          language: "en"
        });
        
        const data = response.data;
        const aiResponse = data.data?.response?.response || 'No response';
        const intent = data.data?.response?.intent || 'unknown';
        const nextAction = data.data?.response?.nextAction || 'none';
        
        console.log(`✅ AI Response: ${aiResponse}`);
        console.log(`📊 Intent: ${intent}`);
        console.log(`🔄 Next Action: ${nextAction}`);
        
        // Check if response is meaningful
        if (aiResponse && aiResponse.length > 10) {
          console.log('✅ Response is meaningful and complete');
        } else {
          console.log('⚠️  Response might be too short');
        }
        
      } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
      }
      
      // Short delay between tests
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('\n📧 Email functionality test completed');
    console.log('Check backend logs for email generation');
    
  } catch (error) {
    console.log(`❌ Response test failed: ${error.message}`);
  }
}

async function testEdgeCases() {
  console.log('\n🧪 Testing Edge Cases (Response Only)');
  console.log('=' .repeat(60));
  
  const sessionId = 'edge-test-' + Date.now();
  
  const edgeCases = [
    { input: "modern solution of", description: "Incomplete sentence" },
    { input: "what are the sources of", description: "Incomplete question" },
    { input: "um hello uh I want to book", description: "Speech artifacts" },
    { input: "", description: "Empty input" },
    { input: "   ", description: "Only spaces" },
    { input: "!@#$%^&*()", description: "Special characters" },
    { input: "1234567890", description: "Numbers only" }
  ];
  
  for (let i = 0; i < edgeCases.length; i++) {
    const test = edgeCases[i];
    console.log(`\n📋 Edge Case ${i + 1}: ${test.description}`);
    console.log(`Input: "${test.input}"`);
    
    try {
      const response = await axios.post(`${BASE_URL}/api/voice/conversation-audio`, {
        sessionId,
        userInput: test.input,
        language: "en"
      });
      
      const data = response.data;
      const aiResponse = data.data?.response?.response || 'No response';
      const intent = data.data?.response?.intent || 'unknown';
      
      console.log(`✅ AI Response: ${aiResponse}`);
      console.log(`📊 Intent: ${intent}`);
      
      // Check if edge case was handled gracefully
      if (aiResponse && aiResponse.length > 5) {
        console.log('✅ Edge case handled gracefully');
      } else {
        console.log('⚠️  Edge case might need better handling');
      }
      
    } catch (error) {
      console.log(`❌ Edge case failed: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

async function runResponseTests() {
  try {
    await testResponseOnly();
    await testEdgeCases();
    console.log('\n🎉 All response tests completed!');
  } catch (error) {
    console.error('Test execution failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runResponseTests();
}

module.exports = {
  testResponseOnly,
  testEdgeCases,
  runResponseTests
}; 