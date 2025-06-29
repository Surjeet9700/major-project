import { Router, Request, Response } from 'express';
import { bookingService } from '../services/booking';
import { orderTrackingService } from '../services/orderTracking';
import { asyncHandler } from '../middleware/errorHandler';
import { getBusinessConfig, formatBusinessInfo } from '../config/business';
import { config } from '../config';
import { excelService } from '../services/excelService';
import { FreeVoiceService } from '../services/freeVoiceService';

// Create instance of the voice service
const freeVoiceService = new FreeVoiceService();
import { ttsService } from '../services/ttsService';
import { EnhancedAppointment, Order, User } from '../models/User';
import { ragQuery, searchKnowledge, initializeRAG } from '../controllers/ragController';
import twilio from 'twilio';
import path from 'path';
import fs from 'fs';

const router = Router();

// Business information endpoint
router.get('/business-info', asyncHandler(async (req: Request, res: Response) => {
  const { language = 'en' } = req.query;
  const config = getBusinessConfig();
  
  res.json({
    success: true,
    data: {
      name: config.name,
      type: config.type,
      location: config.location,
      contact: config.contact,
      workingHours: config.workingHours,
      services: config.services.filter(s => s.isActive),
      formattedInfo: formatBusinessInfo(language as 'hi' | 'en')
    }
  });
}));

// Appointment management routes
router.get('/appointments/:phone', asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.params;
  const appointments = await bookingService.getAppointmentsByPhone(phone);
  
  res.json({
    success: true,
    data: appointments,
    count: appointments.length
  });
}));

router.get('/appointment/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const appointment = await bookingService.getAppointment(id);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  res.json({
    success: true,
    data: appointment
  });
}));

router.post('/appointment', asyncHandler(async (req: Request, res: Response) => {
  const { customerName, phoneNumber, serviceType, preferredDate, preferredTime, notes } = req.body;
  
  const validation = bookingService.validateBookingRequest({
    customerName,
    phoneNumber,
    serviceType,
    preferredDate,
    preferredTime,
    notes
  });

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }

  const appointment = await bookingService.createAppointment({
    customerName,
    phoneNumber,
    serviceType,
    preferredDate,
    preferredTime,
    notes
  });

  res.status(201).json({
    success: true,
    data: appointment,
    message: 'Appointment created successfully'
  });
}));

router.put('/appointment/:id/status', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  const updated = await bookingService.updateAppointmentStatus(id, status);
  
  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  res.json({
    success: true,
    message: 'Appointment status updated'
  });
}));

// Order tracking routes
router.get('/orders/:phone', asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.params;
  const orders = await orderTrackingService.getOrdersByPhone(phone);
  
  res.json({
    success: true,
    data: orders,
    count: orders.length
  });
}));

router.get('/order/:orderNumber', asyncHandler(async (req: Request, res: Response) => {
  const { orderNumber } = req.params;
  const order = await orderTrackingService.getOrderByNumber(orderNumber);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.json({
    success: true,
    data: order
  });
}));

router.post('/order/track', asyncHandler(async (req: Request, res: Response) => {
  const { orderNumber, phoneNumber } = req.body;
  
  if (!orderNumber || !phoneNumber) {
    return res.status(400).json({
      success: false,
      message: 'Order number and phone number are required'
    });
  }

  const order = await orderTrackingService.trackOrder({ orderNumber, phoneNumber });
  
  if (!order) {
    return res.status(404).json({
      success: false,
    });
  }

  res.json({
    success: true,
    data: order,
    status: orderTrackingService.formatOrderStatus(order, 'en')
  });
}));

// Service information routes
router.get('/services', (req: Request, res: Response) => {
  const services = bookingService.getServices();
  
  res.json({
    success: true,
    data: services
  });
});

router.get('/available-slots/:date', asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.params;
  
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format. Use YYYY-MM-DD'
    });
  }

  const availableSlots = await bookingService.getAvailableSlots(date);
  
  res.json({
    success: true,
    data: availableSlots,
    date: date
  });
}));

// Statistics routes
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  // This would typically come from database aggregations
  // For now, returning mock statistics
  
  res.json({
    success: true,
    data: {
      totalAppointments: 0,
      totalOrders: 0,
      activeSessions: 0,
      todayAppointments: 0,
      pendingOrders: 0
    }
  });
}));

