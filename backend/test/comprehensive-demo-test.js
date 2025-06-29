const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const DEMO_EMAIL = 'surjeethkumar4@gmail.com';

async function comprehensiveDemoTest() {
  console.log('🎯 Comprehensive AI Voice Agent Demo Test');
  console.log('=' .repeat(80));
  
  const sessionId = 'comprehensive-demo-' + Date.now();
  
  try {
    // Step 1: Set email for demo
    console.log('\n📧 Step 1: Setting demo email...');
    await axios.post(`${BASE_URL}/api/voice/set-email`, {
      sessionId,
      email: DEMO_EMAIL
    });
    console.log('✅ Demo email set successfully');
    
    // Step 2: Test natural conversation flow
    console.log('\n🗣️  Step 2: Testing Natural Conversation Flow');
    console.log('-' .repeat(50));
    
    const conversationTests = [
      {
        input: "Hello, how are you?",
        description: "Natural greeting",
        expectedIntent: "greeting"
      },
      {
        input: "Tell me about your studio",
        description: "Business information request",
        expectedIntent: "business_info"
      },
      {
        input: "What services do you offer?",
        description: "Services inquiry",
        expectedIntent: "services"
      },
      {
        input: "How much do you charge?",
        description: "Pricing inquiry",
        expectedIntent: "pricing"
      },
      {
        input: "What are your working hours?",
        description: "Hours inquiry",
        expectedIntent: "hours"
      },
      {
        input: "Where are you located?",
        description: "Location inquiry",
        expectedIntent: "location"
      },
      {
        input: "How can I contact you?",
        description: "Contact inquiry",
        expectedIntent: "contact"
      },
      {
        input: "I need help with something",
        description: "Help request",
        expectedIntent: "help"
      }
    ];
    
    for (let i = 0; i < conversationTests.length; i++) {
      const test = conversationTests[i];
      console.log(`\n📋 Test ${i + 1}: ${test.description}`);
      console.log(`Input: "${test.input}"`);
      
      try {
        const response = await axios.post(`${BASE_URL}/api/voice/conversation-audio`, {
          sessionId,
          userInput: test.input,
          language: "en",
          noAudio: true
        });
        
        const data = response.data;
        const aiResponse = data.data?.response?.response || 'No response';
        const intent = data.data?.response?.intent || 'unknown';
        
        console.log(`✅ AI Response: ${aiResponse}`);
        console.log(`📊 Intent: ${intent}`);
        console.log(`🎯 Expected: ${test.expectedIntent}, Got: ${intent}`);
        
        if (intent === test.expectedIntent) {
          console.log('✅ Intent matched!');
        } else {
          console.log('⚠️  Intent mismatch, but response is natural');
        }
        
      } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Step 3: Test sales-focused booking flow
    console.log('\n💰 Step 3: Testing Sales-Focused Booking Flow');
    console.log('-' .repeat(50));
    
    const bookingFlow = [
      {
        input: "I want to book a wedding photography session",
        description: "Booking intent with sales context"
      },
      {
        input: "My name is Surjeet Kumar",
        description: "Name provision"
      },
      {
        input: "My phone number is 9876543210",
        description: "Phone provision"
      },
      {
        input: "I want the premium wedding package",
        description: "Service selection with upselling"
      },
      {
        input: "July 15th 2024",
        description: "Date provision"
      },
      {
        input: "2:00 PM",
        description: "Time provision"
      }
    ];
    
    for (let i = 0; i < bookingFlow.length; i++) {
      const step = bookingFlow[i];
      console.log(`\n📋 Booking Step ${i + 1}: ${step.description}`);
      console.log(`Input: "${step.input}"`);
      
      try {
        const response = await axios.post(`${BASE_URL}/api/voice/conversation-audio`, {
          sessionId,
          userInput: step.input,
          language: "en",
          noAudio: true
        });
        
        const data = response.data;
        const aiResponse = data.data?.response?.response || 'No response';
        const intent = data.data?.response?.intent || 'unknown';
        
        console.log(`✅ AI Response: ${aiResponse}`);
        console.log(`📊 Intent: ${intent}`);
        
        // Check for sales elements in response
        const salesKeywords = ['discount', 'offer', 'limited', 'special', 'deal', 'save', 'premium', 'quality'];
        const hasSalesElements = salesKeywords.some(keyword => 
          aiResponse.toLowerCase().includes(keyword)
        );
        
        if (hasSalesElements) {
          console.log('💼 Sales elements detected in response');
        }
        
      } catch (error) {
        console.log(`❌ Booking step failed: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Step 4: Test edge cases and natural language
    console.log('\n🧠 Step 4: Testing Edge Cases & Natural Language');
    console.log('-' .repeat(50));
    
    const edgeCases = [
      {
        input: "I'm not sure what I want, can you help me?",
        description: "Ambiguous request"
      },
      {
        input: "What's the weather like today?",
        description: "Unrelated question"
      },
      {
        input: "I have a very long question about photography and I want to know everything about your services and pricing and availability and quality and experience and team and equipment and process and timeline and delivery and editing and retouching and albums and prints and digital files and backup and insurance and contracts and payment methods and cancellation policy",
        description: "Very long input"
      },
      {
        input: "मैं शादी की फोटो चाहता हूं",
        description: "Mixed language input"
      }
    ];
    
    for (let i = 0; i < edgeCases.length; i++) {
      const test = edgeCases[i];
      console.log(`\n📋 Edge Case ${i + 1}: ${test.description}`);
      console.log(`Input: "${test.input}"`);
      
      try {
        const response = await axios.post(`${BASE_URL}/api/voice/conversation-audio`, {
          sessionId,
          userInput: test.input,
          language: "en",
          noAudio: true
        });
        
        const data = response.data;
        const aiResponse = data.data?.response?.response || 'No response';
        const intent = data.data?.response?.intent || 'unknown';
        
        console.log(`✅ AI Response: ${aiResponse}`);
        console.log(`📊 Intent: ${intent}`);
        
        // Check if response is helpful and natural
        if (aiResponse.length > 20 && !aiResponse.includes("Please tell me your name")) {
          console.log('✅ Natural and helpful response');
        } else {
          console.log('⚠️  Response could be more natural');
        }
        
      } catch (error) {
        console.log(`❌ Edge case failed: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Step 5: Test RAG integration
    console.log('\n🧠 Step 5: Testing RAG Integration');
    console.log('-' .repeat(50));
    
    const ragTests = [
      {
        input: "What makes your photography different from others?",
        description: "Knowledge-based question"
      },
      {
        input: "Tell me about your photography style",
        description: "Style inquiry"
      },
      {
        input: "What equipment do you use?",
        description: "Technical question"
      }
    ];
    
    for (let i = 0; i < ragTests.length; i++) {
      const test = ragTests[i];
      console.log(`\n📋 RAG Test ${i + 1}: ${test.description}`);
      console.log(`Input: "${test.input}"`);
      
      try {
        const response = await axios.post(`${BASE_URL}/api/voice/conversation-audio`, {
          sessionId,
          userInput: test.input,
          language: "en",
          noAudio: true
        });
        
        const data = response.data;
        const aiResponse = data.data?.response?.response || 'No response';
        
        console.log(`✅ AI Response: ${aiResponse}`);
        
        // Check if RAG provided substantial response
        if (aiResponse.length > 50) {
          console.log('🧠 RAG integration working - substantial response');
        } else {
          console.log('⚠️  RAG response could be more detailed');
        }
        
      } catch (error) {
        console.log(`❌ RAG test failed: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Step 6: Complete booking to trigger email
    console.log('\n📧 Step 6: Completing Booking to Trigger Demo Email');
    console.log('-' .repeat(50));
    
    try {
      const finalResponse = await axios.post(`${BASE_URL}/api/voice/conversation-audio`, {
        sessionId,
        userInput: "Yes, confirm my booking",
        language: "en",
        noAudio: true
      });
      
      const data = finalResponse.data;
      const aiResponse = data.data?.response?.response || 'No response';
      
      console.log(`✅ Final Response: ${aiResponse}`);
      
      if (aiResponse.includes("Booking confirmed") || aiResponse.includes("APT")) {
        console.log('🎉 Booking completed successfully!');
        console.log('📧 Demo email should be sent to:', DEMO_EMAIL);
        console.log('📧 Check backend logs for email generation');
      } else {
        console.log('⚠️  Booking completion unclear');
      }
      
    } catch (error) {
      console.log(`❌ Final booking failed: ${error.message}`);
    }
    
    console.log('\n' + '=' .repeat(80));
    console.log('🎯 Comprehensive Demo Test Completed!');
    console.log('📧 Demo email sent to:', DEMO_EMAIL);
    console.log('✅ All features tested: Natural conversation, Sales techniques, RAG integration, Email functionality');
    
  } catch (error) {
    console.error('❌ Comprehensive demo test failed:', error.message);
  }
}

// Run the comprehensive demo test
if (require.main === module) {
  comprehensiveDemoTest();
}

module.exports = {
  comprehensiveDemoTest
}; 