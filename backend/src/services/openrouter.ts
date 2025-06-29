import fetch from "node-fetch";
import { config } from "../config";
import { AIResponse } from "../types";
import { getBusinessConfig } from "../config/business";

export class OpenRouterService {
  private apiKey: string;
  private model: string;
  private apiUrl: string;
  private businessConfig: any;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue: boolean = false;
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 1000; // 1 second between requests
  constructor() {
    this.apiKey = config.openRouter.apiKey;
    this.model = config.openRouter.model;
    this.apiUrl = config.openRouter.apiUrl;
    this.businessConfig = getBusinessConfig();

    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY is required in environment variables');
    }
  }  async generateResponse(
    userInput: string,
    language: "hi" | "en",
    context: string[] = []
  ): Promise<AIResponse> {
    return this.queueRequest(() => this.makeAPIRequest(userInput, language, context));
  }

  private async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.minRequestInterval) {
        await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
      }
      
      const request = this.requestQueue.shift();
      if (request) {
        this.lastRequestTime = Date.now();
        await request();
      }
    }
    
    this.isProcessingQueue = false;
  }

  private async makeAPIRequest(
    userInput: string,
    language: "hi" | "en",
    context: string[] = []
  ): Promise<AIResponse> {
    try {
      // Preprocess and validate input
      const processedInput = this.preprocessInput(userInput, language);
      
      // If input is too unclear, use fallback immediately
      if (this.isInputTooUnclear(processedInput)) {
        console.log(`🔄 Input too unclear, using fallback: "${processedInput}"`);
        return this.getRateLimitFallback(processedInput, language, context);
      }

      const messages = this.buildMessages(processedInput, language, context);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": config.server.baseUrl,
          "X-Title": "Yuva Digital Studio Voice Bot",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: 100, // Even shorter for faster, more concise responses
          temperature: 0.2, // Lower temperature for more consistent, complete responses
          stream: false,
          stop: ["\n\n", "User:", "Assistant:"], // Stop tokens to prevent incomplete responses
        }),
      });

      if (response.status === 429) {
        console.warn("Rate limit hit, using intelligent fallback");
        return this.getRateLimitFallback(processedInput, language, context);
      }

      if (!response.ok) {
        console.warn(`OpenRouter API error: ${response.statusText}, using fallback`);
        return this.getErrorFallback(processedInput, language);
      }

      const data = await response.json();
      const messageChoice = data.choices?.[0]?.message;
      const assistantMessage = messageChoice?.content || messageChoice?.reasoning || "";

      // Validate AI response
      if (!assistantMessage || assistantMessage.trim().length < 5) {
        console.warn("AI response too short, using fallback");
        return this.getRateLimitFallback(processedInput, language, context);
      }

      const intent = this.extractIntent(processedInput, language);
      const nextAction = this.determineNextAction(intent, processedInput, language);

      return {
        text: this.cleanResponse(assistantMessage),
        intent: intent,
        confidence: 0.9,
        language: language,
        nextAction: nextAction,
      };
    } catch (error) {
      console.warn("OpenRouter API Error:", error);

      return {
        text: this.getFallbackResponse(userInput, language),
        intent: this.extractIntent(userInput, language),
        confidence: 0.6,
        language: language,
        nextAction: this.determineNextAction(
          this.extractIntent(userInput, language),
          userInput,
          language
        ),
      };
    }
  }

  private preprocessInput(userInput: string, language: "hi" | "en"): string {
    let processed = userInput.trim();
    
    // Remove common speech artifacts
    processed = processed.replace(/\b(um|uh|ah|er|hmm|like|you know|i mean)\b/gi, '');
    processed = processed.replace(/\s+/g, ' '); // Normalize whitespace
    
    // Handle incomplete sentences
    if (processed.endsWith('of') || processed.endsWith('the') || processed.endsWith('a') || 
        processed.endsWith('an') || processed.endsWith('for') || processed.endsWith('to') ||
        processed.endsWith('with') || processed.endsWith('about') || processed.endsWith('on')) {
      // Add context to incomplete sentences
      processed += language === 'hi' ? ' क्या पूछ रहे हैं?' : ' what are you asking about?';
    }
    
    return processed;
  }

  private isInputTooUnclear(input: string): boolean {
    const lowerInput = input.toLowerCase();
    
    // Very short inputs
    if (input.trim().length < 3) return true;
    
    // Incomplete thoughts
    if (lowerInput.includes('modern solution') || lowerInput.includes('sources of')) return true;
    
    // Just question words without context
    if (/^(what|how|why|when|where|who)\s*$/.test(lowerInput)) return true;
    
    // Single words that don't provide enough context
    if (/^[a-zA-Z]+$/.test(input) && input.length < 8) return true;
    
    return false;
  }

  private buildMessages(
    userInput: string,
    language: "hi" | "en",
    context: string[]
  ) {
    const systemPrompt = this.getSystemPrompt(language);
    const contextText =
      context.length > 0
        ? `\nRecent conversation: ${context.slice(-3).join(" ")}`
        : "";

    return [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `${userInput}${contextText}`,
      },
    ];
  }

  private getSystemPrompt(language: "hi" | "en"): string {
    const businessName = this.businessConfig.name;
    const services = this.businessConfig.services
      .map((s: any) => s.name)
      .join(", ");

    if (language === "hi") {
      return `आप ${businessName} के लिए एक बुद्धिमान वॉयस असिस्टेंट हैं। आप एक अनुभवी AI एजेंट हैं जो निम्नलिखित कार्य कर सकते हैं:

व्यावसायिक सेवाएं: ${services}

आपकी जिम्मेदारियां:
1. अपॉइंटमेंट बुकिंग - ग्राहक का नाम, सेवा, और फोन नंबर लें
2. ऑर्डर ट्रैकिंग - ऑर्डर नंबर से स्थिति बताएं  
3. मूल्य निर्धारण - सेवाओं की कीमतें बताएं
4. सामान्य जानकारी - व्यापार के बारे में जानकारी दें

नियम:
- हमेशा 2 लाइन या कम में जवाब दें (वॉयस के लिए)
- विनम्र और सहायक रहें
- अगर उपयोगकर्ता का इनपुट अधूरा या अस्पष्ट है, तो स्पष्टीकरण मांगें
- अगर आप किसी चीज़ के बारे में निश्चित नहीं हैं तो स्पष्ट करने के लिए कहें
- व्यावहारिक कार्रवाई सुझाएं
- कभी भी अधूरा जवाब न दें - हमेशा पूरा और स्पष्ट जवाब दें
- अगर उपयोगकर्ता अधूरा वाक्य बोलता है, तो उसे पूरा करने में मदद करें`;
    } else {
      return `You are an intelligent voice assistant for ${businessName}. You are an experienced AI agent capable of:

Business Services: ${services}

Your responsibilities:
1. Appointment Booking - Collect customer name, service type, and phone number
2. Order Tracking - Provide status updates using order numbers
3. Pricing Information - Share service pricing details
4. General Information - Provide business information

Rules:
- Always respond in 2 lines or less (for voice interaction)
- Be polite and helpful
- If the user's input is incomplete or unclear, ask for clarification
- If unsure about something, ask for clarification
- Suggest practical next steps
- Take initiative to guide the conversation toward booking or helping the customer
- NEVER give incomplete answers - always provide complete and clear responses
- If the user speaks an incomplete sentence, help them complete it
- Handle any type of input gracefully, even if unclear or partial`;
    }
  }  private cleanResponse(text: string): string {
    let cleaned = text
      .replace(/^\s*Assistant:\s*/i, "")
      .replace(/^\s*User:\s*/i, "")
      .trim();
    const sentences = cleaned.split(/[.!?]+/);
    if (sentences.length > 1 && sentences[sentences.length - 1].trim().length < 5) {
      cleaned = sentences.slice(0, -1).join('.') + '.';
    }
    if (cleaned && !cleaned.match(/[.!?]$/)) {
      cleaned += '.';
    }
    return cleaned;
  }

  private extractIntent(userInput: string, language: "hi" | "en"): string {
    const lowerInput = userInput.toLowerCase();

    const intentKeywords = {
      booking: {
        hi: ["अपॉइंटमेंट", "बुकिंग", "बुक", "मिलना", "समय", "फोटोशूट", "शादी"],
        en: [
          "appointment",
          "booking",
          "book",
          "schedule",
          "meet",
          "photoshoot",
          "wedding",
        ],
      },
      tracking: {
        hi: ["ट्रैक", "ऑर्डर", "स्थिति", "कहाँ", "डिलीवरी"],
        en: ["track", "order", "status", "where", "delivery", "shipped"],
      },
      pricing: {
        hi: ["कीमत", "दाम", "फीस", "पैसा", "चार्ज"],
        en: ["price", "cost", "fee", "money", "charge", "rate"],
      },
      help: {
        hi: ["मदद", "सहायता", "जानकारी", "बताओ"],
        en: ["help", "assist", "information", "support", "tell me"],
      },
    };    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      const keywordList = keywords[language];
      if (keywordList && keywordList.some((keyword) => lowerInput.includes(keyword))) {
        return intent;
      }
    }

    return "general";
  }

  private determineNextAction(
    intent: string,
    userInput: string,
    language: "hi" | "en"
  ): string {
    const actionMap: { [key: string]: string } = {
      booking: "collect_booking_details",
      tracking: "collect_order_number",
      pricing: "provide_pricing",
      help: "provide_help",
      general: "continue_conversation",
    };

    return actionMap[intent] || "continue_conversation";
  }

  private getFallbackResponse(
    userInput: string,
    language: "hi" | "en"
  ): string {
    const intent = this.extractIntent(userInput, language);

    switch (intent) {
      case "booking":
        return language === "hi"
          ? "मैं आपकी बुकिंग में मदद कर सकता हूं। कृपया अपना नाम बताएं।"
          : "I can help you with booking. Please tell me your name.";
      case "pricing":
        return language === "hi"
          ? "हमारी सेवाओं की कीमतें शुरू होती हैं ₹5000 से। विस्तार के लिए कॉल करें।"
          : "Our services start from ₹5000. Call for detailed pricing.";
      case "tracking":
        return language === "hi"
          ? "कृपया अपना ऑर्डर नंबर बताएं।"
          : "Please provide your order number.";
      default:
        return language === "hi"
          ? "मैं यहाँ आपकी मदद के लिए हूँ। क्या आप बुकिंग करना चाहते हैं?"
          : "I am here to help you. Would you like to make a booking?";
    }
  }

  async analyzeIntent(
    text: string,
    language: "hi" | "en"
  ): Promise<{
    intent: string;
    confidence: number;
    entities: string[];
  }> {
    try {
      const messages = [
        {
          role: "system",
          content:
            language === "hi"
              ? "आप एक intent classifier हैं। इस वाक्य का मुख्य उद्देश्य पहचानें: booking, tracking, pricing, या help"
              : "You are an intent classifier. Identify the main intent of this sentence: booking, tracking, pricing, or help",
        },
        {
          role: "user",
          content: text,
        },
      ];

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": config.server.baseUrl,
          "X-Title": "Yuva Digital Studio Voice Bot",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: 50,
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.choices?.[0]?.message?.content || "";

        return {
          intent: this.extractIntent(text, language),
          confidence: 0.9,
          entities: this.extractEntities(text),
        };
      }
    } catch (error) {
      console.error("Intent analysis error:", error);
    }

    return {
      intent: this.extractIntent(text, language),
      confidence: 0.8,
      entities: this.extractEntities(text),
    };
  }

  private extractEntities(text: string): string[] {
    const entities: string[] = [];

    const phonePattern = /\b\d{10,12}\b/g;
    const phones = text.match(phonePattern);
    if (phones) entities.push(...phones);

    const datePattern = /\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b/g;
    const dates = text.match(datePattern);
    if (dates) entities.push(...dates);

    const orderPattern = /\b[A-Z]{2,}\d{4,}\b/g;
    const orders = text.match(orderPattern);
    if (orders) entities.push(...orders);

    const namePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
    const names = text.match(namePattern);
    if (names) entities.push(...names);

    return entities;
  }

  async generateActionableResponse(
    userInput: string,
    language: "hi" | "en",
    context: {
      currentStep: string;
      userData: any;
      conversationHistory: string[];
    }
  ): Promise<{
    response: string;
    intent: string;
    nextAction: string;
    suggestedActions: string[];
  }> {
    try {
      const actionPrompt = this.buildActionPrompt(userInput, language, context);

      const messages = [
        {
          role: "system",
          content: actionPrompt,
        },
        {
          role: "user",
          content: userInput,
        },
      ];

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": config.server.baseUrl,
          "X-Title": "Yuva Digital Studio Voice Bot",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: 80,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage = data.choices?.[0]?.message?.content || "";
        const intent = this.extractIntent(userInput, language);

        return {
          response: this.cleanResponse(assistantMessage),
          intent: intent,
          nextAction: this.determineNextAction(intent, userInput, language),
          suggestedActions: this.getSuggestedActions(intent, language),
        };
      }
    } catch (error) {
      console.warn("Actionable response generation failed:", error);
    }

    const intent = this.extractIntent(userInput, language);
    return {
      response: this.getFallbackResponse(userInput, language),
      intent: intent,
      nextAction: this.determineNextAction(intent, userInput, language),
      suggestedActions: this.getSuggestedActions(intent, language),
    };
  }

  private buildActionPrompt(
    userInput: string,
    language: "hi" | "en",
    context: any
  ): string {
    const currentStep = context.currentStep || "welcome";
    const userData = context.userData || {};

    if (language === "hi") {
      return `आप एक AI एजेंट हैं जो ${
        this.businessConfig.name
      } के लिए काम करते हैं।\n\nवर्तमान चरण: ${currentStep}\nउपयोगकर्ता डेटा: ${JSON.stringify(userData)}\n\nआपको उपयोगकर्ता की मदद करनी है और अगला कदम सुझाना है। हमेशा एक ही, पूरी, छोटी पंक्ति में जवाब दें। कभी भी अपना उत्तर अधूरा न छोड़ें।`;
    } else {
      return `You are an AI agent working for ${this.businessConfig.name}.\n\nCurrent step: ${currentStep}\nUser data: ${JSON.stringify(userData)}\n\nYou need to help the user and suggest next steps. Always reply in a single, complete, short sentence. Never cut off your answer.`;
    }
  }
  private getSuggestedActions(intent: string, language: "hi" | "en"): string[] {
    const actionMap: { [key: string]: { hi: string[]; en: string[] } } = {
      booking: {
        hi: ["नाम बताएं", "सेवा चुनें", "फोन नंबर दें"],
        en: ["Provide name", "Choose service", "Give phone number"],
      },
      tracking: {
        hi: ["ऑर्डर नंबर बताएं", "फोन नंबर दें"],
        en: ["Provide order number", "Give phone number"],
      },
      pricing: {
        hi: ["सेवा चुनें", "बुकिंग करें"],
        en: ["Choose service", "Make booking"],
      },
      help: {
        hi: ["बुकिंग करें", "कीमत पूछें"],
        en: ["Make booking", "Ask for pricing"],
      },
    };

    return actionMap[intent]?.[language] || actionMap["help"][language];
  }  private getRateLimitFallback(userInput: string, language: "hi" | "en", context: string[] = []): AIResponse {
    // Extract actual user input if a full prompt was passed
    let actualUserInput = userInput;
    if (userInput.includes("CURRENT USER INPUT:")) {
      const match = userInput.match(/CURRENT USER INPUT:\s*(.+?)(?:\n|$)/);
      if (match && match[1]) {
        actualUserInput = match[1].trim();
      }
    }
    
    const lowerInput = actualUserInput.toLowerCase().trim();
    
    // Handle very short or incomplete inputs
    if (lowerInput.length < 3) {
      return {
        text: language === "hi" 
          ? "मैं आपकी बात समझ नहीं पाया। कृपया अपना सवाल पूरा बताएं।"
          : "I didn't understand. Please complete your question.",
        intent: "clarification",
        confidence: 0.6,
        language: language,
        nextAction: "continue_conversation"
      };
    }
    
    // Parse session context for better understanding
    const contextText = context.join(' ').toLowerCase();
    const hasNameInSession = contextText.includes('name=') && !contextText.includes('name=unknown') && !contextText.includes('name=null');
    const hasPhoneInSession = contextText.includes('phone=') && !contextText.includes('phone=unknown') && !contextText.includes('phone=null');
    const hasServiceInSession = contextText.includes('service=') && !contextText.includes('service=unknown') && !contextText.includes('service=null');
    const hasBookingContext = contextText.includes('book') || contextText.includes('appointment') || contextText.includes('name') || contextText.includes('phone');
    
    console.log(`🔄 Rate limit fallback - Input: "${actualUserInput}" | Has name: ${hasNameInSession}, phone: ${hasPhoneInSession}, service: ${hasServiceInSession}`);
    console.log(`📋 Context: ${contextText}`);
    
    let response = "";
    let intent = "general";
    
    // Handle incomplete sentences or partial thoughts
    if (lowerInput.endsWith("of") || lowerInput.endsWith("the") || lowerInput.endsWith("a") || 
        lowerInput.endsWith("an") || lowerInput.endsWith("for") || lowerInput.endsWith("to") ||
        lowerInput.endsWith("with") || lowerInput.endsWith("about") || lowerInput.endsWith("on") ||
        lowerInput.includes("modern solution") || lowerInput.includes("sources of")) {
      
      if (hasBookingContext) {
        if (!hasNameInSession) {
          response = language === "hi" 
            ? "बुकिंग के लिए कृपया अपना नाम बताएं।"
            : "For booking, please tell me your name.";
        } else if (!hasPhoneInSession) {
          response = language === "hi" 
            ? "अब कृपया अपना मोबाइल नंबर बताएं।"
            : "Now please provide your mobile number.";
        } else if (!hasServiceInSession) {
          response = language === "hi" 
            ? "कौन सी सेवा चाहिए - Wedding, Portrait, या Event फोटोग्राफी?"
            : "Which service do you need - Wedding, Portrait, or Event photography?";
        } else {
          response = language === "hi" 
            ? "आपको और क्या जानकारी चाहिए?"
            : "What other information do you need?";
        }
      } else {
        response = language === "hi" 
          ? "मैं आपकी मदद कर सकता हूं। क्या आप फोटोग्राफी सेवाओं के बारे में जानना चाहते हैं या बुकिंग करना चाहते हैं?"
          : "I can help you. Would you like to know about our photography services or make a booking?";
      }
      intent = "clarification";
    }
    // Handle name provided - check for actual names (proper nouns)
    else if (lowerInput.includes("name is") || lowerInput.includes("i am") || lowerInput.includes("my name") || 
        lowerInput.includes("नाम") || /\b[A-Z][a-z]+\b/.test(actualUserInput)) {
      if (hasNameInSession && !hasPhoneInSession) {
        // Name already captured, need phone
        response = language === "hi" 
          ? "धन्यवाद! अब कृपया अपना मोबाइल नंबर बताएं।"
          : "Thank you! Now please provide your mobile number.";
      } else if (hasNameInSession && hasPhoneInSession && !hasServiceInSession) {
        // Name and phone captured, need service
        response = language === "hi" 
          ? "बढ़िया! अब बताएं कि आपको कौन सी सेवा चाहिए?"
          : "Great! Now tell me which service you need?";
      } else if (!hasNameInSession) {
        // First time providing name
        response = language === "hi" 
          ? "धन्यवाद! अब कृपया अपना मोबाइल नंबर बताएं।"
          : "Thank you! Now please provide your mobile number.";
      } else {
        // All details captured
        response = language === "hi" 
          ? "सभी जानकारी मिल गई है। मैं आपकी बुकिंग कन्फर्म करता हूं।"
          : "I have all the details. Let me confirm your booking.";
      }
      intent = "booking_continue";
    }
    // Handle booking intentions FIRST (before greetings)
    else if (lowerInput.includes("book") || lowerInput.includes("appointment") || lowerInput.includes("अपॉइंटमेंट")) {
      if (!hasNameInSession) {
        response = language === "hi" 
          ? "जरूर! मैं आपकी बुकिंग में मदद करूंगा। कृपया बताएं - आपका नाम क्या है?"
          : "Certainly! I'll help you with booking. Please tell me - what's your name?";
      } else if (!hasPhoneInSession) {
        response = language === "hi" 
          ? "बुकिंग के लिए अब कृपया अपना मोबाइल नंबर बताएं।"
          : "For booking, please provide your mobile number.";
      } else {
        response = language === "hi" 
          ? "कौन सी सेवा चाहिए - Wedding, Portrait, या Event फोटोग्राफी?"
          : "Which service do you need - Wedding, Portrait, or Event photography?";
      }
      intent = "booking";
    }
    // Handle phone number
    else if (/\d{10}/.test(lowerInput) || lowerInput.includes("mobile") || lowerInput.includes("phone")) {
      response = language === "hi" 
        ? "बढ़िया! अब बताएं कि आपको कौन सी सेवा चाहिए - Wedding, Portrait, या Event फोटोग्राफी?"
        : "Great! Now tell me which service you need - Wedding, Portrait, or Event photography?";
      intent = "booking_service";
    }
    // Handle user asking "what's your name" - clarify that AI is asking for user's name
    else if (lowerInput.includes("what") && lowerInput.includes("your") && lowerInput.includes("name")) {
      if (hasBookingContext) {
        if (hasNameInSession && !hasPhoneInSession) {
          response = language === "hi"
            ? "मैंने आपका नाम नोट कर लिया है। अब कृपया अपना मोबाइल नंबर बताएं।"
            : "I have your name noted. Now please provide your mobile number.";
        } else {
          response = language === "hi"
            ? "मैं आपका नाम पूछ रहा हूं बुकिंग के लिए। कृपया अपना नाम बताएं।"
            : "I'm asking for YOUR name for the booking. Please tell me your name.";
        }
        intent = "clarification";
      } else {
        response = language === "hi"
          ? "मैं एक AI असिस्टेंट हूं। मैं आपकी बुकिंग में मदद कर सकता हूं। आपका नाम क्या है?"
          : "I'm an AI assistant. I can help you with booking. What's your name?";
        intent = "clarification";
      }
    }
    // Handle greetings
    else if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("नमस्ते")) {
      response = this.getRandomGreeting(language);
      intent = "greeting";
    }
    // Handle services inquiry
    else if (lowerInput.includes("service") || lowerInput.includes("photography") || lowerInput.includes("सेवा")) {
      response = language === "hi" 
        ? "हमारी सेवाएं: Wedding Photography (35 हज़ार से), Portrait Sessions (2500 से), Event Photography (5000 से)। कौन सी चाहिए?"
        : "Our services: Wedding Photography (from 35k), Portrait Sessions (from 2500), Event Photography (from 5k). Which one?";
      intent = "service_inquiry";
    }
    // Handle pricing inquiries
    else if (lowerInput.includes("price") || lowerInput.includes("cost") || lowerInput.includes("कीमत")) {
      response = language === "hi" 
        ? "हमारी मुख्य कीमतें: Wedding: 35-125 हज़ार, Portrait: 2500-4500, Event: 5000-8500 रुपए। कौन सी सेवा के लिए पूछ रहे हैं?"
        : "Our pricing: Wedding: 35-125k, Portrait: 2500-4500, Event: 5000-8500 rupees. Which service are you asking about?";
      intent = "pricing";
    }
    // Handle wedding specific
    else if (lowerInput.includes("wedding") || lowerInput.includes("शादी")) {
      response = language === "hi" 
        ? "Wedding Photography के लिए हमारे पैकेज 35,000 से 1,25,000 तक हैं। इसमें पूरे दिन की कवरेज, ऑनलाइन गैलरी और एडिटिंग शामिल है। बुकिंग के लिए नाम बताएं।"
        : "Our Wedding Photography packages range from 35,000 to 1,25,000. This includes full day coverage, online gallery and editing. Please share your name to book.";
      intent = "service_specific";
    }
    // Handle unclear or ambiguous inputs
    else if (lowerInput.includes("modern") || lowerInput.includes("solution") || lowerInput.includes("source") || 
             lowerInput.includes("what") || lowerInput.includes("how") || lowerInput.includes("why") ||
             lowerInput.includes("when") || lowerInput.includes("where")) {
      
      if (hasBookingContext) {
        // If we're in a booking context, guide back to booking flow
        if (!hasNameInSession) {
          response = language === "hi" 
            ? "बुकिंग के लिए कृपया अपना नाम बताएं।"
            : "For booking, please tell me your name.";
        } else if (!hasPhoneInSession) {
          response = language === "hi" 
            ? "अब कृपया अपना मोबाइल नंबर बताएं।"
            : "Now please provide your mobile number.";
        } else if (!hasServiceInSession) {
          response = language === "hi" 
            ? "कौन सी सेवा चाहिए - Wedding, Portrait, या Event फोटोग्राफी?"
            : "Which service do you need - Wedding, Portrait, or Event photography?";
        } else {
          response = language === "hi" 
            ? "आपकी बुकिंग के लिए सभी जानकारी मिल गई है। क्या आप कन्फर्म करना चाहते हैं?"
            : "I have all the information for your booking. Would you like to confirm?";
        }
      } else {
        // General context - offer help
        response = language === "hi" 
          ? "मैं आपकी मदद कर सकता हूं। क्या आप फोटोग्राफी सेवाओं के बारे में जानना चाहते हैं या बुकिंग करना चाहते हैं?"
          : "I can help you. Would you like to know about our photography services or make a booking?";
      }
      intent = "clarification";
    }
    // Generic response based on session state
    else {
      if (hasBookingContext) {
        if (hasNameInSession && !hasPhoneInSession) {
          response = language === "hi" 
            ? "कृपया अपना मोबाइल नंबर बताएं।"
            : "Please provide your mobile number.";
          intent = "booking_continue";
        } else if (!hasNameInSession) {
          response = language === "hi" 
            ? "बुकिंग के लिए कृपया अपना नाम बताएं।"
            : "For booking, please tell me your name.";
          intent = "booking_continue";
        } else {
          response = language === "hi" 
            ? "आपको और कौन सी जानकारी चाहिए?"
            : "What other information do you need?";
          intent = "clarification";
        }
      } else {
        response = language === "hi" 
          ? "मैं आपकी बात समझ गया। क्या आप फोटोग्राफी की बुकिंग करना चाहते हैं?"
          : "I understand. Would you like to book photography services?";
        intent = "clarification";
      }
    }
    
    return {
      text: response,
      intent: intent,
      confidence: 0.8,
      language: language,
      nextAction: "continue_conversation"
    };
  }

  private getErrorFallback(userInput: string, language: "hi" | "en"): AIResponse {
    const response = language === "hi" 
      ? "क्षमा करें, तकनीकी समस्या है। फिर कोशिश करें।"
      : "Sorry, technical issue. Please try again.";
      
    return {
      text: response,
      intent: "error",
      confidence: 0.5,
      language: language,
      nextAction: "retry"
    };
  }

  private getRandomGreeting(language: "hi" | "en"): string {
    const greetingsEn = [
      "Hello! Welcome to Yuva Digital Studio. How can I help you today?",
      "Hi there! Welcome to Yuva Digital Studio. What can I do for you?",
      "Good day! This is Yuva Digital Studio. How may I assist you?",
      "Welcome to Yuva Digital Studio! I'm here to help with your photography needs.",
      "Hello! Thanks for calling Yuva Digital Studio. What brings you here today?"
    ];

    const greetingsHi = [
      "नमस्ते! Yuva Digital Studio में आपका स्वागत है। आज मैं आपकी कैसे मदद कर सकता हूं?",
      "नमस्कार! Yuva Digital Studio में आपका स्वागत है। मैं आपकी क्या सेवा कर सकता हूं?",
      "आदाब! यह Yuva Digital Studio है। आज मैं आपकी कैसे सहायता कर सकता हूं?",
      "नमस्ते! Yuva Digital Studio में आपका हार्दिक स्वागत है। मैं यहां आपकी फोटोग्राफी की जरूरतों में मदद के लिए हूं।",
      "प्रणाम! Yuva Digital Studio को कॉल करने के लिए धन्यवाद। आज आप यहां क्यों आए हैं?"
    ];

    const greetings = language === "hi" ? greetingsHi : greetingsEn;
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
  }

  /**
   * Uses LLM to extract both intent and entities from user input in a single call.
   * Returns: { intent, confidence, entities }
   */
  async extractIntentAndEntitiesLLM(userInput: string, language: "hi" | "en" = "en"): Promise<{
    intent: string;
    confidence: number;
    entities: {
      name?: string;
      phone?: string;
      date?: string;
      time?: string;
      service?: string;
      [key: string]: any;
    };
  }> {
    const systemPrompt = language === 'hi'
      ? `आप एक स्मार्ट असिस्टेंट हैं। निम्नलिखित उपयोगकर्ता इनपुट से मुख्य intent (booking, inquiry, pricing, help, greeting, clarification, cancellation, etc.) और entities (name, phone, date, time, service) निकालें।

उत्तर एक JSON ऑब्जेक्ट के रूप में दें:
{"intent": "...", "confidence": 0.9, "entities": {"name": "...", "phone": "...", "date": "...", "time": "...", "service": "..."}}`
      : `You are a smart assistant. From the following user input, extract the main intent (booking, inquiry, pricing, help, greeting, clarification, cancellation, etc.) and any entities (name, phone, date, time, service).

Respond with a JSON object:
{"intent": "...", "confidence": 0.9, "entities": {"name": "...", "phone": "...", "date": "...", "time": "...", "service": "..."}}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput }
    ];

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": config.server.baseUrl,
          "X-Title": "Yuva Digital Studio Voice Bot",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: 120,
          temperature: 0.2,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        // Try to parse JSON from the LLM response
        try {
          const parsed = JSON.parse(content);
          return parsed;
        } catch (e) {
          // If not valid JSON, fallback to basic intent extraction
          return {
            intent: this.extractIntent(userInput, language),
            confidence: 0.7,
            entities: {},
          };
        }
      }
    } catch (error) {
      console.error("LLM intent/entity extraction error:", error);
    }
    // Fallback
    return {
      intent: this.extractIntent(userInput, language),
      confidence: 0.6,
      entities: {},
    };
  }
}
