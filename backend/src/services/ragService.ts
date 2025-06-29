import { HfInference } from '@huggingface/inference';
import axios from 'axios';
import { getBusinessConfig } from '../config/business';
import { config } from '../config';

interface RAGDocument {
  id: string;
  content: string;
  metadata: {
    type: 'service' | 'pricing' | 'policy' | 'general';
    category?: string;
    language: 'hi' | 'en' | 'te';
  };
}

export class RAGService {
  private hf: HfInference | null = null;
  private businessConfig: any;

  constructor() {
    if (config.huggingface?.apiKey) {
      this.hf = new HfInference(config.huggingface.apiKey);
    } else {
      console.warn('⚠️  HuggingFace API key not found. RAG embeddings will use fallback search.');
      this.hf = null;
    }
    this.businessConfig = getBusinessConfig();
  }

  private generateBusinessDocuments(): RAGDocument[] {
    const documents: RAGDocument[] = [];
    const business = this.businessConfig;    // Business overview documents
    const languages: ('hi' | 'en')[] = ['hi', 'en'];
    
    languages.forEach(lang => {
      // Business overview
      documents.push({
        id: `overview-${lang}`,
        content: this.getBusinessOverview(lang),
        metadata: { type: 'general', category: 'overview', language: lang }
      });

      // Services information
      Object.entries(business.services).forEach(([serviceKey, service]: [string, any]) => {
        documents.push({
          id: `service-${serviceKey}-${lang}`,
          content: this.getServiceDescription(service, lang),
          metadata: { type: 'service', category: serviceKey, language: lang }
        });
      });

      // Pricing information
      documents.push({
        id: `pricing-${lang}`,
        content: this.getPricingDescription(lang),
        metadata: { type: 'pricing', category: 'packages', language: lang }
      });

      // Policies and general info
      documents.push({
        id: `policies-${lang}`,
        content: this.getPoliciesDescription(lang),
        metadata: { type: 'policy', category: 'general', language: lang }
      });
    });

    return documents;
  }

  private getBusinessOverview(language: 'hi' | 'en'): string {
    const business = this.businessConfig;
    
    switch (language) {
      case 'hi':
        return `युवा डिजिटल स्टूडियो हैदराबाद में स्थित एक प्रोफेशनल फोटोग्राफी स्टूडियो है। हमारे मालिक श्री युवराज शर्मा हैं। हम वेडिंग फोटोग्राफी, पोर्ट्रेट, इवेंट फोटोग्राफी, प्री-वेडिंग शूट, बेबी फोटोग्राफी आदि सेवाएं प्रदान करते हैं। स्टूडियो का पता: ${business.location.address}, ${business.location.city}। फोन: ${business.contact.phone[0]}। हमारे काम के घंटे सुबह 9 बजे से रात 9 बजे तक हैं।`;
      
      default:
        return `Yuva Digital Studio is a professional photography studio located in Hyderabad. Our owner is Mr. Yuvraj Sharma. We provide wedding photography, portraits, event photography, pre-wedding shoots, baby photography and more. Studio address: ${business.location.address}, ${business.location.city}. Phone: ${business.contact.phone[0]}. Our working hours are 9 AM to 9 PM.`;
    }
  }

  private getServiceDescription(service: any, language: 'hi' | 'en'): string {
    const name = service.name[language] || service.name.en;
    const description = service.description[language] || service.description.en;
    
    let content = `${name}: ${description}`;
      if (service.packages) {
      content += language === 'hi' ? '\n\nउपलब्ध पैकेज:\n' : '\n\nAvailable packages:\n';
      
      Object.entries(service.packages).forEach(([key, pkg]: [string, any]) => {
        content += `- ${pkg.name[language] || pkg.name.en}: ₹${pkg.price} (${pkg.duration})\n`;
        if (pkg.includes) {
          content += `  ${language === 'hi' ? 'शामिल:' : 'Includes:'} ${pkg.includes[language] || pkg.includes.en}\n`;
        }
      });
    }
    
    return content;
  }

