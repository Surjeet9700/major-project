const { OpenRouterService } = require('./dist/services/openrouter.js');
require('dotenv').config();

async function testLlamaModel() {
  console.log('🦙 Testing Llama 4 Scout Model...\n');
  
  const openRouter = new OpenRouterService();
  
  try {
    console.log('Testing model response...');
    const response = await openRouter.generateResponse(
      'Hello, I am Ramesh and I want to book event photography for tomorrow',
      'en',
      []
    );
    
    console.log('✅ Response from Llama 4 Scout:', response.text);
    console.log('Intent detected:', response.intent);
    console.log('Confidence:', response.confidence);
    
  } catch (error) {
    console.error('❌ Llama model test failed:', error.message);
  }
}

testLlamaModel();
