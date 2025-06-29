const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const TEST_SESSION_ID = 'test-session-' + Date.now();
const TEST_EMAIL = 'surjeethkumar4@gmail.com';

// Test cases for conversation flow and edge cases
const testCases = [
  // Edge case 1: Very short input
  {
    name: "Very short input",
    input: "hi",
    language: "en",
    expectedIntent: "greeting"
  },
  
  // Edge case 2: Incomplete sentence ending with 'of'
  {
    name: "Incomplete sentence ending with 'of'",
    input: "modern solution of",
    language: "en",
    expectedIntent: "clarification"
  },
  
  // Edge case 3: Incomplete sentence ending with 'the'
  {
    name: "Incomplete sentence ending with 'the'",
    input: "what are the",
    language: "en",
    expectedIntent: "clarification"
  },
  
  // Edge case 4: Sources of (from your example)
  {
    name: "Sources of (incomplete)",
    input: "what are the sources of",
    language: "en",
    expectedIntent: "clarification"
  },
  
  // Edge case 5: Single word without context
  {
    name: "Single word without context",
    input: "solution",
    language: "en",
    expectedIntent: "clarification"
  },
  
  // Edge case 6: Just question words
  {
    name: "Just question words",
    input: "what",
    language: "en",
    expectedIntent: "clarification"
  },
  
  // Edge case 7: Booking flow - name
  {
    name: "Booking flow - name",
    input: "my name is John",
    language: "en",
    expectedIntent: "booking_continue"
  },
  
  // Edge case 8: Booking flow - phone
  {
    name: "Booking flow - phone",
    input: "my phone number is 9876543210",
    language: "en",
    expectedIntent: "booking_service"
  },
  
  // Edge case 9: Booking flow - service
  {
    name: "Booking flow - service",
    input: "I want wedding photography",
    language: "en",
    expectedIntent: "service_specific"
  },
  
  // Edge case 10: Hindi incomplete sentence
  {
    name: "Hindi incomplete sentence",
    input: "मैं चाहता हूं",
    language: "hi",
    expectedIntent: "clarification"
  },
  
  // Edge case 11: Hindi booking flow
  {
    name: "Hindi booking flow",
    input: "मेरा नाम रमेश है",
    language: "hi",
    expectedIntent: "booking_continue"
  },
  
  // Edge case 12: Mixed language input
  {
    name: "Mixed language input",
    input: "I want शादी की फोटो",
    language: "en",
    expectedIntent: "service_specific"
  },
  
  // Edge case 13: Speech artifacts
  {
    name: "Speech artifacts",
    input: "um hello uh I want to book um an appointment",
    language: "en",
    expectedIntent: "booking"
  },
  
  // Edge case 14: Very long input
  {
    name: "Very long input",
    input: "I want to book a wedding photography session for my daughter's wedding which is happening next month and I need to know the pricing and availability and also what services are included in the package",
    language: "en",
    expectedIntent: "booking"
  },
  
  // Edge case 15: Empty input
  {
    name: "Empty input",
    input: "",
    language: "en",
    expectedIntent: "clarification"
  },
  
  // Edge case 16: Only spaces
  {
    name: "Only spaces",
    input: "   ",
    language: "en",
    expectedIntent: "clarification"
  },
  
  // Edge case 17: Numbers only
  {
    name: "Numbers only",
    input: "1234567890",
    language: "en",
    expectedIntent: "booking_service"
  },
  
  // Edge case 18: Special characters
  {
    name: "Special characters",
    input: "!@#$%^&*()",
    language: "en",
    expectedIntent: "clarification"
  }
];

