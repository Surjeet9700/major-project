import { OpenRouterService } from './openrouter';
import { RAGService } from './ragService';
import { getBusinessConfig } from '../config/business';
import { emailService } from './emailService';

interface ConversationSession {
  sessionId: string;
  user?: any;
  conversationHistory: any[];
  extractedData: any;
  language: "hi" | "en";
  createdAt: Date;
  bookingInProgress: boolean;
  customerEmail?: string;
  currentIntent?: string;
  contextStack?: string[];
  lastUserInput?: string;
  conversationState?: 'greeting' | 'service_inquiry' | 'pricing_inquiry' | 'booking_start' | 'collecting_info' | 'booking_confirmation' | 'upselling' | 'closing';
}

interface Appointment {
  id: string
  customerId?: string
  customerName: string
  customerPhone: string
  service: string
  date: string
  time: string
  status: string
  createdAt: Date
}

interface Order {
  id: string
  customerId?: string
  customerName?: string
  customerPhone?: string
  items?: string[]
  status?: string
  orderDate?: Date
  estimatedDelivery?: Date
  deliveryAddress?: string
  totalAmount?: number
  paymentStatus?: string
  statusHistory?: { status: string; timestamp: Date; notes?: string }[]
}

class FreeVoiceService {
  private sessions: Map<string, ConversationSession> = new Map();
  private users: any[] = [];
  private appointments: Appointment[] = [];
  private orders: Order[] = [];
  private openRouterService: OpenRouterService;
  private ragService: RAGService;

  constructor() {
    this.openRouterService = new OpenRouterService();
    this.ragService = new RAGService();
  }

  async processConversation(
    sessionId: string,
    userInput: string,
    language: "hi" | "en" = "en"
  ): Promise<{ response: string; intent: string; visualData?: any; nextAction?: string }> {
    try {
      let session = this.sessions.get(sessionId);

      if (!session) {
        session = this.createNewSession(sessionId, language);
        this.sessions.set(sessionId, session);
      }

      // Update session with current input
      session.lastUserInput = userInput;
      session.language = language;

      // --- LLM-based intent and entity extraction ---
      const llmResult = await this.openRouterService.extractIntentAndEntitiesLLM(userInput, language);
      session.currentIntent = llmResult.intent;
      // Merge extracted entities into session.extractedData
      session.extractedData = { ...session.extractedData, ...llmResult.entities };

      // Update conversation state
      this.updateConversationState(session, llmResult.intent);

      // Add to conversation history
      session.conversationHistory.push({
        role: "user",
        content: userInput,
        intent: llmResult.intent,
        timestamp: new Date(),
      });

      // --- Enhanced Natural & Sales-Focused Response Logic ---
      let response = "";
      try {
        const ragResponse = await this.ragService.generateRAGResponse(userInput, language, {
          extractedData: session.extractedData,
          conversationHistory: session.conversationHistory
        });
        if (ragResponse && ragResponse.length > 20) {
          response = this.addSalesPersonality(ragResponse, language, session);
        } else {
          response = await this.generateIntentBasedResponse(llmResult.intent, language, session);
        }
      } catch (error) {
        console.log("RAG service error, using fallback:", error);
        response = await this.generateIntentBasedResponse(llmResult.intent, language, session);
      }

      // Add agent response to history
      session.conversationHistory.push({
        role: "assistant",
        content: response,
        intent: llmResult.intent,
        timestamp: new Date(),
      });

      return {
        response: this.cleanForTTS(response),
        intent: llmResult.intent,
        visualData: this.generateVisualData(session, llmResult.intent),
        nextAction: this.determineNextAction(session, llmResult.intent)
      };
    } catch (error) {
      console.error("Error in processConversation:", error);
      const fallback = language === "hi"
        ? "क्षमा करें, कुछ तकनीकी समस्या है। कृपया फिर कोशिश करें।"
        : "Sorry, there's a technical issue. Please try again.";
      return { response: this.cleanForTTS(fallback), intent: 'clarification' };
    }
  }

  private createNewSession(sessionId: string, language: "hi" | "en"): ConversationSession {
    return {
      sessionId,
      conversationHistory: [],
      extractedData: { name: "", phone: "", service: "", date: "", time: "" },
      language,
      createdAt: new Date(),
      bookingInProgress: false,
      conversationState: 'greeting',
      contextStack: []
    };
  }