// Request call endpoint
router.post('/request-call', asyncHandler(async (req: Request, res: Response) => {
  const { phoneNumber, language = 'en' } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }
  
  // Validate phone number format
  if (!/^\+\d{10,15}$/.test(phoneNumber)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }
    try {
    const twilioClient = require('twilio')(config.twilio.accountSid, config.twilio.authToken);
    
    const call = await twilioClient.calls.create({
      to: phoneNumber,
      from: config.twilio.phoneNumber,
      url: `${config.server.webhookBaseUrl}/api/voice`,
      statusCallback: `${config.server.webhookBaseUrl}/api/voice/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST'
    });
    
    console.log(`📞 Outbound call initiated:`, {
      callSid: call.sid,
      to: phoneNumber,
      language: language
    });
    
    res.json({
      success: true,
      message: 'Call request initiated successfully',
      callSid: call.sid,
      to: phoneNumber
    });
      } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({ 
      error: 'Failed to initiate call',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Test endpoint to simulate voice flow without Twilio calls
router.post('/test-voice-flow', asyncHandler(async (req: Request, res: Response) => {
  const { phoneNumber, testSteps = [] } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required for testing' });
  }

  const mockCallSid = `TEST_${Date.now()}`;
  const sessionManager = require('../services/sessionManager').sessionManager;
  const { OpenRouterService } = require('../services/openrouter');
  const openRouterService = new OpenRouterService();
  
  const testResults = [];
  
  try {
    // Step 1: Simulate incoming call
    const session = sessionManager.createSession(mockCallSid, phoneNumber);
    testResults.push({
      step: 'Session Created',
      success: true,
      data: { callSid: mockCallSid, phoneNumber }
    });

    // Step 2: Test language detection
    if (testSteps.includes('language') || testSteps.length === 0) {
      session.selectedLanguage = 'en';
      testResults.push({
        step: 'Language Selection',
        success: true,
        data: { language: 'en' }
      });
    }

    // Step 3: Test intent detection with OpenRouter
    if (testSteps.includes('intent') || testSteps.length === 0) {
      const testUserInput = 'I want to book a photography session';
      const aiResponse = await openRouterService.generateActionableResponse(testUserInput, {
        sessionData: session,
        context: 'User wants to book a service'
      });
      
      testResults.push({
        step: 'Intent Detection (OpenRouter)',
        success: true,
        data: { 
          userInput: testUserInput,
          aiResponse: aiResponse.response,
          detectedIntent: aiResponse.intent || 'booking'
        }
      });
    }

    // Step 4: Test booking flow
    if (testSteps.includes('booking') || testSteps.length === 0) {
      session.bookingData = {
        customerName: 'Test User',
        phoneNumber: phoneNumber,
        serviceType: 'Wedding Photography',
        status: 'in_progress'
      };
      
      testResults.push({
        step: 'Booking Flow Simulation',
        success: true,
        data: session.bookingData
      });
    }

    // Step 5: Test conversation flow
    if (testSteps.includes('conversation') || testSteps.length === 0) {
      const conversationTests = [
        'What are your photography packages?',
        'How much does wedding photography cost?',
        'I need to book for next weekend'
      ];
      
      const conversationResults = [];
      for (const testInput of conversationTests) {
        const response = await openRouterService.generateActionableResponse(testInput, {
          sessionData: session,
          context: 'Photography service inquiry'
        });
        
        conversationResults.push({
          input: testInput,
          response: response.response,
          intent: response.intent
        });
      }
      
      testResults.push({
        step: 'Conversation Flow Test',
        success: true,
        data: conversationResults
      });
    }

    // Cleanup
    sessionManager.endSession(mockCallSid);
    
    res.json({
      success: true,
      message: 'Voice flow test completed successfully',
      testResults,
      summary: {
        totalSteps: testResults.length,
        successfulSteps: testResults.filter(r => r.success).length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Test voice flow error:', error);
    
    testResults.push({
      step: 'Error Occurred',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({
      success: false,
      message: 'Voice flow test failed',
      testResults,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Test endpoint for OpenRouter integration
router.post('/test-openrouter', asyncHandler(async (req: Request, res: Response) => {
  const { message, context = 'Photography service inquiry' } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const { OpenRouterService } = require('../services/openrouter');
    const openRouterService = new OpenRouterService();
    
    const response = await openRouterService.generateActionableResponse(message, {
      context,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      input: message,
      output: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('OpenRouter test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      input: message
    });
  }
}));

// Mock request call endpoint (without actual Twilio call)
router.post('/test-request-call', asyncHandler(async (req: Request, res: Response) => {
  const { phoneNumber, language = 'en' } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }
  
  // Validate phone number format
  if (!/^\+\d{10,15}$/.test(phoneNumber)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  // Simulate successful call without actually calling Twilio
  const mockCallSid = `MOCK_CALL_${Date.now()}`;
  
  console.log(`📞 Mock call initiated:`, {
    callSid: mockCallSid,
    to: phoneNumber,
    language: language,
    timestamp: new Date().toISOString()
  });
    // Simulate the voice flow test automatically
  const testResponse = await fetch(`${config.server.baseUrl}/api/test-voice-flow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, testSteps: ['language', 'intent', 'conversation'] })
  }).catch(() => null);
  
  res.json({
    success: true,
    message: 'Mock call request completed successfully',
    callSid: mockCallSid,
    to: phoneNumber,
    testMode: true,
    note: 'This is a test call - no actual phone call was made',
    voiceFlowTest: testResponse ? 'Completed' : 'Skipped'
  });
}));

