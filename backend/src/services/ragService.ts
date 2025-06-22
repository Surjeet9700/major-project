import { ChromaClient } from 'chromadb';
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
  private chromaClient: ChromaClient;
  private collectionName = 'yuva_digital_studio';
  private businessConfig: any;
  private isInitialized = false;  constructor() {
    if (config.huggingface?.apiKey) {
      this.hf = new HfInference(config.huggingface.apiKey);
    } else {
      console.warn('⚠️  HuggingFace API key not found. RAG embeddings will use fallback search.');
      this.hf = null;
    }
    
    try {
      this.chromaClient = new ChromaClient({
        host: 'localhost',
        port: 8000,
      });
    } catch (error) {
      console.warn('⚠️  ChromaDB not available. Using fallback search only.');
      this.chromaClient = null as any;
    }
    
    this.businessConfig = getBusinessConfig();
  }
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (this.chromaClient) {
        try {
          await this.chromaClient.getCollection({ name: this.collectionName });
          console.log('Using existing ChromaDB collection');
        } catch (error) {
          console.log('Creating new ChromaDB collection');
          await this.chromaClient.createCollection({ name: this.collectionName });
          await this.indexBusinessKnowledge();
        }
      } else {
        console.log('ChromaDB not available, using fallback search');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('ChromaDB not available, falling back to in-memory search:', error);
      this.isInitialized = true;
    }
  }private async getEmbedding(text: string): Promise<number[]> {
    try {
      if (!this.hf) {
        console.log('🔄 HuggingFace not available, skipping embedding generation');
        return [];
      }
        const response = await this.hf.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: text,
      });
      
      if (Array.isArray(response)) {
        if (response.length > 0 && Array.isArray(response[0])) {
          return response[0] as number[];
        }
        return response as number[];
      }
      
      return [];
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      return [];
    }
  }

  private async indexBusinessKnowledge(): Promise<void> {
    const documents = this.generateBusinessDocuments();
      try {
      const collection = await this.chromaClient.getCollection({ name: this.collectionName });
      
      const embeddings = await Promise.all(
        documents.map(doc => this.getEmbedding(doc.content))
      );

      await collection.add({
        ids: documents.map(doc => doc.id),
        embeddings: embeddings.filter(emb => emb.length > 0),
        documents: documents.map(doc => doc.content),
        metadatas: documents.map(doc => doc.metadata),
      });

      console.log(`Indexed ${documents.length} business knowledge documents`);
    } catch (error) {
      console.error('Failed to index business knowledge:', error);
    }
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
  }  private getBusinessOverview(language: 'hi' | 'en'): string {
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
    await this.initialize();
    
    if (!this.chromaClient) {
      console.log('🔄 Using fallback search (ChromaDB not available)');
      return this.fallbackSearch(query, language, limit);
    }
    
    try {
      const collection = await this.chromaClient.getCollection({ name: this.collectionName });
      
      const queryEmbedding = await this.getEmbedding(query);
      
      if (queryEmbedding.length === 0) {
        return this.fallbackSearch(query, language, limit);
      }

      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
        where: { language: language },
      });
      
      return results.documents?.[0]?.filter(doc => doc !== null) as string[] || [];
    } catch (error) {
      console.warn('ChromaDB search failed, using fallback:', error);
      return this.fallbackSearch(query, language, limit);
    }
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
  }  async generateRAGResponse(query: string, language: 'hi' | 'en' = 'hi'): Promise<string> {
    try {
      if (!config.openRouter?.apiKey) {
        console.warn('⚠️  OpenRouter API key not found. Using fallback response.');
        return this.getFallbackResponse(language);
      }

      const relevantDocs = await this.searchKnowledge(query, language, 3);
      
      const context = relevantDocs.join('\n\n');
      
      const systemMessage = this.getSystemMessage(language);      const userMessage = `Based on the following business information, answer the user's question in ${language === 'hi' ? 'Hindi' : 'English'} with a SHORT and CONVERSATIONAL response (maximum 2-3 sentences):

Context:
${context}

User Question: ${query}

Keep your response brief, friendly, and easy to understand when spoken aloud. If the question cannot be answered from the context, politely say so and suggest contacting the studio directly.`;const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'meta-llama/llama-3.2-3b-instruct:free',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ],          max_tokens: 100, // Reduced from 200 to ensure shorter responses
          temperature: 0.3,
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

      return response.data.choices[0]?.message?.content || this.getFallbackResponse(language);
    } catch (error) {
      console.error('RAG response generation failed:', error);
      return this.getFallbackResponse(language);
    }
  }  private getSystemMessage(language: 'hi' | 'en'): string {
    switch (language) {
      case 'hi':
        return 'आप युवा डिजिटल स्टूडियो के लिए एक AI असिस्टेंट हैं। हमेशा हिंदी में छोटे, स्पष्ट, और मित्रवत जवाब दें। बोलने के लिए आसान भाषा का उपयोग करें।';
      
      default:
        return 'You are an AI assistant for Yuva Digital Studio. Always respond with short, clear, and friendly answers in English. Use simple language that is easy to speak aloud.';
    }
  }private getFallbackResponse(language: 'hi' | 'en'): string {
    switch (language) {
      case 'hi':
        return 'क्षमा करें, मैं इस प्रश्न का उत्तर नहीं दे सकता। कृपया सीधे हमसे संपर्क करें: ' + this.businessConfig.contact.phone[0];
      
      default:
        return 'Sorry, I cannot answer this question. Please contact us directly: ' + this.businessConfig.contact.phone[0];
    }
  }
}
