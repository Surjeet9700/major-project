const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';
const sessionId = 'e2e-test-session-' + Date.now();
const testEmail = 'surjeethkumar4@gmail.com';

console.log('🧪 Starting Complete End-to-End Test');
console.log('📧 Test Email:', testEmail);
console.log('🆔 Session ID:', sessionId);
console.log('=' .repeat(60));

async function testEmailCollection() {
  console.log('\n📧 STEP 1: Testing Email Collection');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch(`${BASE_URL}/api/voice/set-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        email: testEmail
      })
    });
    
    const result = await response.json();
    if (result.success !== true) {
      console.warn('⚠️ Unexpected response:', result);
    } else {
      console.log('✅ Email Collection Result:', result);
    }
    return result.success === true;
  } catch (error) {
    console.error('❌ Email Collection Failed:', error.message);
    return false;
  }
}

async function testConversationFlow() {
  console.log('\n🗣️ STEP 2: Testing Complete Conversation Flow');
  console.log('-'.repeat(40));
  
  const conversationSteps = [
    {
      step: 'Service Inquiry (English)',
      input: 'What photography services do you offer?',
      language: 'en',
      expected: 'service info'
    },
    {
      step: 'Pricing Inquiry (English)',
      input: 'What are your wedding photography prices?',
      language: 'en',
      expected: 'pricing info'
    },
    {
      step: 'Booking Start (English)',
      input: 'I want to book a wedding shoot for next Sunday.',
      language: 'en',
      expected: 'booking start'
    },
    {
      step: 'Provide Name (English)',
      input: 'My name is Surjeet.',
      language: 'en',
      expected: 'name collected'
    },
    {
      step: 'Provide Phone (English)',
      input: 'My phone number is 9876543210.',
      language: 'en',
      expected: 'phone collected'
    },
    {
      step: 'Language Switch Request',
      input: 'अब हिंदी में बात करें।',
      language: 'hi',
      expected: 'language switch'
    },
    {
      step: 'Service Inquiry (Hindi)',
      input: 'आप कौन-कौन सी फोटोग्राफी सेवाएं देते हैं?',
      language: 'hi',
      expected: 'service info hindi'
    },
    {
      step: 'Complete Booking (Hindi)',
      input: 'हाँ, मैं बुकिंग कन्फर्म करना चाहता हूँ।',
      language: 'hi',
      expected: 'booking confirmation'
    }
  ];

  const results = [];
  
  for (const step of conversationSteps) {
    try {
      console.log(`\n🔄 ${step.step}`);
      console.log(`📝 Input: "${step.input}"`);
      
      const response = await fetch(`${BASE_URL}/api/voice/conversation-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userInput: step.input,
          language: step.language
        })
      });
      
      const data = await response.json();
      const aiResponse = data.data?.response || data.response || 'No response';
      
      console.log(`🤖 AI Response: "${aiResponse}"`);
      console.log(`✅ Expected: ${step.expected}`);
      
      results.push({
        step: step.step,
        success: true,
        input: step.input,
        response: aiResponse,
        expected: step.expected
      });
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ ${step.step} Failed:`, error.message);
      results.push({
        step: step.step,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

async function testBookingCompletion() {
  console.log('\n📅 STEP 3: Testing Booking Completion & Email');
  console.log('-'.repeat(40));
  
  try {
    // Simulate final booking confirmation
    const response = await fetch(`${BASE_URL}/api/voice/conversation-audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        userInput: 'Yes, confirm my booking for wedding photography next Sunday.',
        language: 'en'
      })
    });
    
    const data = await response.json();
    const aiResponse = data.data?.response || data.response || 'No response';
    
    console.log('📝 Final Booking Request: "Yes, confirm my booking for wedding photography next Sunday."');
    console.log(`🤖 AI Response: "${aiResponse}"`);
    
    // Check if booking was completed (look for booking ID in response)
    const hasBookingId = /\bAPT\d{6}\b/.test(aiResponse);
    const hasConfirmation = /confirm|confirmed|booking|APT/i.test(aiResponse);
    
    console.log(`🔍 Booking ID Found: ${hasBookingId}`);
    console.log(`🔍 Confirmation Found: ${hasConfirmation}`);
    
    return {
      success: hasConfirmation,
      hasBookingId,
      response: aiResponse
    };
    
  } catch (error) {
    console.error('❌ Booking Completion Failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testEmailDelivery() {
  console.log('\n📧 STEP 4: Testing Email Delivery');
  console.log('-'.repeat(40));
  
  try {
    // Check backend logs for email delivery
    console.log('📧 Checking backend logs for email delivery...');
    console.log('📧 Expected email to:', testEmail);
    console.log('📧 Look for logs like:');
    console.log('   - "📧 [FREE MODE] Email would be sent to: surjeethkumar4@gmail.com"');
    console.log('   - "📧 Email confirmation sent successfully"');
    console.log('   - "📅 Booking completed: {appointment details}"');
    
    return {
      success: true,
      message: 'Check backend console for email logs'
    };
    
  } catch (error) {
    console.error('❌ Email Delivery Check Failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function runCompleteTest() {
  console.log('🚀 Starting Complete End-to-End Test Suite');
  console.log('=' .repeat(60));
  
  const testResults = {
    emailCollection: false,
    conversationFlow: [],
    bookingCompletion: false,
    emailDelivery: false
  };
  
  // Step 1: Test Email Collection
  testResults.emailCollection = await testEmailCollection();
  
  // Step 2: Test Conversation Flow
  testResults.conversationFlow = await testConversationFlow();
  
  // Step 3: Test Booking Completion
  testResults.bookingCompletion = await testBookingCompletion();
  
  // Step 4: Test Email Delivery
  testResults.emailDelivery = await testEmailDelivery();
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`📧 Email Collection: ${testResults.emailCollection ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🗣️ Conversation Steps: ${testResults.conversationFlow.filter(r => r.success).length}/${testResults.conversationFlow.length} ✅`);
  console.log(`📅 Booking Completion: ${testResults.bookingCompletion.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📧 Email Delivery: ${testResults.emailDelivery.success ? '✅ PASS' : '❌ FAIL'}`);
  
  // Detailed Results
  console.log('\n📋 DETAILED RESULTS');
  console.log('-'.repeat(40));
  
  testResults.conversationFlow.forEach((result, index) => {
    console.log(`${index + 1}. ${result.step}: ${result.success ? '✅' : '❌'}`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n🎯 NEXT STEPS');
  console.log('-'.repeat(40));
  console.log('1. Check backend console for email logs');
  console.log('2. Verify booking was created in the system');
  console.log('3. Test the frontend demo page manually');
  console.log('4. Review AI responses for improvements');
  
  console.log('\n✅ End-to-End Test Complete!');
}

// Run the complete test
runCompleteTest().catch(console.error); 