import axios from 'axios';
import { config } from '../config';

export class TTSService {
  private huggingFaceToken: string;
  constructor() {
    this.huggingFaceToken = config.huggingface?.apiKey || '';
  }
  async generateSpeech(text: string, language: 'en' | 'hi' = 'en', voiceSettings?: { speed?: number, gender?: 'male' | 'female' }): Promise<Buffer | null> {
    try {      if (!this.huggingFaceToken) {
        console.warn('HuggingFace token not available for TTS');
        return null;
      }

      // Format text for better speech synthesis
      const formattedText = this.formatTextForSpeech(text, language, voiceSettings);

      const options = {
        method: 'POST',
        url: 'https://api-inference.huggingface.co/models/suno/bark',
        headers: {
          'Authorization': `Bearer ${this.huggingFaceToken}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer' as const,
        data: {
          inputs: formattedText
        }
      };

      console.log(`🔊 Generating TTS for: "${formattedText.substring(0, 50)}..."`);
      
      const response = await axios(options);
      
      if (response.data) {
        console.log('✅ TTS audio generated successfully');
        return Buffer.from(response.data);
      }

      return null;
    } catch (error) {
      console.error('❌ Error generating TTS:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }  private formatTextForSpeech(text: string, language: 'en' | 'hi', voiceSettings?: { speed?: number, gender?: 'male' | 'female' }): string {
    let formattedText = text;
    
    // Make Hindi much slower with extra pauses and clearer pronunciation
    if (language === 'hi') {
      formattedText = formattedText
        .replace(/।/g, '... ... ... ') // Long pause after Hindi full stop
        .replace(/,/g, ', ... ... ') // Pause after comma
        .replace(/\./g, '... ... ... ') // Long pause after period  
        .replace(/!/g, '! ... ... ') // Pause after exclamation
        .replace(/\?/g, '? ... ... ') // Pause after question
        .replace(/:/g, ': ... ') // Pause after colon
        .replace(/;/g, '; ... ') // Pause after semicolon
        // Add pauses between words for slower speech
        .replace(/(\w+)\s+(\w+)/g, '$1 ... $2')
        // Extra slow for numbers
        .replace(/(\d+)/g, ' ... $1 ... ');
    } else {
      // Moderate speed for English
      formattedText = formattedText
        .replace(/\./g, '... ')
        .replace(/,/g, ', ')
        .replace(/!/g, '! ')
        .replace(/\?/g, '? ');
    }
    
    if (language === 'hi') {
      // Format Hindi text for better speech
      formattedText = formattedText
        .replace(/₹(\d+),?(\d+)/g, '$1 ... हज़ार ... $2 ... रुपए') // ₹35,000 -> 35 हज़ार रुपए
        .replace(/₹(\d+)/g, '$1 ... रुपए') // ₹2500 -> 2500 रुपए
        .replace(/\b(\d+),(\d+)\b/g, '$1 ... हज़ार ... $2') // 35,000 -> 35 हज़ार
        .replace(/\b1,25,000\b/g, '1 ... लाख ... 25 ... हज़ार') // Special case for 1,25,000
        .replace(/\+91/g, 'प्लस ... 91')
        .replace(/(\d{10})/g, (match) => match.split('').join(' ... ')); // Space out phone numbers
    } else {
      // Format English text for better speech
      formattedText = formattedText
        .replace(/₹(\d+),?(\d+)/g, '$1 thousand $2 rupees') // ₹35,000 -> 35 thousand rupees
        .replace(/₹(\d+)/g, '$1 rupees') // ₹2500 -> 2500 rupees
        .replace(/\b(\d+),(\d+)\b/g, '$1 thousand $2') // 35,000 -> 35 thousand
        .replace(/\b1,25,000\b/g, '1 lakh 25 thousand') // Special case for 1,25,000
        .replace(/\+91/g, 'plus 91')
        .replace(/(\d{10})/g, (match) => match.split('').join(' ')); // Space out phone numbers
    }
    
    return formattedText;
  }
  async generateAndSaveAudio(text: string, language: 'en' | 'hi' = 'en', filename: string = 'output.wav', voiceSettings?: { speed?: number, gender?: 'male' | 'female' }): Promise<string | null> {
    try {
      const audioBuffer = await this.generateSpeech(text, language, voiceSettings);
      
      if (!audioBuffer) {
        return null;
      }

      const fs = require('fs');
      const path = require('path');
      
      // Save to public directory for serving
      const publicDir = path.join(__dirname, '../../public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      const filepath = path.join(publicDir, filename);
      fs.writeFileSync(filepath, audioBuffer);
      
      console.log(`✅ Audio saved as ${filepath}`);
      return `/audio/${filename}`;
    } catch (error) {
      console.error('❌ Error saving TTS audio:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }
}

export const ttsService = new TTSService();
