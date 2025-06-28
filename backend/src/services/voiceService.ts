import { TwiMLBuilder } from './twiml';
import { sessionManager } from './sessionManager';
import { yuvaMessages } from '../utils/yuvaLanguage';
import { getBusinessConfig } from '../config/business';
import { OpenRouterService } from './openrouter';

export interface VoiceServiceConfig {
  useAI: boolean;
  fallbackToSimple: boolean;
}

export interface IntentContext {
  currentStep: string;
  userData: any;
  conversationHistory: string[];
  language: 'hi' | 'en';
}

export interface VoiceResponse {
  intent: string;
  response: string;
  nextAction?: string;
  twiml?: TwiMLBuilder;
}

export class VoiceService {
  private openRouterService: OpenRouterService;
  private config: VoiceServiceConfig;

  constructor(config: VoiceServiceConfig = { useAI: true, fallbackToSimple: true }) {
    this.openRouterService = new OpenRouterService();
    this.config = config;
  }

  async processIntent(
    userInput: string, 
    context: IntentContext
  ): Promise<VoiceResponse> {
    try {
      if (this.config.useAI) {
        return await this.processWithAI(userInput, context);
      } else {
        return this.processWithSimpleLogic(userInput, context);
      }
    } catch (error) {
      console.error('Error processing intent:', error);
      
      if (this.config.fallbackToSimple) {
        console.log('Falling back to simple intent detection');
        return this.processWithSimpleLogic(userInput, context);
      }
      
      throw error;
    }
  }

  private async processWithAI(
    userInput: string, 
    context: IntentContext
  ): Promise<VoiceResponse> {
    const aiResponse = await this.openRouterService.generateActionableResponse(
      userInput,
      context.language,
      {
        currentStep: context.currentStep,
        userData: context.userData,
        conversationHistory: context.conversationHistory
      }
    );

    return {
      intent: aiResponse.intent || 'unknown',
      response: aiResponse.response || this.getDefaultResponse(context.language),
      nextAction: aiResponse.nextAction
    };
  }

  private processWithSimpleLogic(
    userInput: string, 
    context: IntentContext
  ): Promise<VoiceResponse> {
    const intent = this.detectIntentSimple(userInput, context.language);
    const response = this.getResponseForIntent(intent, context.language);
    
    return Promise.resolve({
      intent,
      response,
      nextAction: this.getNextActionForIntent(intent)
    });
  }

  private detectIntentSimple(text: string, language: 'hi' | 'en'): string {
    const lowerText = text.toLowerCase();
    const businessConfig = getBusinessConfig();
    
    // Check for specific business services first
    for (const service of businessConfig.services) {
      if (service.isActive) {
        const keywords = language === 'hi' ? service.keywordsHi : service.keywords;
        if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
          return 'booking';
        }
      }
    }
    
    // Check for common intents
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

