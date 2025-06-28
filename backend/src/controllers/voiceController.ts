import { Request, Response } from 'express';
import { TwiMLBuilder } from '../services/twiml';
import { sessionManager } from '../services/sessionManager';
import { languageDetector, yuvaMessages } from '../utils/yuvaLanguage';
import { TwilioWebhookRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { getBusinessConfig } from '../config/business';
import { voiceService } from '../services/voiceService';

export const handleIncomingCall = asyncHandler(async (req: Request, res: Response) => {
  const { CallSid, From } = req.body as TwilioWebhookRequest;
  
  const session = sessionManager.createSession(CallSid, From);
  
  const twiml = new TwiMLBuilder();
  
  const welcomeMessageEn = voiceService.getTimeBasedGreeting('en');
  const welcomeMessageHi = voiceService.getTimeBasedGreeting('hi');
  
  twiml
    .say(welcomeMessageEn, 'en')
    .pause(1)
    .say(welcomeMessageHi, 'hi')
    .gather({
      numDigits: 1,
      timeout: 8,
      action: '/api/language-select'
    })
    .say('Press 1 for Hindi, 2 for English', 'en')
    .pause(1)
    .say('हिंदी के लिए 1, अंग्रेजी के लिए 2', 'hi');

  sessionManager.setCurrentStep(CallSid, 'language_selection');
  twiml.send(res);
});

export const handleLanguageSelection = asyncHandler(async (req: Request, res: Response) => {
  const { CallSid, SpeechResult, Digits } = req.body as TwilioWebhookRequest;
  
  const session = sessionManager.getSession(CallSid);
  if (!session) {
    return res.status(400).json({ error: 'Session not found' });
  }

  const twiml = new TwiMLBuilder();
  let selectedLanguage: 'hi' | 'en' = 'en';

  if (Digits === '1' || (SpeechResult && (
    SpeechResult.toLowerCase().includes('hindi') ||
    SpeechResult.toLowerCase().includes('हिंदी') ||
    SpeechResult.toLowerCase().includes('एक')
  ))) {
    selectedLanguage = 'hi';
  } else if (Digits === '2' || (SpeechResult && (
    SpeechResult.toLowerCase().includes('english') ||
    SpeechResult.toLowerCase().includes('अंग्रेजी') ||
    SpeechResult.toLowerCase().includes('two')
  ))) {
    selectedLanguage = 'en';
  } else if (SpeechResult) {
    selectedLanguage = languageDetector.detect(SpeechResult);
  }
  
  sessionManager.setLanguage(CallSid, selectedLanguage);
  sessionManager.setCurrentStep(CallSid, 'main_menu');
  
  twiml
    .say(yuvaMessages[selectedLanguage].mainMenu, selectedLanguage)
    .gather({
      speechTimeout: 3,
      timeout: 10,
      action: '/api/process-intent',
      hints: ['booking', 'appointment', 'price', 'wedding', 'photo']
    })
    .say(yuvaMessages[selectedLanguage].notUnderstood, selectedLanguage);

  twiml.send(res);
});

export const handleIntentProcessing = asyncHandler(async (req: Request, res: Response) => {
  const { CallSid, SpeechResult } = req.body as TwilioWebhookRequest;
  
  const session = sessionManager.getSession(CallSid);
  if (!session || !SpeechResult) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const { language } = session;
  
  console.log('User speech input:', SpeechResult);
  sessionManager.addContext(CallSid, `User said: ${SpeechResult}`);

  try {
    // Use the unified voice service for intent processing
    const intentContext = {
      currentStep: session.currentStep,
      userData: session.userData,
      conversationHistory: session.context,
      language: language as 'hi' | 'en'
    };

    const voiceResponse = await voiceService.processIntent(SpeechResult, intentContext);
    
    console.log('Detected intent:', voiceResponse.intent);
    console.log('Generated response:', voiceResponse.response);
    
    // Update session based on intent
    switch (voiceResponse.intent) {
      case 'booking':
        sessionManager.setCurrentStep(CallSid, 'booking_start');
        break;
      case 'tracking':
        sessionManager.setCurrentStep(CallSid, 'tracking_start');
        break;
      case 'goodbye':
        sessionManager.endSession(CallSid);
        break;
    }

    // Create TwiML response
    const twiml = voiceService.createTwiMLForIntent(voiceResponse.intent, language as 'hi' | 'en', voiceResponse.response);
    twiml.send(res);

  } catch (error) {
    console.error('Error processing intent:', error);
    
    // Fallback to basic response
    const twiml = new TwiMLBuilder();
    twiml
      .say(yuvaMessages[language].notUnderstood, language)
      .pause(1)
      .say(yuvaMessages[language].mainMenu, language)
      .gather({
        speechTimeout: 3,
        timeout: 10,
        action: '/api/process-intent',
        hints: ['booking', 'appointment', 'price', 'wedding', 'photo']
      });
    
    twiml.send(res);
  }
});

export const handleBooking = asyncHandler(async (req: Request, res: Response) => {
  const { CallSid, SpeechResult } = req.body as TwilioWebhookRequest;
  
  const session = sessionManager.getSession(CallSid);
  if (!session || !SpeechResult) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const { language, currentStep } = session;

  console.log('Booking step:', currentStep, 'User said:', SpeechResult);

  try {
    const bookingResponse = await voiceService.handleBookingStep(
      currentStep, 
      SpeechResult, 
      session, 
      language as 'hi' | 'en'
    );

    sessionManager.updateSession(CallSid, bookingResponse.sessionUpdates);
    if (bookingResponse.nextStep) {
      sessionManager.setCurrentStep(CallSid, bookingResponse.nextStep);
    }

    bookingResponse.twiml.send(res);

  } catch (error) {
    console.error('Booking error:', error);
    const twiml = new TwiMLBuilder();
    twiml
      .say(yuvaMessages[language].notUnderstood, language)
      .pause(1)
      .say(yuvaMessages[language].mainMenu, language)
      .gather({
        speechTimeout: 3,
        timeout: 10,
        action: '/api/process-intent',
        hints: ['booking', 'appointment', 'price']
      });
    
    twiml.send(res);
  }
});

export const handleTracking = asyncHandler(async (req: Request, res: Response) => {
  const { CallSid, SpeechResult } = req.body as TwilioWebhookRequest;
  
  const session = sessionManager.getSession(CallSid);
  if (!session || !SpeechResult) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const { language } = session;

  try {
    const trackingResponse = await voiceService.handleTrackingStep(
      SpeechResult, 
      language as 'hi' | 'en'
    );

    sessionManager.endSession(CallSid);
    trackingResponse.twiml.send(res);

  } catch (error) {
    console.error('Tracking error:', error);
    const twiml = new TwiMLBuilder();
    twiml
      .say(yuvaMessages[language].notUnderstood, language)
      .pause(1)
      .say(yuvaMessages[language].mainMenu, language)
      .gather({
        speechTimeout: 3,
        timeout: 10,
        action: '/api/process-intent',
        hints: ['booking', 'tracking', 'price']
      });
    
    sessionManager.endSession(CallSid);
    twiml.send(res);
  }
});
