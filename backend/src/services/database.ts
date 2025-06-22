import mongoose from 'mongoose';
import { config } from '../config';

class DatabaseService {
  private isConnected = false;

  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('📊 Already connected to MongoDB');
      return;
    }

    try {
      await mongoose.connect(config.mongodb.uri, {
        dbName: config.mongodb.dbName
      });

      this.isConnected = true;
      console.log('📊 Successfully connected to MongoDB');
      
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('📊 MongoDB disconnected');
        this.isConnected = false;
      });

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      console.log('⚠️  Running without database - using in-memory storage');
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('📊 Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
    }
  }

  isConnectedToDatabase(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  async healthCheck(): Promise<{
    status: 'connected' | 'disconnected' | 'error';
    readyState: number;
    host?: string;
    database?: string;
  }> {
    const readyState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      status: readyState === 1 ? 'connected' : 
              readyState === 0 ? 'disconnected' : 'error',
      readyState,
      host: mongoose.connection.host,
      database: mongoose.connection.name
    };
  }
}

export const databaseService = new DatabaseService();
