import { BookingRequest } from '../types';
import { Appointment, IAppointment } from '../models/Appointment';
import { databaseService } from './database';
import { getBusinessConfig, getServiceByKeyword, getWorkingHours } from '../config/business';
import { excelService } from './excelService';

interface AppointmentData {
  id: string;
  customerName: string;
  phoneNumber: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: Date;
}

class BookingService {
  private inMemoryAppointments: AppointmentData[] = [];
  
  async createAppointment(request: BookingRequest): Promise<AppointmentData> {
    const appointmentData: AppointmentData = {
      id: this.generateId(),
      customerName: request.customerName,
      phoneNumber: request.phoneNumber,
      serviceType: request.serviceType,
      appointmentDate: request.preferredDate,
      appointmentTime: request.preferredTime,
      status: 'pending',
      notes: request.notes,
      createdAt: new Date()
    };

    // Try to save to MongoDB first, fallback to in-memory
    if (databaseService.isConnectedToDatabase()) {
      try {
        const appointment = new Appointment({
          appointmentId: appointmentData.id,
          customerName: appointmentData.customerName,
          phoneNumber: appointmentData.phoneNumber,
          serviceType: appointmentData.serviceType,
          appointmentDate: new Date(appointmentData.appointmentDate),
          appointmentTime: appointmentData.appointmentTime,
          status: appointmentData.status,
          notes: appointmentData.notes
        });

        await appointment.save();
        console.log('✅ Appointment saved to MongoDB:', appointmentData.id);
      } catch (error) {
        console.error('❌ Failed to save appointment to MongoDB:', error);
        // Continue with in-memory storage
      }
    }

    // Always keep in-memory backup
    this.inMemoryAppointments.push(appointmentData);
    console.log('📝 New appointment created:', appointmentData);
    
    return appointmentData;
  }
  async getAppointment(id: string): Promise<AppointmentData | null> {
    // Try MongoDB first
    if (databaseService.isConnectedToDatabase()) {
      try {
        const appointment = await Appointment.findOne({ appointmentId: id });
        if (appointment) {
          return this.mongoToAppointmentData(appointment);
        }
      } catch (error) {
        console.error('❌ Error fetching appointment from MongoDB:', error);
      }
    }

    // Fallback to in-memory
    return this.inMemoryAppointments.find(apt => apt.id === id) || null;
  }

  async getAppointmentsByPhone(phoneNumber: string): Promise<AppointmentData[]> {
    let appointments: AppointmentData[] = [];

    // Try MongoDB first
    if (databaseService.isConnectedToDatabase()) {
      try {
        const mongoAppointments = await Appointment.find({ phoneNumber });
        appointments = mongoAppointments.map(apt => this.mongoToAppointmentData(apt));
      } catch (error) {
        console.error('❌ Error fetching appointments from MongoDB:', error);
      }
    }

    // If no MongoDB results, use in-memory
    if (appointments.length === 0) {
      appointments = this.inMemoryAppointments.filter(apt => apt.phoneNumber === phoneNumber);
    }

    return appointments;
  }

  async updateAppointmentStatus(id: string, status: AppointmentData['status']): Promise<boolean> {
    // Try MongoDB first
    if (databaseService.isConnectedToDatabase()) {
      try {
        const result = await Appointment.updateOne(
          { appointmentId: id },
          { status, updatedAt: new Date() }
        );
        if (result.modifiedCount > 0) {
          // Also update in-memory for consistency
          const inMemoryAppointment = this.inMemoryAppointments.find(apt => apt.id === id);
          if (inMemoryAppointment) {
            inMemoryAppointment.status = status;
          }
          return true;
        }
      } catch (error) {
        console.error('❌ Error updating appointment in MongoDB:', error);
      }
    }

    // Fallback to in-memory
    const appointment = this.inMemoryAppointments.find(apt => apt.id === id);
    if (appointment) {
      appointment.status = status;
      return true;
    }
    return false;
  }  async getAvailableSlots(date: string): Promise<string[]> {
    let bookedSlots: string[] = [];

    if (databaseService.isConnectedToDatabase()) {
      try {
        const appointments = await Appointment.find({
          appointmentDate: new Date(date),
          status: { $ne: 'cancelled' }
        });
        bookedSlots = appointments.map(apt => apt.appointmentTime);
      } catch (error) {
        console.error('❌ Error fetching booked slots from MongoDB:', error);
      }
    }

    if (bookedSlots.length === 0) {
      bookedSlots = this.inMemoryAppointments
        .filter(apt => apt.appointmentDate === date && apt.status !== 'cancelled')
        .map(apt => apt.appointmentTime);
    }    const config = getBusinessConfig();
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const workingDay = config.workingHours[dayOfWeek];
    
    if (!workingDay || !workingDay.isOpen) {
      return [];
    }

    const openHour = parseInt(workingDay.open.split(':')[0]);
    const closeHour = parseInt(workingDay.close.split(':')[0]);
    const slotDuration = config.booking.slotDuration;
    
    const allSlots: string[] = [];
    for (let hour = openHour; hour < closeHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        allSlots.push(timeSlot);
      }
    }