  private updateConversationState(session: ConversationSession, intent: string) {
    switch (intent) {
      case 'service_inquiry':
        session.conversationState = 'service_inquiry';
        break;
      case 'pricing_inquiry':
        session.conversationState = 'pricing_inquiry';
        break;
      case 'booking_start':
        session.conversationState = 'booking_start';
        break;
      case 'provide_name':
      case 'provide_phone':
        session.conversationState = 'collecting_info';
        break;
      case 'confirmation':
        if (this.hasAllBookingInfo(session)) {
          session.conversationState = 'booking_confirmation';
        }
        break;
      default:
        // Keep current state if no specific transition
        break;
    }
  }

  private hasAllBookingInfo(session: ConversationSession): boolean {
    return !!(session.extractedData.name && session.extractedData.phone && 
              session.extractedData.service && session.extractedData.date);
  }

  private async generateContextualResponse(session: ConversationSession, userInput: string, intent: string): Promise<{ response: string; visualData?: any; nextAction?: string }> {
    const businessConfig = getBusinessConfig();
    
    try {
      // Build context-aware system prompt
      const systemPrompt = this.buildSmartSystemPrompt(session, businessConfig);
      
      // Build conversation context
      const conversationContext = session.conversationHistory
        .slice(-6)
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${systemPrompt}

CONVERSATION CONTEXT:
${conversationContext}

CURRENT USER INPUT: ${userInput}
DETECTED INTENT: ${intent}
CONVERSATION STATE: ${session.conversationState}
EXTRACTED DATA: ${JSON.stringify(session.extractedData, null, 2)}

INSTRUCTIONS:
- Respond naturally and contextually to the user's intent
- Use the conversation state to guide your response
- Don't repeat information already provided
- Be conversational, helpful, and persuasive
- Respond in ${session.language === 'hi' ? 'Hindi' : 'English'}
- Keep responses concise but complete
- Use sales techniques when appropriate
- Handle the detected intent appropriately

RESPONSE:`;

      const llmResponse = await this.openRouterService.generateResponse(
        fullPrompt,
        session.language,
        [conversationContext, `Intent: ${intent}`, `State: ${session.conversationState}`]
      );

      let response = llmResponse?.text?.trim() || this.getFallbackResponse(session, intent);
      
      // Handle booking completion
      if (intent === 'confirmation' && this.hasAllBookingInfo(session) && session.conversationState === 'booking_confirmation') {
        const bookingResult = await this.completeBooking(session);
        response += " " + bookingResult;
        return {
          response,
          visualData: { type: 'booking_confirmation', bookingId: session.extractedData.bookingId },
          nextAction: 'payment_offer'
        };
      }

      // Generate visual data based on intent
      const visualData = this.generateVisualData(session, intent);

      return {
        response,
        visualData,
        nextAction: this.determineNextAction(session, intent)
      };

    } catch (error) {
      console.error("Error generating contextual response:", error);
      return {
        response: this.getFallbackResponse(session, intent),
        visualData: null
      };
    }
  }

  private buildSmartSystemPrompt(session: ConversationSession, businessConfig: any): string {
    const customerName = session.extractedData?.name || '';
    const socialProof = session.language === "hi"
      ? "हमारे 500+ संतुष्ट ग्राहक हैं और हमारी रेटिंग 4.9/5 है।"
      : "We have 500+ happy customers and a 4.9/5 rating.";

    return session.language === "hi" ? `
आप युवा डिजिटल स्टूडियो के स्मार्ट AI वॉइस एजेंट हैं।

सेवाएं और कीमतें:
- शादी की फोटोग्राफी: ₹35,000 - ₹1,25,000 (6-12 घंटे)
- पोर्ट्रेट सेशन: ₹2,500 - ₹4,500 (1-2 घंटे)  
- इवेंट फोटोग्राफी: ₹5,000 - ₹8,500 (3-5 घंटे)
- पासपोर्ट फोटो: ₹200 - ₹500

${socialProof}

महत्वपूर्ण निर्देश:
- ग्राहक के नाम का उपयोग करें (${customerName ? customerName : 'नाम नहीं दिया गया'})
- संदर्भ को समझें और उचित प्रतिक्रिया दें
- पहले से दी गई जानकारी को दोहराएं नहीं
- प्राकृतिक और मददगार बातचीत करें
- बिक्री तकनीकों का उपयोग करें
- बुकिंग पूरी होने पर भुगतान और कैलेंडर की पेशकश करें
` : `
You are the smart AI voice agent for Yuva Digital Studio.

Services and Pricing:
- Wedding Photography: ₹35,000 - ₹1,25,000 (6-12 hours)
- Portrait Sessions: ₹2,500 - ₹4,500 (1-2 hours)
- Event Photography: ₹5,000 - ₹8,500 (3-5 hours)
- Passport Photos: ₹200 - ₹500

${socialProof}

Important Instructions:
- Use customer's name (${customerName ? customerName : 'name not provided'})
- Understand context and provide appropriate responses
- Don't repeat information already provided
- Keep conversation natural and helpful
- Use sales techniques when appropriate
- Offer payment and calendar after booking completion
`;
  }

  private generateVisualData(session: ConversationSession, intent: string): any {
    switch (intent) {
      case 'service_inquiry':
        return {
          type: 'services_display',
          services: [
            { name: 'Wedding Photography', price: '₹35,000 - ₹1,25,000', duration: '6-12 hours' },
            { name: 'Portrait Sessions', price: '₹2,500 - ₹4,500', duration: '1-2 hours' },
            { name: 'Event Photography', price: '₹5,000 - ₹8,500', duration: '3-5 hours' },
            { name: 'Passport Photos', price: '₹200 - ₹500', duration: '15-30 mins' }
          ]
        };
      case 'pricing_inquiry':
        return {
          type: 'pricing_display',
          service: session.extractedData.service || 'all',
          pricing: {
            wedding: { range: '₹35,000 - ₹1,25,000', features: ['Full day coverage', 'Online gallery', 'Professional editing'] },
            portrait: { range: '₹2,500 - ₹4,500', features: ['Professional lighting', 'Multiple outfits', 'Retouched images'] },
            event: { range: '₹5,000 - ₹8,500', features: ['Event coverage', 'Candid shots', 'Quick turnaround'] }
          }
        };
      case 'booking_start':
        return {
          type: 'booking_form',
          fields: ['name', 'phone', 'service', 'date', 'time'],
          completed: Object.keys(session.extractedData).filter(key => session.extractedData[key])
        };
      default:
        return null;
    }
  }

  private determineNextAction(session: ConversationSession, intent: string): string {
    switch (intent) {
      case 'service_inquiry':
        return 'show_services';
      case 'pricing_inquiry':
        return 'show_pricing';
      case 'booking_start':
        return 'collect_info';
      case 'confirmation':
        if (this.hasAllBookingInfo(session)) {
          return 'complete_booking';
        }
        return 'collect_missing_info';
      default:
        return 'continue_conversation';
    }
  }

  private getFallbackResponse(session: ConversationSession, intent: string): string {
    const responses = {
      service_inquiry: session.language === "hi" 
        ? "हम शादी की फोटोग्राफी, पोर्ट्रेट सेशन, इवेंट फोटोग्राफी और पासपोर्ट फोटो की सेवाएं देते हैं। कौन सी सेवा में आपकी रुचि है?"
        : "We offer wedding photography, portrait sessions, event photography, and passport photos. Which service interests you?",
      pricing_inquiry: session.language === "hi"
        ? "हमारी कीमतें सेवा के अनुसार अलग-अलग हैं। कौन सी सेवा के बारे में जानना चाहते हैं?"
        : "Our prices vary by service. Which service would you like to know about?",
      booking_start: session.language === "hi"
        ? "बुकिंग के लिए कृपया अपना नाम और फोन नंबर बताएं।"
        : "For booking, please provide your name and phone number.",
      default: session.language === "hi"
        ? "कृपया और जानकारी दें।"
        : "Please provide more information."
    };

    return responses[intent as keyof typeof responses] || responses.default;
  }

  // Integration stubs
  private offerPaymentLink(bookingId: string) {
    console.log(`[STUB] Offer payment link for booking: ${bookingId}`);
    return `https://payment.example.com/pay/${bookingId}`;
  }

  private offerCalendarInvite(appointment: Appointment) {
    console.log(`[STUB] Offer calendar invite for appointment:`, appointment);
    return `Calendar invite would be sent for ${appointment.date} at ${appointment.time}`;
  }

  private logToCRM(appointment: Appointment) {
    console.log(`[STUB] Log appointment to CRM:`, appointment);
  }

  private trackAnalytics(event: string, data: any) {
    console.log(`[STUB] Track analytics event: ${event}`, data);
  }

  private async completeBooking(session: ConversationSession): Promise<string> {
    session.bookingInProgress = true;
    
    const appointment = {
      id: `APT${Date.now().toString().slice(-6)}`,
      customerName: session.extractedData.name,
      customerPhone: session.extractedData.phone,
      service: session.extractedData.service,
      date: session.extractedData.date,
      time: session.extractedData.time || "To be confirmed",
      status: "confirmed",
      createdAt: new Date(),
    };

    this.appointments.push(appointment);
    session.extractedData.bookingId = appointment.id;
    
    this.logToCRM(appointment);
    this.trackAnalytics('booking_completed', appointment);
    console.log('📅 Booking completed:', appointment);

    // Send email confirmation
    if (session.customerEmail) {
      try {
        const emailResult = await emailService.sendBookingConfirmation({
          customerName: session.extractedData.name,
          customerEmail: session.customerEmail,
          customerPhone: session.extractedData.phone,
          service: session.extractedData.service,
          date: session.extractedData.date,
          time: session.extractedData.time || "To be confirmed",
          bookingId: appointment.id,
          language: session.language
        });

        if (emailResult.success) {
          console.log('📧 Email confirmation sent successfully');
        } else {
          console.error('📧 Failed to send email confirmation:', emailResult.error);
        }
      } catch (error) {
        console.error('📧 Error sending email confirmation:', error);
      }
    }

    // Offer payment and calendar
    const paymentLink = this.offerPaymentLink(appointment.id);
    const calendarInvite = this.offerCalendarInvite(appointment);

    return session.language === "hi" 
      ? `बुकिंग कन्फर्म! ID: ${appointment.id}। सेवा: ${appointment.service}, नाम: ${appointment.customerName}, फोन: ${appointment.customerPhone}, दिनांक: ${appointment.date}, समय: ${appointment.time}।\n${calendarInvite}\nभुगतान लिंक: ${paymentLink}। हम आपको कॉल करके time confirm करेंगे। धन्यवाद!`
      : `Booking confirmed! ID: ${appointment.id}. Service: ${appointment.service}, Name: ${appointment.customerName}, Phone: ${appointment.customerPhone}, Date: ${appointment.date}, Time: ${appointment.time}.\n${calendarInvite}\nPayment link: ${paymentLink}. We'll call you to confirm the timing. Thank you!`;
  }

  private cleanForTTS(text: string): string {
    return text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/\#/g, "")
      .replace(/\[([^\]]+)\]/g, "$1")
      .replace(/\(([^\)]+)\)/g, "$1")
      .replace(/₹/g, "rupees ")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Session management
  getSession(sessionId: string) {
    return this.sessions.get(sessionId);
  }