async function testConversationFlow() {
  console.log('🧪 Starting Conversation Flow and Edge Cases Test');
  console.log('=' .repeat(60));
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📋 Test ${i + 1}: ${testCase.name}`);
    console.log(`Input: "${testCase.input}"`);
    console.log(`Language: ${testCase.language}`);
    console.log(`Expected Intent: ${testCase.expectedIntent}`);
    
    try {
      const response = await axios.post(`${BASE_URL}/api/voice/conversation-audio`, {
        sessionId: TEST_SESSION_ID,
        userInput: testCase.input,
        language: testCase.language
      });
      
      const data = response.data;
      const actualIntent = data.data?.response?.intent || 'unknown';
      const actualResponse = data.data?.response?.response || 'No response';
      
      console.log(`Actual Intent: ${actualIntent}`);
      console.log(`Actual Response: ${actualResponse}`);
      
      if (actualIntent === testCase.expectedIntent) {
        console.log('✅ PASSED');
        passedTests++;
      } else {
        console.log('❌ FAILED - Intent mismatch');
        failedTests++;
      }
      
      // Check if response is meaningful
      if (actualResponse && actualResponse.length > 5) {
        console.log('✅ Response is meaningful');
      } else {
        console.log('⚠️  Response might be too short');
      }
      
    } catch (error) {
      console.log('❌ FAILED - API Error');
      console.log(`Error: ${error.message}`);
      failedTests++;
    }
    
    // Add delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Test Results Summary');
  console.log(`Total Tests: ${testCases.length}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / testCases.length) * 100).toFixed(2)}%`);
  
  if (failedTests > 0) {
    console.log('\n🔧 Recommendations:');
    console.log('- Review failed test cases');
    console.log('- Improve intent detection logic');
    console.log('- Enhance response generation for edge cases');
  } else {
    console.log('\n🎉 All tests passed! The conversation flow is robust.');
  }
}

// Test conversation continuity with email
async function testConversationContinuityWithEmail() {
  console.log('\n🔄 Testing Conversation Continuity with Email');
  console.log('=' .repeat(60));
  
  const sessionId = 'continuity-email-test-' + Date.now();
  
  try {
    // Step 1: Set email for the session
    console.log('\n📧 Step 1: Setting email for session...');
    await axios.post(`${BASE_URL}/api/voice/set-email`, {
      sessionId,
      email: TEST_EMAIL
    });
    console.log('✅ Email set successfully');
    
    // Step 2: Complete booking flow
    const conversationSteps = [
      { input: "hello", expected: "greeting", step: "Greeting" },
      { input: "I want to book", expected: "booking", step: "Booking intent" },
      { input: "my name is Alice", expected: "booking_continue", step: "Name provided" },
      { input: "my phone is 9876543210", expected: "booking_service", step: "Phone provided" },
      { input: "wedding photography", expected: "service_specific", step: "Service selected" },
      { input: "2024-07-15", expected: "booking_continue", step: "Date provided" },
      { input: "2:00 PM", expected: "booking_continue", step: "Time provided" }
    ];
    
    for (let i = 0; i < conversationSteps.length; i++) {
      const step = conversationSteps[i];
      console.log(`\n📋 ${step.step}: "${step.input}"`);
      
      try {
        const response = await axios.post(`${BASE_URL}/api/voice/conversation-audio`, {
          sessionId: sessionId,
          userInput: step.input,
          language: "en"
        });
        
        const actualIntent = response.data.data?.response?.intent || 'unknown';
        const actualResponse = response.data.data?.response?.response || 'No response';
        
        console.log(`Expected: ${step.expected}, Got: ${actualIntent}`);
        console.log(`Response: ${actualResponse}`);
        
        if (actualIntent === step.expected) {
          console.log('✅ Step passed');
        } else {
          console.log('❌ Step failed');
        }
        
      } catch (error) {
        console.log(`❌ Step failed: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📧 Email should have been triggered for booking confirmation');
    console.log('Check backend logs for email generation');
    
  } catch (error) {
    console.log(`❌ Email continuity test failed: ${error.message}`);
  }
}

// Test email functionality directly
async function testEmailFunctionality() {
  console.log('\n📧 Testing Email Functionality Directly');
  console.log('=' .repeat(60));
  
  const sessionId = 'email-test-' + Date.now();
  
  try {
    // Set email
    console.log('\n📧 Setting email...');
    await axios.post(`${BASE_URL}/api/voice/set-email`, {
      sessionId,
      email: TEST_EMAIL
    });
    console.log('✅ Email set');
    
    // Simulate complete booking data
    console.log('\n📧 Simulating booking completion...');
    const bookingData = {
      sessionId,
      userInput: "Complete my booking with all details",
      language: "en"
    };
    
    const response = await axios.post(`${BASE_URL}/api/voice/conversation-audio`, bookingData);
    console.log('✅ Booking simulation completed');
    console.log('Response:', response.data.data?.response?.response);
    
    console.log('\n📧 Check backend logs for email generation');
    console.log('Email should be logged in development mode');
    
  } catch (error) {
    console.log(`❌ Email test failed: ${error.message}`);
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testConversationFlow();
    await testConversationContinuityWithEmail();
    await testEmailFunctionality();
  } catch (error) {
    console.error('Test execution failed:', error.message);
  }
}

// Export for use in other files
module.exports = {
  testConversationFlow,
  testConversationContinuityWithEmail,
  testEmailFunctionality,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
} 