    return allSlots.filter(slot => !bookedSlots.includes(slot));
  }

  async isSlotAvailable(date: string, time: string): Promise<boolean> {
    // Check MongoDB first
    if (databaseService.isConnectedToDatabase()) {
      try {
        const existingAppointment = await Appointment.findOne({
          appointmentDate: new Date(date),
          appointmentTime: time,
          status: { $ne: 'cancelled' }
        });
        return !existingAppointment;
      } catch (error) {
        console.error('❌ Error checking slot availability in MongoDB:', error);
      }
    }

    // Fallback to in-memory
    const existingAppointment = this.inMemoryAppointments.find(apt => 
      apt.appointmentDate === date && 
      apt.appointmentTime === time && 
      apt.status !== 'cancelled'
    );
    
    return !existingAppointment;
  }
  getServices(): string[] {
    const config = getBusinessConfig();
    return config.services
      .filter(service => service.isActive)
      .map(service => service.name);
  }

  validateBookingRequest(request: Partial<BookingRequest>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.customerName || request.customerName.trim().length < 2) {
      errors.push('Customer name is required and must be at least 2 characters');
    }

    if (!request.phoneNumber || !/^\+?[\d\s-()]{10,15}$/.test(request.phoneNumber)) {
      errors.push('Valid phone number is required');
    }

    if (!request.serviceType || !this.getServices().includes(request.serviceType)) {
      errors.push('Valid service type is required');
    }

    if (!request.preferredDate) {
      errors.push('Preferred date is required');
    }

    if (!request.preferredTime) {
      errors.push('Preferred time is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private generateId(): string {
    return 'APT' + Date.now().toString() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  // Utility methods for voice processing
  parseDateTime(dateString: string, language: 'hi' | 'en'): {
    date: string | null;
    time: string | null;
  } {
    const result = { date: null as string | null, time: null as string | null };
    
    // Basic date parsing - in production, use a proper date parsing library
    const datePatterns = {
      en: [
        /tomorrow/i,
        /today/i,
        /next week/i,
        /\b(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})\b/,
        /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
      ],
      hi: [
        /कल/,
        /आज/,
        /अगले सप्ताह/,
        /(सोमवार|मंगलवार|बुधवार|गुरुवार|शुक्रवार|शनिवार|रविवार)/
      ]
    };

    const timePatterns = [
      /\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/i,
      /\b(\d{1,2})\s*(am|pm)\b/i,
      /(morning|afternoon|evening)/i
    ];

    // Simple date extraction
    if (language === 'en') {
      if (/tomorrow/i.test(dateString)) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        result.date = tomorrow.toISOString().split('T')[0];
      } else if (/today/i.test(dateString)) {
        result.date = new Date().toISOString().split('T')[0];
      }
    } else {
      if (/कल/.test(dateString)) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        result.date = tomorrow.toISOString().split('T')[0];
      } else if (/आज/.test(dateString)) {
        result.date = new Date().toISOString().split('T')[0];
      }
    }

    // Simple time extraction
    const timeMatch = dateString.match(/\b(\d{1,2}):?(\d{2})?\s*(am|pm)?\b/i);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3]?.toLowerCase();

      if (period === 'pm' && hour !== 12) hour += 12;
      if (period === 'am' && hour === 12) hour = 0;

      result.time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }

    return result;
  }
  formatAppointmentConfirmation(appointment: AppointmentData, language: 'hi' | 'en'): string {
    if (language === 'hi') {
      return `आपका अपॉइंटमेंट ${appointment.appointmentDate} को ${appointment.appointmentTime} बजे ${appointment.serviceType} के लिए बुक हो गया है। आपका अपॉइंटमेंट नंबर ${appointment.id} है।`;
    } else {
      return `Your appointment for ${appointment.serviceType} is booked on ${appointment.appointmentDate} at ${appointment.appointmentTime}. Your appointment ID is ${appointment.id}.`;
    }
  }

  // Helper method to convert MongoDB document to AppointmentData
  private mongoToAppointmentData(mongoAppointment: IAppointment): AppointmentData {
    return {
      id: mongoAppointment.appointmentId,
      customerName: mongoAppointment.customerName,
      phoneNumber: mongoAppointment.phoneNumber,
      serviceType: mongoAppointment.serviceType,
      appointmentDate: mongoAppointment.appointmentDate.toISOString().split('T')[0],
      appointmentTime: mongoAppointment.appointmentTime,
      status: mongoAppointment.status,
      notes: mongoAppointment.notes,
      createdAt: mongoAppointment.createdAt
    };
  }
}

export const bookingService = new BookingService();
