const axios = require('axios');
const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

async function testOpenRouter() {
  console.log('🧪 Testing OpenRouter API...');
  console.log('API Key:', process.env.OPENROUTER_API_KEY ? 'Found' : 'Missing');
  
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello in one sentence.' }
        ],
        max_tokens: 50,
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'VoxBiz Test'
        },
      }
    );

    console.log('✅ OpenRouter working! Response:', response.data.choices[0]?.message?.content);
    return true;
  } catch (error) {
    console.error('❌ OpenRouter failed:', error.response?.data || error.message);
    return false;
  }
}

async function testHuggingFace() {
  console.log('\n🧪 Testing HuggingFace API...');
  console.log('API Key:', process.env.HUGGINGFACE_API_KEY ? 'Found' : 'Missing');
  
  try {
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
      const response = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: 'Hello world test',
    });
    
    console.log('✅ HuggingFace working! Embedding length:', Array.isArray(response) ? response.length : 'Invalid response');
    return true;
  } catch (error) {
    console.error('❌ HuggingFace failed:', error.message);
    return false;
  }
}

async function testChromaDB() {
  console.log('\n🧪 Testing ChromaDB connection...');
  
  try {
    const { ChromaClient } = require('chromadb');
    const client = new ChromaClient({ host: 'localhost', port: 8000 });
    
    await client.heartbeat();
    console.log('✅ ChromaDB is running!');
    return true;
  } catch (error) {
    console.warn('⚠️  ChromaDB not available on Windows x64:', error.message);
    console.log('💡 Will use fallback search instead');
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing all APIs...\n');
  
  const openRouterOk = await testOpenRouter();
  const hfOk = await testHuggingFace();
  const chromaOk = await testChromaDB();
  
  console.log('\n📊 Test Results:');
  console.log(`OpenRouter: ${openRouterOk ? '✅' : '❌'}`);
  console.log(`HuggingFace: ${hfOk ? '✅' : '❌'}`);
  console.log(`ChromaDB: ${chromaOk ? '✅' : '❌'}`);
    if (openRouterOk && hfOk) {
    console.log('\n🎉 Core APIs are working! RAG system ready.');
  } else {
    console.log('\n⚠️  Some core APIs need attention.');
  }
}

runTests();
