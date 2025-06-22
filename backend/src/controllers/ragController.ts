import { Request, Response } from 'express';
import { RAGService } from '../services/ragService';

const ragService = new RAGService();

export const ragQuery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, language = 'hi' } = req.body;

    if (!query) {
      res.status(400).json({ 
        error: 'Query is required',
        message: language === 'hi' ? 'प्रश्न आवश्यक है' : 
                 language === 'te' ? 'ప్రశ్న అవసరం' : 'Query is required'
      });
      return;
    }

    // Validate language
    if (!['hi', 'en', 'te'].includes(language)) {
      res.status(400).json({ 
        error: 'Invalid language. Supported: hi, en, te',
        message: 'भाषा समर्थित नहीं है / भाषा समर्थित नहीं है / Language not supported'
      });
      return;
    }

    const response = await ragService.generateRAGResponse(query, language);

    res.json({
      success: true,
      query,
      language,
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('RAG query error:', error);
    
    const { language = 'hi' } = req.body;
    const errorMessage = language === 'hi' ? 
      'तकनीकी समस्या हुई है। कृपया बाद में कोशिश करें।' :
      language === 'te' ?
      'సాంకేతిక సమస్య జరిగింది. దయచేసి తర్వాత ప్రయత్నించండి.' :
      'A technical issue occurred. Please try again later.';

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: errorMessage
    });
  }
};

export const searchKnowledge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, language = 'hi', limit = 3 } = req.body;

    if (!query) {
      res.status(400).json({ 
        error: 'Query is required',
        message: language === 'hi' ? 'प्रश्न आवश्यक है' : 
                 language === 'te' ? 'ప్రశ్న అవసరం' : 'Query is required'
      });
      return;
    }

    const results = await ragService.searchKnowledge(query, language, limit);

    res.json({
      success: true,
      query,
      language,
      results,
      count: results.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Knowledge search error:', error);
    
    const { language = 'hi' } = req.body;
    const errorMessage = language === 'hi' ? 
      'खोज में समस्या हुई है।' :
      language === 'te' ?
      'శోధనలో సమస్య జరిగింది.' :
      'Search error occurred.';

    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: errorMessage
    });
  }
};

export const initializeRAG = async (req: Request, res: Response): Promise<void> => {
  try {
    await ragService.initialize();
    
    res.json({
      success: true,
      message: 'RAG service initialized successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('RAG initialization error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to initialize RAG service',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
