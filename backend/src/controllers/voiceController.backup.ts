import { Request, Response } from 'express';
import { TwiMLBuilder } from '../services/twiml';
import { sessionManager } from '../services/sessionManager';
import { languageDetector, yuvaMessages } from '../utils/yuvaLanguage';
import { conversationService } from '../services/conversationService';
import { TwilioWebhookRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { getBusinessConfig, getServiceByKeyword, formatBusinessInfo, getWorkingHours } from '../config/business';

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
      action: '/api/language-select',
      hints: ['1', '2']
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
  sessionManager.setCurrentStep(CallSid, 'main_menu');  twiml
    .say(yuvaMessages[selectedLanguage].mainMenu, selectedLanguage)
    .gather({
      speechTimeout: 3,
      timeout: 10,
      action: '/api/process-intent',
      method: 'POST',
      language: 'en',
      hints: ['booking', 'appointment', 'price', 'wedding', 'photo', 'portrait', 'birthday', 'hello', 'hi']
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
  
  sessionManager.addContext(CallSid, `User said: ${SpeechResult}`);

  try {
    const conversationContext = {
      language,
      currentStep: session.currentStep,
      userData: session.userData,
      conversationHistory: session.context,
      businessContext: 'photography_studio'
    };

    const aiResponse = await conversationService.generateNaturalResponse(
      SpeechResult,
      conversationContext
    );

    const intent = aiResponse.intent;
    
    switch (intent) {
      case 'booking':
        sessionManager.setCurrentStep(CallSid, 'booking_start');
        twiml
          .say(aiResponse.response || yuvaMessages[language].booking.start, language)
          .gather({
            speechTimeout: 3,
            timeout: 15,
            action: '/api/handle-booking',
            language: language
          });
        break;

      case 'tracking':
        sessionManager.setCurrentStep(CallSid, 'tracking_start');
        twiml
          .say(aiResponse.response || yuvaMessages[language].tracking.start, language)
          .gather({
            speechTimeout: 3,
            timeout: 15,
            action: '/api/handle-tracking',
            language: language,
            hints: ['order', 'number', 'ऑर्डर', 'नंबर']
          });
        break;

      case 'pricing':
        const naturalPricingResponse = await conversationService.handleGeneralConversation(
          SpeechResult,
          language,
          session.context
        );
        twiml
          .say(naturalPricingResponse, language)
          .pause(1)
          .say(yuvaMessages[language].mainMenu, language)
          .gather({
            speechTimeout: 3,
            timeout: 10,
            action: '/api/process-intent',
            language: language
          });
        break;

      case 'goodbye':
        twiml
          .say(aiResponse.response || yuvaMessages[language].goodbye, language)
          .hangup();
        sessionManager.endSession(CallSid);
        break;

      case 'general':
        const naturalResponse = await conversationService.handleGeneralConversation(
          SpeechResult,
          language,
          session.context
        );        twiml
          .say(naturalResponse, language)
          .pause(1)
          .say(yuvaMessages[language].mainMenu, language)
          .gather({
            speechTimeout: 4,
            speechModel: 'phone_call',
            enhanced: true,
            timeout: 12,
            action: '/api/process-intent',
            language: language,
            hints: language === 'hi' ? 
              ['बुकिंग', 'ट्रैकिंग', 'कीमत', 'हैलो'] :
              ['booking', 'tracking', 'price', 'hello']
          });
        break;

      default:
        const fallbackResponse = await conversationService.handleGeneralConversation(
          SpeechResult,
          language,
          session.context
        );        twiml
          .say(fallbackResponse, language)
          .pause(1)
          .say(yuvaMessages[language].mainMenu, language)
          .gather({
            speechTimeout: 4,
            speechModel: 'phone_call',
            enhanced: true,
            timeout: 12,
            action: '/api/process-intent',
            language: language,
            hints: language === 'hi' ? 
              ['बुकिंग', 'ट्रैकिंग', 'कीमत'] :
              ['booking', 'tracking', 'price']
          });
    }
  } catch (error) {
    console.error('LLM Processing Error:', error);
    
    const basicIntent = detectIntent(SpeechResult, language);
    
    switch (basicIntent) {
      case 'booking':
        sessionManager.setCurrentStep(CallSid, 'booking_start');
        twiml
          .say(yuvaMessages[language].booking.start, language)
          .gather({
            speechTimeout: 3,
            timeout: 15,
            action: '/api/handle-booking',
            language: language
          });
        break;

      case 'tracking':
        sessionManager.setCurrentStep(CallSid, 'tracking_start');
        twiml
          .say(yuvaMessages[language].tracking.start, language)
          .gather({
            speechTimeout: 3,
            timeout: 15,
            action: '/api/handle-tracking',
            language: language
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

      default:        twiml
          .say(yuvaMessages[language].notUnderstood, language)
          .pause(1)
          .say(yuvaMessages[language].mainMenu, language)
          .gather({
            speechTimeout: 4,
            speechModel: 'phone_call',
            enhanced: true,
            timeout: 12,
            action: '/api/process-intent',
            language: language,
            hints: language === 'hi' ? 
              ['बुकिंग', 'ट्रैकिंग', 'कीमत'] :
              ['booking', 'tracking', 'price']
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

  try {
    const conversationContext = {
      language,
      currentStep,
      userData: session.userData,
      conversationHistory: session.context,
      businessContext: 'booking_flow'
    };

    if (currentStep === 'booking_start') {
      sessionManager.updateSession(CallSid, {
        userData: { ...session.userData, name: SpeechResult }
      });
      sessionManager.setCurrentStep(CallSid, 'booking_service');
      
      const naturalResponse = await conversationService.generateNaturalResponse(
        `User provided name: ${SpeechResult}. Now ask for photography service.`,
        conversationContext
      );
        twiml
        .say(naturalResponse.response || yuvaMessages[language].booking.getService, language)
        .gather({
          speechTimeout: 4,
          speechModel: 'phone_call',
          enhanced: true,
          timeout: 15,
          action: '/api/handle-booking',
          language: language,
          hints: language === 'hi' ? ['शादी', 'पोर्ट्रेट', 'जन्मदिन', 'प्रोडक्ट', 'फोटो'] : ['wedding', 'portrait', 'birthday', 'product', 'photo']
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
        
        const naturalResponse = await conversationService.generateNaturalResponse(
          `User selected ${selectedService.name}. Now ask for phone number.`,
          conversationContext
        );
        
        const serviceConfirmation = naturalResponse.response || 
          (language === 'hi' 
            ? `${selectedService.nameHi} सेवा चुनी गई। कृपया अपना फोन नंबर बताएं।`
            : `${selectedService.name} selected. Please provide your phone number.`);
          twiml
          .say(serviceConfirmation, language)
          .gather({
            speechTimeout: 5,
            speechModel: 'phone_call',
            enhanced: true,
            timeout: 15,
            action: '/api/handle-booking',
            language: language,
            hints: ['phone', 'number', 'mobile', 'फोन', 'नंबर', 'मोबाइल']
          });
      } else {
        const naturalResponse = await conversationService.generateNaturalResponse(
          `User said: ${SpeechResult}. Service not recognized. Ask again for photography service.`,
          conversationContext
        );
        
        twiml
          .say(naturalResponse.response || yuvaMessages[language].booking.getService, language)
          .gather({
            speechTimeout: 3,
            timeout: 15,
            action: '/api/handle-booking',
            language: language
          });
      }
      
    } else if (currentStep === 'booking_contact') {
      sessionManager.updateSession(CallSid, {
        userData: { ...session.userData, contactNumber: SpeechResult }
      });
      
      const userData = session.userData || {};
      
      const naturalResponse = await conversationService.generateNaturalResponse(
        `Booking completed for ${userData.name}, service: ${userData.serviceName}, phone: ${SpeechResult}. Confirm and offer main menu.`,
        conversationContext
      );
      
      const confirmationMessage = naturalResponse.response || 
        (language === 'hi' 
          ? `धन्यवाद ${userData.name}! मैंने ${userData.serviceName} के लिए आपका अनुरोध दर्ज कर लिया है। हमारी टीम आपको कॉल करेगी।`
          : `Thank you ${userData.name}! I have noted your request for ${userData.serviceName}. Our team will call you.`);
        twiml
        .say(confirmationMessage, language)
        .pause(1)
        .say(yuvaMessages[language].mainMenu, language)
        .gather({
          speechTimeout: 4,
          speechModel: 'phone_call',
          enhanced: true,
          timeout: 12,
          action: '/api/process-intent',
          language: language,
          hints: language === 'hi' ? 
            ['बुकिंग', 'ट्रैकिंग', 'कीमत', 'धन्यवाद'] :
            ['booking', 'tracking', 'price', 'thank you']
        });
        
      sessionManager.setCurrentStep(CallSid, 'main_menu');
    }
  } catch (error) {
    console.error('LLM Booking Error:', error);
    
    // ...existing fallback logic...
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
        timeout: 15,
        action: '/api/handle-tracking',
        language: language
      });
  }

  sessionManager.endSession(CallSid);
  twiml.send(res);
});

function detectIntent(text: string, language: 'hi' | 'en'): string {
  const lowerText = text.toLowerCase();
  const config = getBusinessConfig();
  
  // Check for specific photography services
  for (const service of config.services) {
    if (service.isActive) {
      const keywords = language === 'hi' ? service.keywordsHi : service.keywords;
      if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
        return 'booking'; // Service-specific requests go to booking
      }
    }
  }
  
  const intents = {
    booking: {
      hi: ['अपॉइंटमेंट', 'बुकिंग', 'बुक', 'मिलना', 'समय', 'appointment', 'फोटो', 'शूट'],
      en: ['appointment', 'booking', 'book', 'schedule', 'meet', 'photo', 'shoot', 'session']
    },
    tracking: {
      hi: ['ट्रैक', 'ऑर्डर', 'स्थिति', 'कहाँ', 'order', 'track'],
      en: ['track', 'order', 'status', 'where', 'delivery']
    },
    pricing: {
      hi: ['कीमत', 'दाम', 'फीस', 'पैसा', 'price', 'cost', 'रेट'],
      en: ['price', 'cost', 'fee', 'money', 'charge', 'rate', 'pricing']
    },
    goodbye: {
      hi: ['धन्यवाद', 'बाई', 'अलविदा', 'bye', 'goodbye'],
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
    pricingInfo = `हमारी मुख्य सेवाएं और उनकी कीमत: `;
    services.slice(0, 3).forEach(service => {
      const pricing = config.pricing[service.id];
      if (pricing) {
        pricingInfo += `${service.nameHi} - ₹${pricing.basePrice} से शुरू, `;
      }
    });
    pricingInfo += `विस्तृत जानकारी के लिए हमसे संपर्क करें।`;
  } else {
    pricingInfo = `Our main services and pricing: `;
    services.slice(0, 3).forEach(service => {
      const pricing = config.pricing[service.id];
      if (pricing) {
        pricingInfo += `${service.name} starting from ₹${pricing.basePrice}, `;
      }
    });
    pricingInfo += `Contact us for detailed information.`;
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