  private getPricingDescription(language: 'hi' | 'en'): string {
    const business = this.businessConfig;
    
    switch (language) {
      case 'hi':
        return `हमारी मुख्य सेवाओं की कीमतें:\n- वेडिंग फोटोग्राफी: ₹25,000 से शुरू\n- पोर्ट्रेट सेशन: ₹5,000 से शुरू\n- इवेंट फोटोग्राफी: ₹15,000 से शुरू\n- प्री-वेडिंग शूट: ₹12,000 से शुरू\nसभी कीमतें GST अतिरिक्त हैं। विस्तृत पैकेज की जानकारी के लिए संपर्क करें।`;
      
      default:
        return `Our main service pricing:\n- Wedding Photography: Starting from ₹25,000\n- Portrait Session: Starting from ₹5,000\n- Event Photography: Starting from ₹15,000\n- Pre-wedding Shoot: Starting from ₹12,000\nAll prices are exclusive of GST. Contact us for detailed package information.`;
    }
  }

  private getPoliciesDescription(language: 'hi' | 'en'): string {
    switch (language) {
      case 'hi':
        return `हमारी नीतियां:\n- 50% अग्रिम भुगतान बुकिंग के समय\n- शेष राशि सेवा पूर्ण होने पर\n- रद्दीकरण: 48 घंटे पहले सूचना दें\n- मौसम की वजह से देरी हो सकती है\n- सभी फोटो 7-14 दिनों में डिलीवरी\n- डिजिटल कॉपी + प्रिंट्स उपलब्ध`;
      
      default:
        return `Our policies:\n- 50% advance payment at booking time\n- Remaining amount after service completion\n- Cancellation: 48 hours advance notice required\n- Weather delays may occur\n- All photos delivered within 7-14 days\n- Digital copies + prints available`;
    }
  }

  async searchKnowledge(query: string, language: 'hi' | 'en' = 'hi', limit: number = 3): Promise<string[]> {
    // Only use fallback search
    return this.fallbackSearch(query, language, limit);
  }

  private fallbackSearch(query: string, language: 'hi' | 'en', limit: number): string[] {
    // Simple keyword-based fallback search
    const documents = this.generateBusinessDocuments();
    const queryLower = query.toLowerCase();
    
    const relevantDocs = documents
      .filter(doc => doc.metadata.language === language)
      .filter(doc => doc.content.toLowerCase().includes(queryLower))
      .slice(0, limit)
      .map(doc => doc.content);
      
    return relevantDocs.length > 0 ? relevantDocs : [this.getBusinessOverview(language)];
  }

  extractEntitiesFromUserInput(input: string, language: 'hi' | 'en' = 'hi') {
    let name = ''
    let phone = ''
    let date = ''
    if (!input || typeof input !== 'string') {
      return { name, phone, date };
    }
    if (language === 'hi') {
      const nameMatch = input.match(/(?:मेरा नाम|नाम है|मैं हूं)\s*([\p{L} ]{2,40})/u);
      if (nameMatch) name = nameMatch[1].trim();
      const phoneMatch = input.match(/(?:\+91[\s-]*)?(\d{10})|(?:\+\d{1,3}[\s-]*)?(\d{10,15})/);
      if (phoneMatch) phone = phoneMatch[1] || phoneMatch[2] || '';
      const dateMatch = input.match(/(\d{1,2}[-\/\.][\d]{1,2}[-\/\.][\d]{2,4})/);
      if (dateMatch) date = dateMatch[1];
    } else {
      const nameMatch = input.match(/(?:my name is|i am|this is|name is|call me|myself)\s+([a-zA-Z][a-zA-Z ]{1,39})/i);
      if (nameMatch) name = nameMatch[1].trim();
      const phoneMatch = input.match(/(?:\+\d{1,3}[\s-]*)?(\d{10,15})/);
      if (phoneMatch) phone = phoneMatch[1];
      const dateMatch = input.match(/(\d{1,2}[-\/\.][\d]{1,2}[-\/\.][\d]{2,4})/);
      if (dateMatch) date = dateMatch[1];
    }
    return { name, phone, date };
  }

