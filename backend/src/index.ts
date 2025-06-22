import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, validateConfig } from './config';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { corsMiddleware } from './middleware/validation';
import { databaseService } from './services/database';
import voiceRoutes from './routes/voice';
import apiRoutes from './routes/api';

const app = express();

validateConfig();

app.use(helmet());
app.use(cors());
app.use(corsMiddleware);
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use('/public', express.static(path.join(__dirname, '../public')));

// Serve the call request page
app.get('/request-call', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/request-call.html'));
});

app.get('/', (req, res) => {
  res.json({
    message: 'VoxBiz Voice Bot API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      voice: '/api/voice',
      gather: '/api/gather',
      health: '/health'
    }
  });
});

app.get('/health', async (req, res) => {
  const dbHealth = await databaseService.healthCheck();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.server.nodeEnv,
    database: dbHealth
  });
});

// Initialize database connection
databaseService.connect();

app.use('/api', voiceRoutes);
app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

const server = app.listen(config.server.port, () => {
  console.log(`🚀 VoxBiz Backend Server running on port ${config.server.port}`);
  console.log(`📱 Environment: ${config.server.nodeEnv}`);
  console.log(`🌐 Base URL: ${config.server.baseUrl}`);
  
  if (config.server.nodeEnv === 'development') {
    console.log(`📋 API Documentation: ${config.server.baseUrl}`);
  }
});

process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  
  // Close database connection
  await databaseService.disconnect();
  
  server.close(() => {
    console.log('💤 Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  
  // Close database connection
  await databaseService.disconnect();
  
  server.close(() => {
    console.log('💤 Process terminated');
    process.exit(0);
  });
});

export default app;