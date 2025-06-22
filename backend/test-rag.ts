import { RAGService } from './src/services/ragService';
import dotenv from 'dotenv';

dotenv.config();

async function testRAGService() {
  console.log('🧪 Testing RAG Service...\n');
  
  const ragService = new RAGService();
  
  try {
    console.log('1️⃣ Testing initialization...');
    await ragService.initialize();
    console.log('✅ RAG Service initialized\n');
    
    console.log('2️⃣ Testing search knowledge...');
    const results = await ragService.searchKnowledge('what services do you offer', 'en', 3);
    console.log('Search results:', results.length > 0 ? `Found ${results.length} results` : 'No results');
    if (results.length > 0) {
      console.log('First result preview:', results[0].substring(0, 100) + '...\n');
    }
    
    console.log('3️⃣ Testing RAG response generation...');
    const response = await ragService.generateRAGResponse('what services do you offer', 'en');
    console.log('RAG Response:', response);
    
    console.log('\n✅ RAG Service is working!');
    
  } catch (error) {
    console.error('❌ RAG Service failed:', error);
  }
}

testRAGService();
