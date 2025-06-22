import * as XLSX from 'xlsx';
import { promises as fs } from 'fs';
import path from 'path';

interface AppointmentRecord {
  id: string;
  customerName: string;
  phoneNumber: string;
  serviceType: string;
  serviceName: string;
  contactNumber?: string;
  bookingDate: string;
  bookingTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  callDuration?: string;
  language: 'hi' | 'en';
  createdAt: string;
  updatedAt: string;
}

interface CallRecord {
  callSid: string;
  phoneNumber: string;
  duration: string;
  status: string;
  language: 'hi' | 'en';
  intent: string;
  conversationSummary: string;
  timestamp: string;
}

export class ExcelService {
  private appointmentsFilePath: string;
  private callLogsFilePath: string;
  private dataDir: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.appointmentsFilePath = path.join(this.dataDir, 'appointments.xlsx');
    this.callLogsFilePath = path.join(this.dataDir, 'call_logs.xlsx');
    this.ensureDataDirectory();
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  async saveAppointment(appointment: Partial<AppointmentRecord>): Promise<string> {
    const appointmentId = `APT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const appointmentRecord: AppointmentRecord = {
      id: appointmentId,
      customerName: appointment.customerName || 'Unknown',
      phoneNumber: appointment.phoneNumber || '',
      serviceType: appointment.serviceType || 'general',
      serviceName: appointment.serviceName || 'Photography Service',
      contactNumber: appointment.contactNumber,
      bookingDate: appointment.bookingDate || new Date().toISOString().split('T')[0],
      bookingTime: appointment.bookingTime || 'TBD',
      status: appointment.status || 'pending',
      notes: appointment.notes || '',
      callDuration: appointment.callDuration,
      language: appointment.language || 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.appendToExcel(this.appointmentsFilePath, appointmentRecord, 'Appointments');
    return appointmentId;
  }

  async saveCallLog(callLog: Partial<CallRecord>): Promise<void> {
    const callRecord: CallRecord = {
      callSid: callLog.callSid || `CALL_${Date.now()}`,
      phoneNumber: callLog.phoneNumber || '',
      duration: callLog.duration || '0',
      status: callLog.status || 'completed',
      language: callLog.language || 'en',
      intent: callLog.intent || 'unknown',
      conversationSummary: callLog.conversationSummary || '',
      timestamp: new Date().toISOString()
    };

    await this.appendToExcel(this.callLogsFilePath, callRecord, 'Call Logs');
  }

  private async appendToExcel(filePath: string, data: any, sheetName: string): Promise<void> {
    let workbook: XLSX.WorkBook;
    let worksheet: XLSX.WorkSheet;

    try {
      const fileBuffer = await fs.readFile(filePath);
      workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      worksheet = workbook.Sheets[sheetName];
    } catch {
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.json_to_sheet([]);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    const existingData = XLSX.utils.sheet_to_json(worksheet);
    existingData.push(data);

    const newWorksheet = XLSX.utils.json_to_sheet(existingData);
    workbook.Sheets[sheetName] = newWorksheet;

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    await fs.writeFile(filePath, excelBuffer);
  }

  async getAppointments(): Promise<AppointmentRecord[]> {
    try {
      const fileBuffer = await fs.readFile(this.appointmentsFilePath);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const worksheet = workbook.Sheets['Appointments'];
      return XLSX.utils.sheet_to_json(worksheet);
    } catch {
      return [];
    }
  }

  async getCallLogs(): Promise<CallRecord[]> {
    try {
      const fileBuffer = await fs.readFile(this.callLogsFilePath);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const worksheet = workbook.Sheets['Call Logs'];
      return XLSX.utils.sheet_to_json(worksheet);
    } catch {
      return [];
    }
  }

  async updateAppointmentStatus(appointmentId: string, status: AppointmentRecord['status'], notes?: string): Promise<boolean> {
    try {
      const appointments = await this.getAppointments();
      const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
      
      if (appointmentIndex === -1) return false;

      appointments[appointmentIndex].status = status;
      appointments[appointmentIndex].updatedAt = new Date().toISOString();
      if (notes) appointments[appointmentIndex].notes = notes;

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(appointments);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');

      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      await fs.writeFile(this.appointmentsFilePath, excelBuffer);

      return true;
    } catch {
      return false;
    }
  }

  async generateSummaryReport(): Promise<any> {
    const appointments = await this.getAppointments();
    const callLogs = await this.getCallLogs();

    const summary = {
      totalAppointments: appointments.length,
      pendingAppointments: appointments.filter(apt => apt.status === 'pending').length,
      confirmedAppointments: appointments.filter(apt => apt.status === 'confirmed').length,
      completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
      cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length,
      totalCalls: callLogs.length,
      averageCallDuration: callLogs.length > 0 ? 
        callLogs.reduce((sum, call) => sum + parseInt(call.duration || '0'), 0) / callLogs.length : 0,
      popularServices: this.getPopularServices(appointments),
      recentActivity: appointments.slice(-10).reverse(),
      languagePreference: {
        hindi: appointments.filter(apt => apt.language === 'hi').length,
        english: appointments.filter(apt => apt.language === 'en').length
      }
    };

    return summary;
  }

  private getPopularServices(appointments: AppointmentRecord[]): { [key: string]: number } {
    const serviceCount: { [key: string]: number } = {};
    appointments.forEach(apt => {
      serviceCount[apt.serviceName] = (serviceCount[apt.serviceName] || 0) + 1;
    });
    return serviceCount;
  }

  async exportAppointmentsBuffer(): Promise<Buffer> {
    const appointments = await this.getAppointments();
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(appointments);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportCallLogsBuffer(): Promise<Buffer> {
    const callLogs = await this.getCallLogs();
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(callLogs);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Call Logs');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}

export const excelService = new ExcelService();
