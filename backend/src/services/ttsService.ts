import axios from 'axios';
import Groq from 'groq-sdk';
import { config } from '../config';

export class TTSService {
  private huggingFaceToken: string;
  private groqApiKey: string;
  private groqClient: Groq | null;
  
  constructor() {
    this.huggingFaceToken = config.huggingface?.apiKey || '';
    this.groqApiKey = process.env.GROQ_API_KEY || '';
    this.groqClient = this.groqApiKey ? new Groq({ apiKey: this.groqApiKey }) : null;
  }  async generateSpeech(text: string, language: 'en' | 'hi' = 'en', voiceSettings?: { speed?: number, gender?: 'male' | 'female' }): Promise<Buffer | null> {
    // Format text for better speech
    const formattedText = this.formatTextForSpeech(text, language);
    
    // Try Groq TTS first (best quality and fast)
    if (this.groqClient && language === 'en') {
      const groqResult = await this.generateGroqTTS(formattedText, voiceSettings);
      if (groqResult) return groqResult;
    }
    
    // Fallback to HuggingFace models
    return this.generateHuggingFaceTTS(formattedText, language, voiceSettings);
  }  private async generateGroqTTS(text: string, voiceSettings?: { speed?: number, gender?: 'male' | 'female' }): Promise<Buffer | null> {
    try {
      const voice = voiceSettings?.gender === 'male' ? 'Fritz-PlayAI' : 'Celeste-PlayAI';
      
      console.log(`🔊 Generating TTS with Groq (${voice})`);
      
      const response = await this.groqClient!.audio.speech.create({
        model: 'playai-tts',
        input: text,
        voice: voice,
        response_format: 'wav'
      });

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      
      if (audioBuffer.length > 1000) {
        console.log(`✅ Groq TTS generated successfully (${audioBuffer.length} bytes)`);
        return audioBuffer;
      } else {
        console.log(`❌ Groq returned insufficient audio data`);
        return null;
      }
    } catch (error) {
      console.error('❌ Groq TTS error:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }  private async generateHuggingFaceTTS(text: string, language: 'en' | 'hi' = 'en', voiceSettings?: { speed?: number, gender?: 'male' | 'female' }): Promise<Buffer | null> {
    try {      
      if (!this.huggingFaceToken) {
        console.warn('HuggingFace token not available for TTS');
        return null;
      }

      // Use fast, reliable models
      const models = [
        'espnet/kan-bayashi_ljspeech_vits',
        'microsoft/speecht5_tts'
      ];
      
      for (const model of models) {
        try {
          console.log(`🔊 Trying ${model}`);
          
          const response = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
              headers: {
                Authorization: `Bearer ${this.huggingFaceToken}`,
                "Content-Type": "application/json",
              },
              method: "POST",
              body: JSON.stringify({
                inputs: text,
                options: { wait_for_model: true }
              }),
            }          
          );

          if (!response.ok) {
            console.log(`❌ ${model} failed with status ${response.status}`);
            continue;
          }

          const audioBlob = await response.blob();
          const audioBuffer = Buffer.from(await audioBlob.arrayBuffer());
          
          if (audioBuffer.length > 1000) {
            console.log(`✅ HuggingFace TTS generated successfully (${audioBuffer.length} bytes)`);
            return audioBuffer;
          } else {
            console.log(`❌ ${model} returned insufficient audio data`);
            continue;
          }
        } catch (modelError) {
          console.log(`❌ ${model} failed:`, modelError instanceof Error ? modelError.message : 'Unknown error');
          continue;
        }
      }

      console.log('❌ All TTS models failed');
      return null;
    } catch (error) {
      console.error('❌ HuggingFace TTS error:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }
  private formatTextForSpeech(text: string, language: 'en' | 'hi'): string {
    let formattedText = text;
    
    // Basic formatting for better speech clarity
    if (language === 'hi') {
      formattedText = formattedText
        .replace(/।/g, '. ') // Hindi full stop
        .replace(/₹(\d+),?(\d+)/g, '$1 हज़ार $2 रुपए') // ₹35,000 -> 35 हज़ार रुपए
        .replace(/₹(\d+)/g, '$1 रुपए') // ₹2500 -> 2500 रुपए
        .replace(/\+91/g, 'प्लस 91');
    } else {
      formattedText = formattedText
        .replace(/₹(\d+),?(\d+)/g, '$1 thousand $2 rupees') // ₹35,000 -> 35 thousand rupees
        .replace(/₹(\d+)/g, '$1 rupees') // ₹2500 -> 2500 rupees
        .replace(/\+91/g, 'plus 91');
    }
    
    return formattedText;
  }  async generateAndSaveAudio(text: string, language: 'en' | 'hi' = 'en', filename: string = 'output.wav', voiceSettings?: { speed?: number, gender?: 'male' | 'female' }): Promise<string | null> {
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
      console.log(`✅ Audio saved as ${filename}`);
      return `/api/audio/${filename}`;
    } catch (error) {
      console.error('❌ Error saving TTS audio:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }
}

export const ttsService = new TTSService();