  setSessionEmail(sessionId: string, email: string): void {
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      session = this.createNewSession(sessionId, 'en');
      this.sessions.set(sessionId, session);
      console.log('📧 Created new session for email setting:', sessionId);
    }
    
    session.customerEmail = email;
    console.log('📧 Email set for session:', { sessionId, email });
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  getAllAppointments() {
    return this.appointments;
  }

  getAllOrders() {
    return this.orders;
  }

  getUserAppointments(userId: string) {
    return this.appointments.filter((apt: Appointment) => apt.customerId === userId);
  }

  getUserOrders(userId: string) {
    return this.orders.filter((order: Order) => order.customerId === userId);
  }

  getAppointmentById(id: string) {
    return this.appointments.find((apt: Appointment) => apt.id === id);
  }

  getOrderById(id: string) {
    return this.orders.find((order: Order) => order.id === id);
  }

  getUsers() {
    return this.users;
  }

  private async generateIntentBasedResponse(intent: string, language: "hi" | "en", session: ConversationSession): Promise<string> {
    const customerName = session.extractedData?.name || '';
    const nameGreeting = customerName ? (language === "hi" ? `${customerName} जी, ` : `${customerName}, `) : '';
    
    switch (intent) {
      case 'greeting':
        return language === "hi" 
          ? `${nameGreeting}नमस्ते! मैं युवा डिजिटल स्टूडियो का AI सहायक हूँ। आज आपकी कैसे मदद कर सकता हूँ? क्या आप फोटोग्राफी सेवाओं के बारे में जानना चाहते हैं या कोई बुकिंग करना चाहते हैं?`
          : `${nameGreeting}Hello! I'm the AI assistant for Yuva Digital Studio. How can I help you today? Would you like to know about our photography services or make a booking?`;
      
      case 'business_info':
        return language === "hi" 
          ? `${nameGreeting}हम युवा डिजिटल स्टूडियो हैं, हैदराबाद का सबसे विश्वसनीय फोटोग्राफी स्टूडियो। पिछले 5 सालों में हमने 500+ संतुष्ट ग्राहकों की यादें सहेजी हैं। हम शादी, पोर्ट्रेट, इवेंट और पासपोर्ट फोटो सेवाएं प्रदान करते हैं। क्या आप किसी विशेष सेवा के बारे में जानना चाहते हैं?`
          : `${nameGreeting}We are Yuva Digital Studio, Hyderabad's most trusted photography studio. Over the past 5 years, we've captured memories for 500+ satisfied customers. We offer wedding, portrait, event, and passport photo services. Would you like to know about any specific service?`;
      
      case 'services':
        return language === "hi" 
          ? `${nameGreeting}हमारी प्रमुख सेवाएं हैं: शादी की फोटोग्राफी (₹35,000-₹1,25,000), पोर्ट्रेट सेशन (₹2,500-₹4,500), इवेंट फोटोग्राफी (₹5,000-₹8,500), और पासपोर्ट फोटो (₹200-₹500)। सभी पैकेज में प्रोफेशनल एडिटिंग और ऑनलाइन गैलरी शामिल है। कौन सी सेवा आपको सबसे अच्छी लगती है?`
          : `${nameGreeting}Our main services are: Wedding photography (₹35,000-₹1,25,000), Portrait sessions (₹2,500-₹4,500), Event photography (₹5,000-₹8,500), and Passport photos (₹200-₹500). All packages include professional editing and online gallery. Which service interests you most?`;
      
      case 'pricing':
        return language === "hi" 
          ? `${nameGreeting}हमारी कीमतें बहुत प्रतिस्पर्धी हैं! शादी की फोटोग्राफी ₹35,000 से शुरू होती है, पोर्ट्रेट ₹2,500 से, और इवेंट ₹5,000 से। अभी बुकिंग करने पर 10% की छूट भी मिलेगी। क्या आप किसी विशेष पैकेज के बारे में जानना चाहते हैं?`
          : `${nameGreeting}Our prices are very competitive! Wedding photography starts from ₹35,000, portraits from ₹2,500, and events from ₹5,000. You'll also get a 10% discount for booking now. Would you like to know about any specific package?`;
      
      case 'hours':
        return language === "hi" 
          ? `${nameGreeting}हमारे स्टूडियो सुबह 10 बजे से रात 8 बजे तक खुले रहते हैं, सप्ताह के सभी दिन। आप कभी भी आ सकते हैं या ऑनलाइन बुकिंग कर सकते हैं। क्या आप आज या कल आना चाहते हैं?`
          : `${nameGreeting}Our studio is open from 10am to 8pm, all days of the week. You can visit anytime or book online. Would you like to come today or tomorrow?`;
      
      case 'location':
        return language === "hi" 
          ? `${nameGreeting}हमारा स्टूडियो हैदराबाद के मुख्य क्षेत्र में स्थित है। पता है: युवा डिजिटल स्टूडियो, हैदराबाद, तेलंगाना। गूगल मैप्स पर 'Yuva Digital Studio Hyderabad' खोजें। पार्किंग भी उपलब्ध है। क्या आप दिशा-निर्देश चाहते हैं?`
          : `${nameGreeting}Our studio is located in the main area of Hyderabad. Address: Yuva Digital Studio, Hyderabad, Telangana. Search 'Yuva Digital Studio Hyderabad' on Google Maps. Parking is also available. Do you need directions?`;
      
      case 'contact':
        return language === "hi" 
          ? `${nameGreeting}हमसे संपर्क करने के लिए: फोन +91-9876543210, ईमेल info@yuvadigitalstudio.com। व्हाट्सऐप पर भी मैसेज कर सकते हैं। क्या आप अभी कॉल करना चाहते हैं या मैं आपको कॉलबैक दे सकता हूँ?`
          : `${nameGreeting}To contact us: Phone +91-9876543210, Email info@yuvadigitalstudio.com. You can also message us on WhatsApp. Would you like to call now or should I give you a callback?`;
      
      case 'help':
        return language === "hi" 
          ? `${nameGreeting}मैं आपकी पूरी मदद के लिए यहाँ हूँ! आप बुकिंग, सेवाओं, कीमतों, समय, स्थान या किसी अन्य जानकारी के लिए पूछ सकते हैं। क्या आप किसी विशेष चीज़ के बारे में जानना चाहते हैं?`
          : `${nameGreeting}I'm here to help you completely! You can ask about bookings, services, pricing, timing, location, or any other information. Is there something specific you'd like to know about?`;
      
      case 'clarification':
        return language === "hi" 
          ? `${nameGreeting}माफ़ कीजिए, मैं आपकी बात पूरी तरह नहीं समझ पाया। क्या आप बुकिंग करना चाहते हैं, सेवाओं के बारे में जानना चाहते हैं, या कुछ और? कृपया थोड़ा और स्पष्ट करें।`
          : `${nameGreeting}Sorry, I didn't fully understand. Do you want to make a booking, know about services, or something else? Please clarify a bit more.`;
      
      case 'booking':
      case 'booking_continue':
      case 'booking_service':
      case 'service_specific':
        return await this.handleBookingFlow(session, language);
      
      default:
        return language === "hi" 
          ? `${nameGreeting}माफ़ कीजिए, कृपया अपना प्रश्न स्पष्ट करें। मैं आपकी मदद करने के लिए यहाँ हूँ!`
          : `${nameGreeting}Sorry, could you please clarify your question. I'm here to help you!`;
    }
  }

