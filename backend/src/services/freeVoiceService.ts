import { OpenRouterService } from './openrouter';
import { RAGService } from './ragService';
import { getBusinessConfig } from '../config/business';

interface ConversationSession {
  sessionId: string;
  user?: any;
  conversationHistory: any[];
  extractedData: any;
  language: "hi" | "en";
  createdAt: Date;
  bookingInProgress: boolean;
}

class FreeVoiceService {
  private sessions: Map<string, ConversationSession> = new Map();
  private users: any[] = [];
  private appointments: any[] = [];
  private orders: any[] = [];
  private openRouterService: OpenRouterService;
  private ragService: RAGService;

  constructor() {
    this.openRouterService = new OpenRouterService();
    this.ragService = new RAGService();
  }

  async processConversation(
    sessionId: string,
    userInput: string,
    language: "hi" | "en" = "hi"
  ): Promise<string> {
    try {
      let session = this.sessions.get(sessionId);

      if (!session) {
        session = this.createNewSession(sessionId, language);
        this.sessions.set(sessionId, session);
      }

      // Extract user data first
      this.extractUserData(session, userInput);
      console.log(`📊 After extraction - Name: ${session.extractedData.name}, Phone: ${session.extractedData.phone}, Service: ${session.extractedData.service}, Date: ${session.extractedData.date}`);

      // Add user input to history
      session.conversationHistory.push({
        role: "user",
        content: userInput,
        timestamp: new Date(),
      });

      // Generate intelligent response using LLM
      const response = await this.generateIntelligentResponse(session, userInput);

      // Add agent response to history
      session.conversationHistory.push({
        role: "assistant", 
        content: response,
        timestamp: new Date(),
      });

      console.log(`🤖 Generated response: "${response.substring(0, 100)}..."`);
      console.log(`📊 Session data - Name: ${session.extractedData.name}, Phone: ${session.extractedData.phone}`);

      // Clean response for TTS
      return this.cleanForTTS(response);
    } catch (error) {
      console.error("Error in processConversation:", error);
      const fallback = language === "hi" 
        ? "क्षमा करें, कुछ तकनीकी समस्या है। कृपया फिर कोशिश करें।"
        : "Sorry, there's a technical issue. Please try again.";
      return this.cleanForTTS(fallback);
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
    };
  }

  private async generateIntelligentResponse(session: ConversationSession, userInput: string): Promise<string> {
    const businessConfig = getBusinessConfig();
    
    try {
      // Build comprehensive system prompt with full business context
      const systemPrompt = this.buildSystemPrompt(session, businessConfig);
      
      // Build conversation context
      const conversationHistory = session.conversationHistory
        .slice(-8) // Increased context for better responses
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      // Check if all booking details are present
      const bookingStatus = this.getBookingStatus(session);

      // Create complete prompt for LLM with enhanced context
      const fullPrompt = `${systemPrompt}

CONVERSATION HISTORY:
${conversationHistory}

CURRENT USER INPUT: ${userInput}

CUSTOMER DATA STATUS:
- Name: ${session.extractedData.name || "Not provided"}
- Phone: ${session.extractedData.phone || "Not provided"}  
- Service Interest: ${session.extractedData.service || "Not specified"}
- Preferred Date: ${session.extractedData.date || "Not specified"}
- Preferred Time: ${session.extractedData.time || "Not specified"}

BOOKING STATUS: ${bookingStatus}

INSTRUCTIONS:
- Respond naturally and intelligently to the user's query
- CRITICALLY IMPORTANT: Look at the conversation history to avoid repeating questions
- If customer data shows a name/phone/service is already provided, DO NOT ask for it again
- ${bookingStatus === 'ready_to_complete' ? 'All details collected - confirm the booking' : 'Continue the conversation naturally based on what information is still needed'}
- If user provides name/phone/service details, acknowledge them and ask for missing information smoothly
- For service inquiries, provide relevant information from business config
- Keep responses conversational, helpful, and never repetitive
- Respond in ${session.language === 'hi' ? 'Hindi' : 'English'} only
- Be concise (2-3 sentences max) but informative
- NEVER ask the same question twice in a row
- ALWAYS check customer data status before asking for information

RESPONSE:`;

      console.log(`🧠 Sending to LLM: "${userInput}" | Status: ${bookingStatus}`);
      
      // Use OpenRouter to generate response
      const llmResponse = await this.openRouterService.generateResponse(
        fullPrompt,
        session.language,
        []
      );

      if (llmResponse && llmResponse.text && llmResponse.text.trim().length > 0) {
        let response = llmResponse.text.trim();
        
        // Handle booking completion if user provides all details
        if (bookingStatus === 'ready_to_complete' && !session.bookingInProgress) {
          const bookingConfirmation = await this.completeBooking(session);
          response += " " + bookingConfirmation;
        }
        
        return response;
      }

      // Enhanced fallback if LLM fails
      return this.getIntelligentFallback(session, userInput, bookingStatus);
      
    } catch (error) {
      console.error("Error generating LLM response:", error);
      return this.getIntelligentFallback(session, userInput, this.getBookingStatus(session));
    }
  }

