export interface TwilioWebhookRequest {
  CallSid: string;
  AccountSid: string;
  From: string;
  To: string;
  CallStatus: string;
  Direction: string;
  SpeechResult?: string;
  Digits?: string;
  RecordingUrl?: string;
}

export interface VoiceSession {
  callSid: string;
  phoneNumber: string;
  language: 'hi' | 'en';
  context: string[];
  currentStep: string;  userData?: {
    name?: string;
    email?: string;
    appointmentDate?: string;
    orderNumber?: string;
    serviceType?: string;
    serviceName?: string;
    preferredTime?: string;
    contactNumber?: string;
  };
}

export interface AIResponse {
  text: string;
  intent: string;
  confidence: number;
  language: 'hi' | 'en';
  nextAction?: string;
}

export interface BookingRequest {
  customerName: string;
  phoneNumber: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
}

export interface OrderTrackingRequest {
  orderNumber: string;
  phoneNumber: string;
}

export interface PricingInquiry {
  serviceType: string;
  language: 'hi' | 'en';
}
