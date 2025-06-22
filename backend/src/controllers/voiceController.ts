import { Request, Response } from 'express';
import { TwiMLBuilder } from '../services/twiml';
import { sessionManager } from '../services/sessionManager';
import { languageDetector, yuvaMessages } from '../utils/yuvaLanguage';
import { TwilioWebhookRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { getBusinessConfig } from '../config/business';
import { OpenRouterService } from '../services/openrouter';

// Create OpenRouter service instance
const openRouterService = new OpenRouterService();

const getRandomGreeting = (language: 'en' | 'hi') => {
  const config = getBusinessConfig();
  
  const greetingsEn = [
    `Hello! Welcome to ${config.name}. How can I help you today?`,
    `Hi there! Welcome to ${config.name}. What can I do for you?`,
    `Good day! This is ${config.name}. How may I assist you?`,
    `Welcome to ${config.name}! I'm here to help with your photography needs.`,
    `Hello! Thanks for calling ${config.name}. What brings you here today?`
  ];

  const greetingsHi = [
    `नमस्ते! ${config.name} में आपका स्वागत है। आज मैं आपकी कैसे मदद कर सकता हूं?`,
    `नमस्कार! ${config.name} में आपका स्वागत है। मैं आपकी क्या सेवा कर सकता हूं?`,
    `आदाब! यह ${config.name} है। आज मैं आपकी कैसे सहायता कर सकता हूं?`,
    `नमस्ते! ${config.name} में आपका हार्दिक स्वागत है। मैं यहां आपकी फोटोग्राफी की जरूरतों में मदद के लिए हूं।`,
    `प्रणाम! ${config.name} को कॉल करने के लिए धन्यवाद। आज आप यहां क्यों आए हैं?`
  ];

  const greetings = language === 'hi' ? greetingsHi : greetingsEn;
  const randomIndex = Math.floor(Math.random() * greetings.length);
  return greetings[randomIndex];
};

const getTimeBasedGreeting = (language: 'en' | 'hi') => {
  const hour = new Date().getHours();
  const config = getBusinessConfig();
  
  if (language === 'hi') {
    if (hour < 12) return `सुप्रभात! ${config.name} में आपका स्वागत है।`;
    if (hour < 17) return `नमस्ते! ${config.name} में आपका स्वागत है।`;
    return `शुभ संध्या! ${config.name} में आपका स्वागत है।`;
  } else {
    if (hour < 12) return `Good morning! Welcome to ${config.name}.`;
    if (hour < 17) return `Good afternoon! Welcome to ${config.name}.`;
    return `Good evening! Welcome to ${config.name}.`;
  }
};

export const handleIncomingCall = asyncHandler(async (req: Request, res: Response) => {
  const { CallSid, From } = req.body as TwilioWebhookRequest;
  
  const session = sessionManager.createSession(CallSid, From);
  
  const twiml = new TwiMLBuilder();
  
  const welcomeMessageEn = getTimeBasedGreeting('en');
  const welcomeMessageHi = getTimeBasedGreeting('hi');
  
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
  const twiml = new TwiMLBuilder();
  
  console.log('User speech input:', SpeechResult);
  sessionManager.addContext(CallSid, `User said: ${SpeechResult}`);

  try {
    // Use OpenRouter AI for better intent understanding
    const aiResponse = await openRouterService.generateActionableResponse(
      SpeechResult,
      language,
      {
        currentStep: session.currentStep,
        userData: session.userData,
        conversationHistory: session.context
      }
    );
    
    console.log('AI detected intent:', aiResponse.intent);
    console.log('AI response:', aiResponse.response);
    console.log('Suggested next action:', aiResponse.nextAction);
    
    const intent = aiResponse.intent;
    
    switch (intent) {
      case 'booking':
        sessionManager.setCurrentStep(CallSid, 'booking_start');
        twiml
          .say(aiResponse.response, language)
          .gather({
          speechTimeout: 3,
          timeout: 10,
          action: '/api/handle-booking',
          hints: ['name', 'my name is', 'I am', 'call me']
        });
      break;

    case 'tracking':
      sessionManager.setCurrentStep(CallSid, 'tracking_start');
      twiml
        .say(yuvaMessages[language].tracking.start, language)
        .gather({
          speechTimeout: 3,
          timeout: 10,
          action: '/api/handle-tracking',
          hints: ['order', 'number', 'tracking']
        });
      break;

    case 'pricing':
      handlePricingInquiry(twiml, language);
      break;

    case 'goodbye':
      twiml
        .say(yuvaMessages[language].goodbye, language)
        .hangup();
      sessionManager.endSession(CallSid);
      break;    default:
      console.log('Unrecognized speech, using fallback');
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
    }
  } catch (error) {
    console.error('OpenRouter AI Error:', error);
    
    // Fallback to simple intent detection
    const intent = detectIntent(SpeechResult, language);
    console.log('Fallback detected intent:', intent);
    
    switch (intent) {
      case 'booking':
        sessionManager.setCurrentStep(CallSid, 'booking_start');
        twiml
          .say(yuvaMessages[language].booking.getName, language)
          .gather({
            speechTimeout: 3,
            timeout: 10,
            action: '/api/handle-booking',
            hints: ['name', 'my name is', 'I am', 'call me']
          });
        break;

      case 'tracking':
        sessionManager.setCurrentStep(CallSid, 'tracking_start');
        twiml
          .say(yuvaMessages[language].tracking.start, language)
          .gather({
            speechTimeout: 3,
            timeout: 10,
            action: '/api/handle-tracking',
            hints: ['order', 'number', 'tracking']
          });
        break;

      case 'pricing':
        handlePricingInquiry(twiml, language);
        break;

      case 'goodbye':
        twiml
          .say(yuvaMessages[language].goodbye, language)
          .hangup();
        sessionManager.endSession(CallSid);
        break;

      default:
        console.log('Unrecognized speech, using fallback');
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
    }
  }

  twiml.send(res);
});

export const handleBooking = asyncHandler(async (req: Request, res: Response) => {
  const { CallSid, SpeechResult } = req.body as TwilioWebhookRequest;
  
  const session = sessionManager.getSession(CallSid);
  if (!session || !SpeechResult) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const { language, currentStep } = session;
  const twiml = new TwiMLBuilder();

  console.log('Booking step:', currentStep, 'User said:', SpeechResult);

  if (currentStep === 'booking_start') {
    sessionManager.updateSession(CallSid, {
      userData: { ...session.userData, name: SpeechResult }
    });
    sessionManager.setCurrentStep(CallSid, 'booking_service');
    
    twiml
      .say(yuvaMessages[language].booking.getService, language)
      .gather({
        speechTimeout: 3,
        timeout: 10,
        action: '/api/handle-booking',
        hints: ['wedding', 'portrait', 'birthday', 'product', 'photo']
      });
      
  } else if (currentStep === 'booking_service') {
    const config = getBusinessConfig();
    let selectedService = null;
    
    for (const service of config.services) {
      if (service.isActive) {
        const keywords = [...service.keywords, ...service.keywordsHi];
        if (keywords.some(keyword => SpeechResult.toLowerCase().includes(keyword.toLowerCase()))) {
          selectedService = service;
          break;
        }
      }
    }
    
    if (selectedService) {
      sessionManager.updateSession(CallSid, {
        userData: { ...session.userData, serviceType: selectedService.id, serviceName: selectedService.name }
      });
      sessionManager.setCurrentStep(CallSid, 'booking_contact');
      
      const serviceConfirmation = language === 'hi' 
        ? `${selectedService.nameHi} सेवा चुनी गई। कृपया अपना फोन नंबर बताएं।`
        : `${selectedService.name} selected. Please provide your phone number.`;
      
      twiml
        .say(serviceConfirmation, language)
        .gather({
          speechTimeout: 5,
          timeout: 15,
          action: '/api/handle-booking',
          hints: ['phone', 'number', 'mobile']
        });
    } else {
      twiml
        .say(yuvaMessages[language].booking.getService, language)
        .gather({
          speechTimeout: 3,
          timeout: 10,
          action: '/api/handle-booking',
          hints: ['wedding', 'portrait', 'birthday', 'product']
        });
    }
    
  } else if (currentStep === 'booking_contact') {
    sessionManager.updateSession(CallSid, {
      userData: { ...session.userData, contactNumber: SpeechResult }
    });
    
    const userData = session.userData || {};
    
    const confirmationMessage = language === 'hi' 
      ? `धन्यवाद ${userData.name}! मैंने ${userData.serviceName} के लिए आपका अनुरोध दर्ज कर लिया है। हमारी टीम आपको कॉल करेगी।`
      : `Thank you ${userData.name}! I have noted your request for ${userData.serviceName}. Our team will call you.`;
    
    twiml
      .say(confirmationMessage, language)
      .pause(1)
      .say(yuvaMessages[language].mainMenu, language)
      .gather({
        speechTimeout: 3,
        timeout: 10,
        action: '/api/process-intent',
        hints: ['booking', 'tracking', 'price', 'thank you']
      });
      
    sessionManager.setCurrentStep(CallSid, 'main_menu');
  }

  twiml.send(res);
});

export const handleTracking = asyncHandler(async (req: Request, res: Response) => {
  const { CallSid, SpeechResult } = req.body as TwilioWebhookRequest;
  
  const session = sessionManager.getSession(CallSid);
  if (!session || !SpeechResult) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const { language } = session;
  const twiml = new TwiMLBuilder();

  const orderNumber = extractOrderNumber(SpeechResult);
  if (orderNumber) {
    twiml
      .say(yuvaMessages[language].tracking.status, language)
      .pause(2)
      .say(yuvaMessages[language].goodbye, language)
      .hangup();
  } else {
    twiml
      .say(yuvaMessages[language].tracking.notFound, language)
      .gather({
        speechTimeout: 3,
        timeout: 10,
        action: '/api/handle-tracking',
        hints: ['order', 'number']
      });
  }

  sessionManager.endSession(CallSid);
  twiml.send(res);
});

function detectIntent(text: string, language: 'hi' | 'en'): string {
  const lowerText = text.toLowerCase();
  const config = getBusinessConfig();
  
  for (const service of config.services) {
    if (service.isActive) {
      const keywords = language === 'hi' ? service.keywordsHi : service.keywords;
      if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
        return 'booking';
      }
    }
  }
  
  const intents = {
    booking: {
      hi: ['अपॉइंटमेंट', 'बुकिंग', 'बुक', 'मिलना', 'समय', 'फोटो', 'शूट'],
      en: ['appointment', 'booking', 'book', 'schedule', 'meet', 'photo', 'shoot', 'session']
    },
    tracking: {
      hi: ['ट्रैक', 'ऑर्डर', 'स्थिति', 'कहाँ'],
      en: ['track', 'order', 'status', 'where', 'delivery']
    },
    pricing: {
      hi: ['कीमत', 'दाम', 'फीस', 'पैसा', 'रेट'],
      en: ['price', 'cost', 'fee', 'money', 'charge', 'rate', 'pricing']
    },
    goodbye: {
      hi: ['धन्यवाद', 'बाई', 'अलविदा'],
      en: ['goodbye', 'bye', 'thank', 'exit', 'end']
    }
  };

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords[language].some(keyword => lowerText.includes(keyword))) {
      return intent;
    }
  }

  return 'unknown';
}

function handlePricingInquiry(twiml: TwiMLBuilder, language: 'hi' | 'en'): void {
  const config = getBusinessConfig();
  const services = config.services.filter(s => s.isActive);
  
  let pricingInfo = '';
  if (language === 'hi') {
    pricingInfo = `हमारी मुख्य सेवाएं: `;
    services.slice(0, 3).forEach(service => {
      const pricing = config.pricing[service.id];
      if (pricing) {
        pricingInfo += `${service.nameHi} - ₹${pricing.basePrice} से शुरू, `;
      }
    });
    pricingInfo += `विस्तार के लिए कॉल करें।`;
  } else {
    pricingInfo = `Our main services: `;
    services.slice(0, 3).forEach(service => {
      const pricing = config.pricing[service.id];
      if (pricing) {
        pricingInfo += `${service.name} starting from ₹${pricing.basePrice}, `;
      }
    });
    pricingInfo += `Call for detailed information.`;
  }
  
  twiml
    .say(pricingInfo, language)
    .pause(2)
    .say(yuvaMessages[language].goodbye, language)
    .hangup();
}

function extractOrderNumber(text: string): string | null {
  const numberPattern = /\b\d{4,}\b/;
  const match = text.match(numberPattern);
  return match ? match[0] : null;
}