  private getBookingStatus(session: ConversationSession): string {
    const { name, phone, service, date } = session.extractedData;
    
    if (name && phone && service && date) {
      return 'ready_to_complete';
    } else if (name || phone || service) {
      return 'partial_details';
    } else {
      return 'initial_conversation';
    }
  }

  private getIntelligentFallback(session: ConversationSession, userInput: string, bookingStatus: string): string {
    const lowerInput = userInput.toLowerCase();
    
    // Context-aware fallbacks based on booking status
    if (bookingStatus === 'ready_to_complete') {
      return session.language === "hi" 
        ? "सभी details मिल गईं। क्या मैं आपकी booking confirm करूं?"
        : "I have all your details. Shall I confirm your booking?";
    }
    
    if (bookingStatus === 'partial_details') {
      const missing = [];
      if (!session.extractedData.name) missing.push(session.language === "hi" ? "नाम" : "name");
      if (!session.extractedData.phone) missing.push(session.language === "hi" ? "फोन नंबर" : "phone number");
      if (!session.extractedData.service) missing.push(session.language === "hi" ? "service" : "service");
      if (!session.extractedData.date) missing.push(session.language === "hi" ? "date" : "date");
      
      const missingText = missing.join(session.language === "hi" ? " और " : " and ");
      return session.language === "hi" 
        ? `बस ${missingText} चाहिए booking के लिए।`
        : `I just need your ${missingText} to complete the booking.`;
    }
    
    // Service-based intelligent responses
    if (lowerInput.includes("book") || lowerInput.includes("appointment")) {
      return session.language === "hi" 
        ? "बुकिंग के लिए नाम, फोन नंबर और कौन सी service चाहिए - बताएं।"
        : "For booking, I need your name, phone number, and which service you want.";
    }
    
    if (lowerInput.includes("service") || lowerInput.includes("photography")) {
      return session.language === "hi" 
        ? "हमारी services: Wedding (35 हज़ार से), Portrait (2500 से), Event (5000 से)। कौन सी चाहिए?"
        : "Our services: Wedding (from 35k), Portrait (from 2500), Event (from 5k). Which one?";
    }
    
    if (lowerInput.includes("price") || lowerInput.includes("cost")) {
      return session.language === "hi" 
        ? "Pricing: Wedding 35 हज़ार-1.25 लाख, Portrait 2500-4500, Event 5000-8500 रुपए।"
        : "Pricing: Wedding 35k-1.25L, Portrait 2500-4500, Event 5000-8500 rupees.";
    }
    
    // Default intelligent response
    return session.language === "hi" 
      ? "मैं Yuva Digital Studio से हूँ। Photography services या booking के लिए पूछें।"
      : "I'm from Yuva Digital Studio. Ask about photography services or booking.";
  }

  private buildSystemPrompt(session: ConversationSession, businessConfig: any): string {
    const services = businessConfig.services?.map((s: any) => s.name).join(", ") || "Wedding Photography, Portrait Photography, Event Photography";
    
    const systemPrompt = session.language === "hi" ? `
आप ${businessConfig.name} के लिए एक intelligent AI assistant हैं। आप एक professional photography studio के expert customer service representative हैं।

STUDIO INFORMATION:
- Name: ${businessConfig.name}
- Services: Wedding Photography (₹35,000-₹1,25,000), Portrait Photography (₹2,500-₹4,500), Event Photography (₹5,000-₹8,500), Passport Photos (₹200-₹500)
- Location: ${businessConfig.location?.city || "Hyderabad"}, ${businessConfig.location?.address || "Begum Bazaar"}
- Phone: ${businessConfig.contact?.phone?.[0] || "+91-9876543210"}
- Email: ${businessConfig.contact?.email || "info@yuvadigitalstudio.com"}
- Working Hours: Monday-Saturday 9 AM to 6 PM, Sunday closed
- Experience: 10+ years, 500+ events completed

CAPABILITIES:
1. Handle service inquiries intelligently
2. Provide pricing and package information
3. Manage appointment bookings step-by-step
4. Answer questions about studio, location, hours
5. Handle multiple photographers, equipment questions
6. Provide expert photography advice

BOOKING PROCESS:
- When customer wants to book, collect: Name → Phone → Service → Date → Time
- Be smart about collecting information - don't repeat questions if already provided
- Guide the conversation naturally
- Confirm booking when all details are collected

RESPONSE GUIDELINES:
- Always respond in Hindi (mixing English technical terms is fine)
- Be conversational, professional, and helpful
- Keep responses short (2-3 sentences)
- Be contextually aware of the conversation
- Never repeat the same response
- Handle all photography-related questions intelligently
` : `
You are an intelligent AI assistant for ${businessConfig.name}, a professional photography studio. You are an expert customer service representative.

STUDIO INFORMATION:
- Name: ${businessConfig.name}
- Services: Wedding Photography (₹35,000-₹1,25,000), Portrait Photography (₹2,500-₹4,500), Event Photography (₹5,000-₹8,500), Passport Photos (₹200-₹500)
- Location: ${businessConfig.location?.city || "Hyderabad"}, ${businessConfig.location?.address || "Begum Bazaar"}
- Phone: ${businessConfig.contact?.phone?.[0] || "+91-9876543210"}
- Email: ${businessConfig.contact?.email || "info@yuvadigitalstudio.com"}
- Working Hours: Monday-Saturday 9 AM to 6 PM, Sunday closed
- Experience: 10+ years, 500+ events completed

CAPABILITIES:
1. Handle service inquiries intelligently
2. Provide pricing and package information
3. Manage appointment bookings step-by-step
4. Answer questions about studio, location, hours
5. Handle multiple photographers, equipment questions
6. Provide expert photography advice

BOOKING PROCESS:
- When customer wants to book, collect: Name → Phone → Service → Date → Time
- Be smart about collecting information - don't repeat questions if already provided
- Guide the conversation naturally
- Confirm booking when all details are collected

RESPONSE GUIDELINES:
- Always respond in English
- Be conversational, professional, and helpful
- Keep responses short (2-3 sentences)
- Be contextually aware of the conversation
- Never repeat the same response
- Handle all photography-related questions intelligently
`;

    return systemPrompt;
  }

