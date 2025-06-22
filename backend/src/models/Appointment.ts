import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  appointmentId: string;
  customerName: string;
  phoneNumber: string;
  serviceType: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>({
  appointmentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: [
      'Consultation',
      'Technical Support',
      'Product Demo',
      'Training Session',
      'Maintenance',
      'Installation'
    ]
  },
  appointmentDate: {
    type: Date,
    required: true,
    index: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'appointments'
});

// Compound index for efficient queries
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ phoneNumber: 1, status: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