  private formatBusinessContext(language: 'hi' | 'en' = 'en'): string {
    const config = getBusinessConfig();
    let context = '';
    if (language === 'hi') {
      context += `स्टूडियो का नाम: ${config.name}\n`;
      context += `पता: ${config.location.address}, ${config.location.city}, ${config.location.state}, ${config.location.pincode}\n`;
      context += `संपर्क: ${config.contact.phone.join(', ')} | ईमेल: ${config.contact.email}\n`;
      context += `मालिक: ${config.businessOwner?.name || ''}\n`;
      context += `सेवाएं: ${config.services.filter(s => s.isActive).map(s => s.nameHi).join(', ')}\n`;
      context += `खासियतें: ${(config.specialFeatures || []).join(', ')}\n`;
      context += `काम के घंटे: "${Object.entries(config.workingHours).map(([day, wh]) => `${day}: ${wh.open}-${wh.close}`).join(', ')}"\n`;
    } else {
      context += `Studio Name: ${config.name}\n`;
      context += `Address: ${config.location.address}, ${config.location.city}, ${config.location.state}, ${config.location.pincode}\n`;
      context += `Contact: ${config.contact.phone.join(', ')} | Email: ${config.contact.email}\n`;
      context += `Owner: ${config.businessOwner?.name || ''}\n`;
      context += `Services: ${config.services.filter(s => s.isActive).map(s => s.name).join(', ')}\n`;
      context += `Special Features: ${(config.specialFeatures || []).join(', ')}\n`;
      context += `Working Hours: "${Object.entries(config.workingHours).map(([day, wh]) => `${day}: ${wh.open}-${wh.close}`).join(', ')}"\n`;
    }
    return context;
  }

  async generateRAGResponse(query: string, language: 'hi' | 'en' = 'hi', sessionMemory?: { extractedData?: any, conversationHistory?: any[] }): Promise<any> {
    try {
      const entities = this.extractEntitiesFromUserInput(query, language);
      const businessContext = this.formatBusinessContext(language);
      let historyContext = '';
      if (sessionMemory && sessionMemory.conversationHistory) {
        const lastTurns = sessionMemory.conversationHistory.slice(-6).map(msg => `${msg.role}: ${msg.content}`).join('\n');
        historyContext = `Recent Conversation:\n${lastTurns}\n`;
      }
      let memoryContext = '';
      if (sessionMemory && sessionMemory.extractedData) {
        memoryContext = `Known Details: ${JSON.stringify(sessionMemory.extractedData)}\n`;
      }
      const systemMessage = this.getSystemMessage(language);
      const userMessage = `You are an expert assistant for a photography studio. Use the following business information, conversation history, and known details to answer the user's question.\n\nBusiness Info:\n${businessContext}\n${historyContext}${memoryContext}User Question: ${query}\n\nIf the answer is not in the business info, politely say so and suggest contacting the studio directly. Respond in a short, friendly, and conversational way. Use sales techniques and be persuasive when appropriate.`;
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'meta-llama/llama-3.2-3b-instruct:free',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 160,
          temperature: 0.35,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.openRouter?.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'Yuva Digital Studio Voice Bot'
          },
        }
      );
      return {
        response: response.data.choices[0]?.message?.content || this.getFallbackResponse(language),
        entities
      };
    } catch (error) {
      return { response: this.getFallbackResponse(language), entities: this.extractEntitiesFromUserInput(query, language) };
    }
  }

  private getSystemMessage(language: 'hi' | 'en'): string {
    switch (language) {
      case 'hi':
        return 'आप युवा डिजिटल स्टूडियो के लिए एक AI असिस्टेंट हैं। हमेशा हिंदी में छोटे, स्पष्ट, और मित्रवत जवाब दें। बोलने के लिए आसान भाषा का उपयोग करें।';
      
      default:
        return 'You are an AI assistant for Yuva Digital Studio. Always respond with short, clear, and friendly answers in English. Use simple language that is easy to speak aloud.';
    }
  }

  private getFallbackResponse(language: 'hi' | 'en'): string {
    switch (language) {
      case 'hi':
        return 'क्षमा करें, मैं इस प्रश्न का उत्तर नहीं दे सकता। कृपया सीधे हमसे संपर्क करें: ' + this.businessConfig.contact.phone[0];
      
      default:
        return 'Sorry, I cannot answer this question. Please contact us directly: ' + this.businessConfig.contact.phone[0];
    }
  }
}