  private async handleBookingFlow(session: ConversationSession, language: "hi" | "en"): Promise<string> {
    const customerName = session.extractedData?.name || '';
    const nameGreeting = customerName ? (language === "hi" ? `${customerName} जी, ` : `${customerName}, `) : '';
    
    if (!session.extractedData.name) {
      return language === "hi" 
        ? `${nameGreeting}बुकिंग के लिए कृपया अपना नाम बताएं। मैं आपकी बुकिंग को आसान बनाने में मदद करूंगा।`
        : `${nameGreeting}For booking, please tell me your name. I'll help make your booking process smooth.`;
    } else if (!session.extractedData.phone) {
      return language === "hi" 
        ? `${nameGreeting}अब कृपया अपना मोबाइल नंबर बताएं। मैं आपको बुकिंग कन्फर्मेशन और रिमाइंडर भेजूंगा।`
        : `${nameGreeting}Now please provide your mobile number. I'll send you booking confirmation and reminders.`;
    } else if (!session.extractedData.service) {
      return language === "hi" 
        ? `${nameGreeting}कौन सी सेवा चाहिए? हमारे पास शादी की फोटोग्राफी, पोर्ट्रेट सेशन, और इवेंट फोटोग्राफी हैं। सभी में प्रोफेशनल एडिटिंग शामिल है।`
        : `${nameGreeting}Which service do you need? We have wedding photography, portrait sessions, and event photography. All include professional editing.`;
    } else if (!session.extractedData.date) {
      return language === "hi" 
        ? `${nameGreeting}कौन सी तारीख चाहिए? हमारे पास अगले महीने तक की उपलब्धता है। जल्दी बुकिंग करने पर बेहतर समय स्लॉट मिलेगा।`
        : `${nameGreeting}Which date do you prefer? We have availability until next month. Early booking gets better time slots.`;
    } else if (!session.extractedData.time) {
      return language === "hi" 
        ? `${nameGreeting}कौन सा समय सुविधाजनक होगा? हम सुबह 10 बजे से शाम 6 बजे तक सेशन करते हैं।`
        : `${nameGreeting}What time would be convenient? We conduct sessions from 10am to 6pm.`;
    } else {
      // All info present, confirm booking
      return await this.completeBooking(session);
    }
  }

  private addSalesPersonality(response: string, language: "hi" | "en", session: ConversationSession): string {
    const customerName = session.extractedData?.name || '';
    const nameGreeting = customerName ? (language === "hi" ? `${customerName} जी, ` : `${customerName}, `) : '';
    
    // Add sales elements to the response
    const salesElements = language === "hi" 
      ? [
          "अभी बुकिंग करने पर 10% की छूट मिलेगी।",
          "हमारे 500+ संतुष्ट ग्राहक हैं।",
          "प्रोफेशनल क्वालिटी की गारंटी।",
          "क्या आप बुकिंग करना चाहते हैं?"
        ]
      : [
          "You'll get a 10% discount for booking now.",
          "We have 500+ satisfied customers.",
          "Guaranteed professional quality.",
          "Would you like to make a booking?"
        ];
    
    // Randomly add one sales element
    const randomElement = salesElements[Math.floor(Math.random() * salesElements.length)];
    
    return `${nameGreeting}${response} ${randomElement}`;
  }
}

export { FreeVoiceService };
export const freeVoiceService = new FreeVoiceService();
