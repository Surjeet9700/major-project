import { OpenRouterService } from './openrouter';
import { getBusinessConfig } from '../config/business';
import { yuvaMessages } from '../utils/yuvaLanguage';

interface ConversationContext {
  language: 'hi' | 'en';
  currentStep: string;
  userData: any;
  conversationHistory: string[];
  businessContext: string;
}

export class ConversationService {
  private openRouterService: OpenRouterService;
  private businessConfig: any;

  constructor() {
    this.openRouterService = new OpenRouterService();
    this.businessConfig = getBusinessConfig();
  }
  async generateNaturalResponse(
    userInput: string,
    context: ConversationContext
  ): Promise<{ response: string; intent: string; nextAction: string }> {
    try {
      const enhancedPrompt = this.buildBusinessPrompt(userInput, context);
      
      const aiResponse = await this.openRouterService.generateResponse(
        enhancedPrompt,
        context.language,
        context.conversationHistory
      );

      const naturalResponse = this.enhanceResponseWithBusinessInfo(
        aiResponse.text,
        context
      );

      return {
        response: this.ensureConciseResponse(naturalResponse, context.language),
        intent: aiResponse.intent || this.detectIntent(userInput, context.language),
        nextAction: aiResponse.nextAction || 'continue'
      };
    } catch (error) {
      console.warn('Conversation Service falling back to rule-based responses:', error);
      return this.getFallbackResponse(userInput, context);
    }
  }
  private buildBusinessPrompt(userInput: string, context: ConversationContext): string {
    const businessInfo = `Business: ${this.businessConfig.name}, Services: ${this.businessConfig.services.map((s: any) => s.name).join(', ')}`;
    
    const conversationRules = context.language === 'hi' 
      ? `आप ${this.businessConfig.name} के लिए एक दोस्ताना वॉयस असिस्टेंट हैं। संक्षिप्त और मददगार उत्तर दें। फोटोग्राफी सेवाओं के लिए अपॉइंटमेंट बुक करने में मदद करें।`
      : `You are a friendly voice assistant for ${this.businessConfig.name}. Give brief, helpful responses. Help book appointments for photography services.`;

    const stepContext = this.getStepContext(context.currentStep, context.language);
    
    return `${conversationRules}\n${businessInfo}\n${stepContext}\nUser: ${userInput}`;
  }

  private getStepContext(step: string, language: 'hi' | 'en'): string {
    const stepContexts: { [key: string]: string } = {
      'booking_start': language === 'hi' 
        ? 'उपयोगकर्ता अपॉइंटमेंट बुक करना चाहता है। उनका नाम पूछें।'
        : 'User wants to book appointment. Ask for their name.',
      'booking_service': language === 'hi'
        ? 'नाम मिल गया। अब फोटोग्राफी सेवा पूछें (शादी, पोर्ट्रेट, जन्मदिन)।'
        : 'Got name. Now ask which photography service (wedding, portrait, birthday).',
      'booking_contact': language === 'hi'
        ? 'सेवा चुनी गई। अब फोन नंबर पूछें।'
        : 'Service selected. Now ask for phone number.',
      'main_menu': language === 'hi'
        ? 'मुख्य मेनू। विकल्प दें: बुकिंग, ट्रैकिंग, कीमत।'
        : 'Main menu. Offer options: booking, tracking, pricing.'
    };

    return stepContexts[step] || '';
  }

  private enhanceResponseWithBusinessInfo(response: string, context: ConversationContext): string {
    if (context.currentStep === 'main_menu' && !response.includes(this.businessConfig.name)) {
      const greeting = context.language === 'hi' 
        ? `${this.businessConfig.name} में आपका स्वागत है। `
        : `Welcome to ${this.businessConfig.name}. `;
      return greeting + response;
    }

    if (response.includes('price') || response.includes('कीमत')) {
      const pricingHint = context.language === 'hi'
        ? ' हमारी सेवाएं ₹2,500 से शुरू होती हैं।'
        : ' Our services start from ₹2,500.';
      return response + pricingHint;
    }

    return response;
  }

  private ensureConciseResponse(response: string, language: 'hi' | 'en'): string {
    const sentences = response.split(/[.।]/);
    
    if (sentences.length > 2) {
      return sentences.slice(0, 2).join(language === 'hi' ? '। ' : '. ') + (language === 'hi' ? '।' : '.');
    }
    
    if (response.length > 120) {
      return response.substring(0, 120).trim() + (language === 'hi' ? '...' : '...');
    }
    
    return response;
  }

  private detectIntent(userInput: string, language: 'hi' | 'en'): string {
    const input = userInput.toLowerCase();
    
    const intents = {
      booking: language === 'hi' 
        ? ['बुक', 'अपॉइंटमेंट', 'मिलना', 'समय']
        : ['book', 'appointment', 'schedule', 'meet'],
      tracking: language === 'hi'
        ? ['ट्रैक', 'ऑर्डर', 'स्थिति']
        : ['track', 'order', 'status'],
      pricing: language === 'hi'
        ? ['कीमत', 'दाम', 'पैसा']
        : ['price', 'cost', 'money'],
      goodbye: language === 'hi'
        ? ['अलविदा', 'बाय', 'धन्यवाद']
        : ['bye', 'goodbye', 'thanks']
    };

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        return intent;
      }
    }

    return 'general';
  }
  private getFallbackResponse(userInput: string, context: ConversationContext): { response: string; intent: string; nextAction: string } {
    const detectedIntent = this.detectIntent(userInput, context.language);
    
    let fallbackMessage = '';
    
    switch (detectedIntent) {
      case 'booking':
        fallbackMessage = context.language === 'hi'
          ? 'मैं आपकी बुकिंग में मदद कर सकता हूं। कृपया अपना नाम बताएं।'
          : 'I can help you with booking. Please tell me your name.';
        break;
      case 'pricing':
        fallbackMessage = context.language === 'hi'
          ? 'हमारी सेवाएं ₹2500 से शुरू होती हैं। विस्तार के लिए संपर्क करें।'
          : 'Our services start from ₹2500. Contact us for details.';
        break;
      case 'tracking':
        fallbackMessage = context.language === 'hi'
          ? 'कृपया अपना ऑर्डर नंबर बताएं।'
          : 'Please provide your order number.';
        break;
      default:
        fallbackMessage = context.language === 'hi'
          ? 'माफ़ करें, मुझे समझ नहीं आया। कृपया फिर से कहें।'
          : 'Sorry, I did not understand. Please try again.';
    }

    return {
      response: fallbackMessage,
      intent: detectedIntent,
      nextAction: detectedIntent === 'unknown' ? 'repeat' : 'continue'
    };
  }

  async handleGeneralConversation(
    userInput: string,
    language: 'hi' | 'en',
    conversationHistory: string[]
  ): Promise<string> {
    try {
      const businessPrompt = language === 'hi'
        ? `आप ${this.businessConfig.name} के लिए एक मित्रवत असिस्टेंट हैं। फोटोग्राफी सेवाओं के बारे में संक्षिप्त जानकारी दें।`
        : `You are a friendly assistant for ${this.businessConfig.name}. Give brief information about photography services.`;

      const response = await this.openRouterService.generateResponse(
        `${businessPrompt}\nUser: ${userInput}`,
        language,
        conversationHistory
      );

      return this.ensureConciseResponse(response.text, language);
    } catch (error) {
      return language === 'hi' 
        ? 'मैं आपकी सहायता के लिए यहाँ हूँ।'
        : 'I am here to help you.';
    }
  }
}

export const conversationService = new ConversationService();
