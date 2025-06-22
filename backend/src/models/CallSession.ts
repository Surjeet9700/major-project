import mongoose, { Schema, Document } from 'mongoose';

export interface ICallSession extends Document {
  callSid: string;
  phoneNumber: string;
  language: 'hi' | 'en';
  context: string[];
  currentStep: string;  userData: {
    name?: string;
    email?: string;
    appointmentDate?: string;
    orderNumber?: string;
    serviceType?: string;
    serviceName?: string;
    preferredTime?: string;
    contactNumber?: string;
  };
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'active' | 'completed' | 'abandoned';
  transcript: {
    timestamp: Date;
    speaker: 'user' | 'assistant';
    text: string;
    language: 'hi' | 'en';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const callSessionSchema = new Schema<ICallSession>({
  callSid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  language: {
    type: String,
    required: true,
    enum: ['hi', 'en'],
    default: 'en'
  },
  context: [{
    type: String
  }],
  currentStep: {
    type: String,
    required: true,
    default: 'welcome'
  },  userData: {
    name: String,
    email: String,
    appointmentDate: String,
    orderNumber: String,
    serviceType: String,
    serviceName: String,
    preferredTime: String,
    contactNumber: String
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // in seconds
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  transcript: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    speaker: {
      type: String,
      required: true,
      enum: ['user', 'assistant']
    },
    text: {
      type: String,
      required: true
    },
    language: {
      type: String,
      required: true,
      enum: ['hi', 'en']
    }
  }]
}, {
  timestamps: true,
  collection: 'call_sessions'
});

// Indexes for efficient queries
callSessionSchema.index({ phoneNumber: 1, status: 1 });
callSessionSchema.index({ startTime: -1 });
callSessionSchema.index({ status: 1, startTime: -1 });

export const CallSession = mongoose.model<ICallSession>('CallSession', callSessionSchema);