  private shouldCompleteBooking(session: ConversationSession): boolean {
    return this.getBookingStatus(session) === 'ready_to_complete' && !session.bookingInProgress;
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
    console.log('📅 Booking completed:', appointment);

    const confirmationMessage = session.language === "hi" 
      ? `बुकिंग कन्फर्म! ID: ${appointment.id}। हम आपको कॉल करके time confirm करेंगे। धन्यवाद!`
      : `Booking confirmed! ID: ${appointment.id}. We'll call you to confirm the timing. Thank you!`;

    return confirmationMessage;
  }



  private extractUserData(session: ConversationSession, input: string): void {
    const lowerInput = input.toLowerCase();

    // Extract phone number
    const phonePatterns = [
      /(?:phone|number|contact).*?(\d{10})/i,
      /(\d{10})/,
      /(\d{5}\s*\d{5})/,
      /(\d{4}\s*\d{6})/,
    ];

    for (const pattern of phonePatterns) {
      const phoneMatch = input.match(pattern);
      if (phoneMatch) {
        const phoneDigits = phoneMatch[0].replace(/[^\d]/g, "");
        if (phoneDigits.length >= 10) {
          session.extractedData.phone = phoneDigits.slice(-10);
          console.log('📞 Extracted phone:', session.extractedData.phone);
          break;
        }
      }
    }

    // Extract name (only from explicit statements)
    const namePatterns = [
      /(?:my name is|i am|name is|call me)\s+([a-zA-Z]+(?:\s[a-zA-Z]+)*?)(?:\s+and|\s+my|\s+mobile|\s+phone|$)/i,
      /(?:मेरा नाम|नाम है)\s+([a-zA-Z]+(?:\s[a-zA-Z]+)*?)(?:\s+और|\s+मेरा|$)/i,
    ];

    for (const pattern of namePatterns) {
      const nameMatch = input.match(pattern);
      if (nameMatch && nameMatch[1]) {
        const name = nameMatch[1].trim();
        if (name.length >= 2 && name.length <= 20 && /^[a-zA-Z\s]+$/.test(name)) {
          session.extractedData.name = name;
          console.log('👤 Extracted name:', name);
          break;
        }
      }
    }

    // Extract service type
    if (lowerInput.includes("wedding") || lowerInput.includes("शादी")) {
      session.extractedData.service = "wedding";
    } else if (lowerInput.includes("portrait") || lowerInput.includes("पोर्ट्रेट")) {
      session.extractedData.service = "portrait";
    } else if (lowerInput.includes("event") || lowerInput.includes("birthday") || lowerInput.includes("party")) {
      session.extractedData.service = "event";
    }

    // Extract date
    if (lowerInput.includes("tomorrow") || lowerInput.includes("कल")) {
      session.extractedData.date = "tomorrow";
    } else if (lowerInput.includes("day after tomorrow") || lowerInput.includes("परसों")) {
      session.extractedData.date = "day after tomorrow";
    }
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
    return this.appointments.filter(apt => apt.customerId === userId);
  }

  getUserOrders(userId: string) {
    return this.orders.filter(order => order.customerId === userId);
  }

  getAppointmentById(id: string) {
    return this.appointments.find(apt => apt.id === id);
  }

  getOrderById(id: string) {
    return this.orders.find(order => order.id === id);
  }

  getUsers() {
    return this.users;
  }
}

export { FreeVoiceService };