// Excel/CSV download endpoints
router.get('/appointments/download', asyncHandler(async (req: Request, res: Response) => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'appointments.xlsx');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'No appointments file found'
      });
    }
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="appointments.xlsx"');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading appointments file'
    });
  }
}));

router.get('/calls/download', asyncHandler(async (req: Request, res: Response) => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'call_logs.xlsx');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'No call logs file found'
      });
    }
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="call_logs.xlsx"');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading call logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading call logs file'
    });
  }
}));

// Get appointments as JSON for frontend display
router.get('/appointments/json', asyncHandler(async (req: Request, res: Response) => {
  try {
    const appointments = await excelService.getAppointments();
    res.json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error('Error getting appointments:', error);
    res.json({
      success: true,
      data: [],
      count: 0,
      message: 'No appointments found or error reading file'
    });
  }
}));

// Get call logs as JSON for frontend display  
router.get('/calls/json', asyncHandler(async (req: Request, res: Response) => {
  try {
    const callLogs = await excelService.getCallLogs();
    res.json({
      success: true,
      data: callLogs,
      count: callLogs.length
    });
  } catch (error) {
    console.error('Error getting call logs:', error);
    res.json({
      success: true,
      data: [],
      count: 0,
      message: 'No call logs found or error reading file'
    });
  }
}));

// Free Voice Service Endpoints (using Groq TTS)
router.post('/voice/speech-to-text', asyncHandler(async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Speech-to-text not implemented' });
}));

