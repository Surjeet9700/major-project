import dotenv from 'dotenv';

dotenv.config();

export const config = {  server: {
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || 'http://localhost:3001',
    webhookBaseUrl: process.env.WEBHOOK_BASE_URL || 'http://localhost:3001'
  },
  
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
  },  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-4-scout:free',
    apiUrl: process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions'
  },
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'
  },
  
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY || '',
    apiUrl: process.env.HUGGINGFACE_API_URL || 'https://api-inference.huggingface.co'
  },
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/voxbiz',
    dbName: process.env.MONGODB_DB_NAME || 'voxbiz'
  },
  
  security: {
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
    encryptionKey: process.env.ENCRYPTION_KEY || 'fallback-encryption-key'
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

export const validateConfig = (): void => {  const requiredEnvVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'OPENROUTER_API_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('Please copy .env.example to .env and fill in the required values');
  }
};
