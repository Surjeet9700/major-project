const { FreeVoiceService } = require('./dist/services/freeVoiceService.js');
require('dotenv').config();

async function testIntelligentAgent() {
  console.log('🤖 Testing Intelligent AI Voice Agent...\n');
  
  const voiceService = new FreeVoiceService();
  const sessionId = 'test-session-' + Date.now();
  
  try {
    // Test conversation flow
    console.log('1️⃣ Test greeting...');
    let response = await voiceService.processConversation(sessionId, 'hello', 'en');
    console.log('AI:', response);
    
    console.log('\n2️⃣ Test service inquiry...');
    response = await voiceService.processConversation(sessionId, 'what services do you offer', 'en');
    console.log('AI:', response);
    
    console.log('\n3️⃣ Test booking request...');
    response = await voiceService.processConversation(sessionId, 'I want to book an appointment for event photography', 'en');
    console.log('AI:', response);
    
    console.log('\n4️⃣ Test providing name...');
    response = await voiceService.processConversation(sessionId, 'my name is Ramesh', 'en');
    console.log('AI:', response);
    
    console.log('\n5️⃣ Test providing phone...');
    response = await voiceService.processConversation(sessionId, 'my phone number is 8374345298', 'en');
    console.log('AI:', response);
    
    console.log('\n6️⃣ Test providing date...');
    response = await voiceService.processConversation(sessionId, 'I need it tomorrow', 'en');
    console.log('AI:', response);
    
    console.log('\n7️⃣ Test session data...');
    const session = voiceService.getSession(sessionId);
    console.log('Session Data:', {
      name: session.extractedData.name,
      phone: session.extractedData.phone,
      service: session.extractedData.service,
      date: session.extractedData.date,
      conversationLength: session.conversationHistory.length
    });
    
    console.log('\n✅ Intelligent AI Agent Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testIntelligentAgent();