router.post('/voice/text-to-speech', asyncHandler(async (req: Request, res: Response) => {
  const { text, language = 'en' } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  try {
    const audioBuffer = await ttsService.generateSpeech(text, language);
    if (language === 'hi') {
      res.setHeader('Content-Type', 'audio/wav');
    } else {
      res.setHeader('Content-Type', 'audio/mpeg');
    }
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(audioBuffer);
  } catch (error) {
    console.error('Error generating TTS:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Enhanced Voice Agent endpoints
router.post('/voice/conversation', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, userInput, language = 'hi' } = req.body;
  
  if (!sessionId || !userInput) {
    return res.status(400).json({
      success: false,
      message: 'Session ID and user input are required'
    });
  }

  try {
    const response = await freeVoiceService.processConversation(sessionId, userInput, language);
    
    res.json({
      success: true,
      data: {
        response,
        sessionId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Conversation processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing conversation'
    });
  }
}));

// Enhanced Voice Agent endpoint with TTS audio response
router.post('/voice/conversation-audio', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, userInput, language = 'hi', action, noAudio } = req.body;
  
  // Handle cleanup action
  if (action === 'cleanup') {
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required for cleanup'
      });
    }

    try {
      const { AudioCleanup } = await import('../utils/audioCleanup');
      await AudioCleanup.cleanupSessionAudioFiles(sessionId);
      
      return res.json({
        success: true,
        message: `Cleaned up audio files for session ${sessionId}`
      });
    } catch (error) {
      console.error('Error cleaning up session audio:', error);
      return res.status(500).json({
        success: false,
        message: 'Error cleaning up session audio files'
      });
    }
  }
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Session ID is required'
    });
  }

  // Handle empty or whitespace-only input gracefully
  if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
    const fallbackResponse = {
      response: language === 'hi' ? 
        'मैं आपकी बात नहीं सुन पाया। कृपया फिर से बोलें।' : 
        'I could not hear you clearly. Please speak again.',
      intent: 'clarification',
      nextAction: 'continue_conversation'
    };
    
    return res.json({
      success: true,
      data: {
        response: fallbackResponse,
        audioUrl: null,
        fallbackTTS: true,
        sessionId,
        timestamp: new Date().toISOString()
      }
    });
  }

  try {
    const textResponse = await freeVoiceService.processConversation(sessionId, userInput, language);
    // If textResponse is an object, extract the response string
    const responseText = typeof textResponse === 'string' ? textResponse : textResponse.response;
    let audioUrl = null;
    if (!noAudio) {
      const audioFilename = `tts_${sessionId}_${Date.now()}.wav`;
      const voiceSettings = {
        speed: 0.8, // Slower speech
        gender: 'female' as const
      };
      audioUrl = await ttsService.generateAndSaveAudio(responseText, language, audioFilename, voiceSettings);
    }
    res.json({
      success: true,
      data: {
        response: textResponse,
        audioUrl: audioUrl, // Will be null if TTS is skipped or fails
        fallbackTTS: audioUrl === null, // Indicate to frontend to use browser TTS
        sessionId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Conversation processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing conversation'
    });
  }
}));

// Get session information
router.get('/voice/session/:sessionId', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const session = freeVoiceService.getSession(sessionId);
  
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }

  res.json({
    success: true,
    data: {
      sessionId: session.sessionId,
      language: session.language,
      currentStep: session.bookingInProgress ? "booking" : "conversation",
      extractedData: session.extractedData,
      conversationHistory: session.conversationHistory.slice(-5) // Last 5 messages
    }
  });
}));

// Get user appointments and orders
router.get('/users/:userId/history', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  const appointments = freeVoiceService.getUserAppointments(userId);
  const orders = freeVoiceService.getUserOrders(userId);
  
  res.json({
    success: true,
    data: {
      appointments,
      orders,
      summary: {
        totalAppointments: appointments.length,
        totalOrders: orders.length,
        totalSpent:
          (Array.isArray(appointments) ? appointments.reduce((sum: number, apt: any) => sum + (apt.paymentInfo?.totalAmount || 0), 0) : 0) +
          (Array.isArray(orders) ? orders.reduce((sum: number, order: any) => sum + (order.pricing?.total || 0), 0) : 0)
      }
    }
  });
}));

// Get all appointments from voice service
router.get('/voice/appointments', asyncHandler(async (req: Request, res: Response) => {
  const appointments = freeVoiceService.getAllAppointments();
  
  res.json({
    success: true,
    data: appointments,
    count: appointments.length
  });
}));

// Get all orders from voice service  
router.get('/voice/orders', asyncHandler(async (req: Request, res: Response) => {
  const orders = freeVoiceService.getAllOrders();
  
  res.json({
    success: true,
    data: orders,
    count: orders.length
  });
}));

// Get specific appointment
router.get('/voice/appointment/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const appointment = freeVoiceService.getAppointmentById(id);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  res.json({
    success: true,
    data: appointment
  });
}));

// Get specific order
router.get('/voice/order/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = freeVoiceService.getOrderById(id);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.json({
    success: true,
    data: order
  });
}));

// Smart business query endpoint
router.post('/business/query', asyncHandler(async (req: Request, res: Response) => {
  const { query, language = 'en', sessionId } = req.body;
  
  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Query is required'
    });
  }

  // Use provided sessionId or create a new one
  const currentSessionId = sessionId || `business_${Date.now()}`;
  const response = await freeVoiceService.processConversation(currentSessionId, query, language);
  
  res.json({
    success: true,
    data: {
      query,
      response,
      language,
      sessionId: currentSessionId
    }
  });
}));

