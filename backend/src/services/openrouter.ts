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
      const messages = this.buildMessages(userInput, language, context);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": config.server.baseUrl,
          "X-Title": "Yuva Digital Studio Voice Bot",
          "Content-Type": "application/json",
        },        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: 150,
          temperature: 0.3,
          stream: false,
        }),
      });      if (response.status === 429) {
        console.warn("Rate limit hit, using intelligent fallback");
        return this.getRateLimitFallback(userInput, language);
      }

      if (!response.ok) {
        console.warn(`OpenRouter API error: ${response.statusText}, using fallback`);
        return this.getErrorFallback(userInput, language);
      }

      const data = await response.json();
      const messageChoice = data.choices?.[0]?.message;
      const assistantMessage = messageChoice?.content || messageChoice?.reasoning || "";

      const intent = this.extractIntent(userInput, language);
      const nextAction = this.determineNextAction(intent, userInput, language);

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
- अगर आप किसी चीज़ के बारे में निश्चित नहीं हैं तो स्पष्ट करने के लिए कहें
- व्यावहारिक कार्रवाई सुझाएं`;
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
- If unsure about something, ask for clarification
- Suggest practical next steps
- Take initiative to guide the conversation toward booking or helping the customer`;
    }
  }
  private cleanResponse(text: string): string {
    return text
      .replace(/^\s*Assistant:\s*/i, "")
      .replace(/^\s*User:\s*/i, "")
      .trim()
      .split('\n')[0]
      .slice(0, 120);
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
          max_tokens: 200,
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
      } के लिए काम करते हैं।
      
वर्तमान चरण: ${currentStep}
उपयोगकर्ता डेटा: ${JSON.stringify(userData)}

आपको उपयोगकर्ता की मदद करनी है और अगला कदम सुझाना है। हमेशा कार्रवाई-उन्मुख जवाब दें।`;
    } else {
      return `You are an AI agent working for ${this.businessConfig.name}.
      
Current step: ${currentStep}
User data: ${JSON.stringify(userData)}

You need to help the user and suggest next steps. Always provide action-oriented responses.`;
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
  }
  private getRateLimitFallback(userInput: string, language: "hi" | "en"): AIResponse {
    const lowerInput = userInput.toLowerCase();
    
    let response = "";
    let intent = "general";
    
    // Handle greetings
    if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("नमस्ते")) {
      response = language === "hi" 
        ? "नमस्ते! Yuva Digital Studio में आपका स्वागत है। मैं आपकी फोटोग्राफी जरूरतों में मदद कर सकता हूं। कैसे मदद करूं?"
        : "Hello! Welcome to Yuva Digital Studio. I can help with your photography needs. How can I assist you?";
      intent = "greeting";
    }
    // Handle booking intentions
    else if (lowerInput.includes("book") || lowerInput.includes("appointment") || lowerInput.includes("अपॉइंटमेंट")) {
      response = language === "hi" 
        ? "जरूर! मैं आपकी बुकिंग में मदद करूंगा। कृपया बताएं - आपका नाम क्या है?"
        : "Certainly! I'll help you with booking. Please tell me - what's your name?";
      intent = "booking";
    }
    // Handle name provided
    else if (lowerInput.includes("name is") || lowerInput.includes("i am") || lowerInput.includes("my name") || lowerInput.includes("नाम")) {
      response = language === "hi" 
        ? "धन्यवाद! अब कृपया अपना मोबाइल नंबर बताएं।"
        : "Thank you! Now please provide your mobile number.";
      intent = "booking";
    }
    // Handle phone number
    else if (/\d{10}/.test(lowerInput) || lowerInput.includes("mobile") || lowerInput.includes("phone")) {
      response = language === "hi" 
        ? "बढ़िया! अब बताएं कि आपको कौन सी सेवा चाहिए - Wedding, Portrait, या Event फोटोग्राफी?"
        : "Great! Now tell me which service you need - Wedding, Portrait, or Event photography?";
      intent = "booking";
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
    // Generic response
    else {
      response = language === "hi" 
        ? "मैं आपकी बात समझ गया। क्या आप फोटोग्राफी की बुकिंग करना चाहते हैं? या कुछ और जानकारी चाहिए?"
        : "I understand. Would you like to book photography services? Or do you need some other information?";
      intent = "clarification";
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
}