    for (const [intentName, intentKeywords] of Object.entries(intents)) {
      const keywords = intentKeywords[language];
      if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
        return intentName;
      }
    }

    return 'unknown';
  }

  private getResponseForIntent(intent: string, language: 'hi' | 'en'): string {
    switch (intent) {
      case 'booking':
        return yuvaMessages[language].booking.start;
      case 'tracking':
        return yuvaMessages[language].tracking.start;
      case 'pricing':
        return this.getPricingInfo(language);
      case 'goodbye':
        return yuvaMessages[language].goodbye;
      default:
        return yuvaMessages[language].notUnderstood;
    }
  }

  private getNextActionForIntent(intent: string): string {
    switch (intent) {
      case 'booking':
        return 'collect_booking_details';
      case 'tracking':
        return 'collect_order_number';
      case 'pricing':
        return 'provide_pricing';
      case 'goodbye':
        return 'end_call';
      default:
        return 'clarify_intent';
    }
  }

  private getPricingInfo(language: 'hi' | 'en'): string {
    const businessConfig = getBusinessConfig();
    const services = businessConfig.services.filter(s => s.isActive);
    
    let pricingInfo = '';
    if (language === 'hi') {
      pricingInfo = `हमारी मुख्य सेवाएं: `;
      services.slice(0, 3).forEach(service => {
        const pricing = businessConfig.pricing[service.id];
        if (pricing) {
          pricingInfo += `${service.nameHi} - ₹${pricing.basePrice} से शुरू, `;
        }
      });
      pricingInfo += `विस्तार के लिए कॉल करें।`;
    } else {
      pricingInfo = `Our main services: `;
      services.slice(0, 3).forEach(service => {
        const pricing = businessConfig.pricing[service.id];
        if (pricing) {
          pricingInfo += `${service.name} starting from ₹${pricing.basePrice}, `;
        }
      });
      pricingInfo += `Call for detailed information.`;
    }
    
    return pricingInfo;
  }

  private getDefaultResponse(language: 'hi' | 'en'): string {
    return yuvaMessages[language].notUnderstood;
  }

  createTwiMLForIntent(intent: string, language: 'hi' | 'en', response: string): TwiMLBuilder {
    const twiml = new TwiMLBuilder();
    
    switch (intent) {
      case 'booking':
        twiml
          .say(response, language)
          .gather({
            speechTimeout: 3,
            timeout: 10,
            action: '/api/handle-booking',
            hints: ['name', 'my name is', 'I am', 'call me']
          });
        break;

      case 'tracking':
        twiml
          .say(response, language)
          .gather({
            speechTimeout: 3,
            timeout: 10,
            action: '/api/handle-tracking',
            hints: ['order', 'number', 'tracking']
          });
        break;

      case 'pricing':
        twiml
          .say(response, language)
          .pause(2)
          .say(yuvaMessages[language].goodbye, language)
          .hangup();
        break;

      case 'goodbye':
        twiml
          .say(response, language)
          .hangup();
        break;

      default:
        twiml
          .say(response, language)
          .pause(1)
          .say(yuvaMessages[language].mainMenu, language)
          .gather({
            speechTimeout: 3,
            timeout: 10,
            action: '/api/process-intent',
            hints: ['booking', 'appointment', 'price', 'wedding', 'photo']
          });
    }
    
    return twiml;
  }

  extractOrderNumber(text: string): string | null {
    const patterns = [
      /order\s*#?\s*(\w+)/i,
      /order\s*number\s*#?\s*(\w+)/i,
      /ऑर्डर\s*#?\s*(\w+)/i,
      /\b([A-Z]{2,3}\d{4,})\b/,
      /\b(\d{6,})\b/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  getTimeBasedGreeting(language: 'en' | 'hi'): string {
    const hour = new Date().getHours();
    const businessConfig = getBusinessConfig();
    
    if (language === 'hi') {
      if (hour < 12) return `सुप्रभात! ${businessConfig.name} में आपका स्वागत है।`;
      if (hour < 17) return `नमस्ते! ${businessConfig.name} में आपका स्वागत है।`;
      return `शुभ संध्या! ${businessConfig.name} में आपका स्वागत है।`;
    } else {
      if (hour < 12) return `Good morning! Welcome to ${businessConfig.name}.`;
      if (hour < 17) return `Good afternoon! Welcome to ${businessConfig.name}.`;
      return `Good evening! Welcome to ${businessConfig.name}.`;
    }
  }

  async handleBookingStep(
    currentStep: string,
    userInput: string,
    session: any,
    language: 'hi' | 'en'
  ): Promise<{
    sessionUpdates: any;
    nextStep?: string;
    twiml: TwiMLBuilder;
  }> {
    const twiml = new TwiMLBuilder();
    let sessionUpdates = {};
    let nextStep: string | undefined;

    switch (currentStep) {
      case 'booking_start':
        sessionUpdates = {
          userData: { ...session.userData, name: userInput }
        };
        nextStep = 'booking_service';
        
        twiml
          .say(yuvaMessages[language].booking.getService, language)
          .gather({
            speechTimeout: 3,
            timeout: 10,
            action: '/api/handle-booking',
            hints: ['wedding', 'portrait', 'birthday', 'product', 'photo']
          });
        break;

      case 'booking_service':
        const selectedService = this.findMatchingService(userInput);
        
        if (selectedService) {
          sessionUpdates = {
            userData: { 
              ...session.userData, 
              serviceType: selectedService.id, 
              serviceName: selectedService.name 
            }
          };
          nextStep = 'booking_contact';
          
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
        break;

      case 'booking_contact':
        sessionUpdates = {
          userData: { ...session.userData, contactNumber: userInput }
        };
        nextStep = 'main_menu';
        
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
        break;

      default:
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
    }

    return { sessionUpdates, nextStep, twiml };
  }

  private findMatchingService(userInput: string): any {
    const config = getBusinessConfig();
    const lowerInput = userInput.toLowerCase();
    
    for (const service of config.services) {
      if (service.isActive) {
        const keywords = [...service.keywords, ...service.keywordsHi];
        if (keywords.some(keyword => lowerInput.includes(keyword.toLowerCase()))) {
          return service;
        }
      }
    }
    return null;
  }

  async handleTrackingStep(
    userInput: string,
    language: 'hi' | 'en'
  ): Promise<{
    twiml: TwiMLBuilder;
  }> {
    const twiml = new TwiMLBuilder();
    const orderNumber = this.extractOrderNumber(userInput);
    
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

    return { twiml };
  }
}

// Create a default instance for easy importing
export const voiceService = new VoiceService();