// Get comprehensive business profile
router.get('/business/profile', asyncHandler(async (req: Request, res: Response) => {
  const { language = 'en' } = req.query;
  const config = getBusinessConfig();
  
  res.json({
    success: true,
    data: {
      basic: {
        name: config.name,
        type: config.type,
        location: config.location,
        contact: config.contact
      },
      owner: config.businessOwner,
      services: config.services.filter(s => s.isActive),
      pricing: config.pricing,
      workingHours: config.workingHours,
      equipment: config.equipment,
      specialFeatures: config.specialFeatures,
      languages: config.languages,
      booking: config.booking,
      formattedInfo: formatBusinessInfo(language as 'hi' | 'en')
    }
  });
}));

// Get analytics and insights
router.get('/analytics', asyncHandler(async (req: Request, res: Response) => {
  const appointments = freeVoiceService.getAllAppointments();
  const orders = freeVoiceService.getAllOrders();
  const users = freeVoiceService.getUsers();

  const analytics = {
    overview: {
      totalUsers: users.length,
      totalAppointments: appointments.length,
      totalOrders: orders.length,
      totalRevenue:
        (Array.isArray(appointments) ? appointments.reduce((sum: number, apt: any) => sum + (apt.paymentInfo?.totalAmount || 0), 0) : 0) +
        (Array.isArray(orders) ? orders.reduce((sum: number, order: any) => sum + (order.pricing?.total || 0), 0) : 0)
    },
    appointmentsByService: Array.isArray(appointments) ? appointments.reduce((acc: { [key: string]: number }, apt: any) => {
      if (apt.serviceId) acc[apt.serviceId] = (acc[apt.serviceId] || 0) + 1;
      return acc;
    }, {}) : {},
    ordersByType: Array.isArray(orders) ? orders.reduce((acc: { [key: string]: number }, order: any) => {
      if (order.orderType) acc[order.orderType] = (acc[order.orderType] || 0) + 1;
      return acc;
    }, {}) : {},
    recentActivity: {
      recentAppointments: appointments.slice(-5),
      recentOrders: orders.slice(-5)
    }
  };

  res.json({
    success: true,
    data: analytics
  });
}));

// Serve TTS audio files
router.get('/audio/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const audioPath = path.join(__dirname, '../../public', filename);
  
  if (fs.existsSync(audioPath)) {
    res.setHeader('Content-Type', 'audio/wav');
    res.sendFile(audioPath);
  } else {
    res.status(404).json({
      success: false,
      message: 'Audio file not found'
    });
  }
});

// Cleanup endpoints
router.post('/voice/cleanup-session', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Session ID is required'
    });
  }

  try {
    const { AudioCleanup } = await import('../utils/audioCleanup');
    await AudioCleanup.cleanupSessionAudioFiles(sessionId);
    
    res.json({
      success: true,
      message: `Cleaned up audio files for session ${sessionId}`
    });
  } catch (error) {
    console.error('Error cleaning up session audio:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up session audio files'
    });
  }
}));

router.post('/voice/cleanup-old-audio', asyncHandler(async (req: Request, res: Response) => {
  const { maxAgeMinutes = 30 } = req.body;

  try {
    const { AudioCleanup } = await import('../utils/audioCleanup');
    await AudioCleanup.cleanupOldAudioFiles(maxAgeMinutes);
    
    res.json({
      success: true,
      message: `Cleaned up audio files older than ${maxAgeMinutes} minutes`
    });
  } catch (error) {
    console.error('Error cleaning up old audio:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up old audio files'
    });
  }
}));

// Set email for voice session
router.post('/voice/set-email', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, email } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Session ID is required'
    });
  }

  let session = freeVoiceService.getSession(sessionId);
  if (!session) {
    // Create session if it does not exist
    freeVoiceService.setSessionEmail(sessionId, email);
    session = freeVoiceService.getSession(sessionId);
  } else {
    session.customerEmail = email;
  }

  console.log(`📧 Email set for session ${sessionId}:`, email ? email : 'skipped');

  res.json({
    success: true,
    message: email ? 'Email saved successfully' : 'Email collection skipped',
    data: {
      sessionId,
      emailSet: !!email
    }
  });
}));

export default router;
