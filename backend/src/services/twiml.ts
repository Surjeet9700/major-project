import { Response } from 'express';

export class TwiMLBuilder {
  private response: any;

  constructor() {
    const twilio = require('twilio');
    this.response = new twilio.twiml.VoiceResponse();
  }

  say(text: string, language: 'hi' | 'en' = 'en', voice?: string): this {
    const sayOptions: any = {};
    
    if (language === 'hi') {
      sayOptions.voice = voice || 'Polly.Aditi';
      sayOptions.language = 'hi-IN';
    } else {
      sayOptions.voice = voice || 'Polly.Joanna';
      sayOptions.language = 'en-US';
    }

    this.response.say(sayOptions, text);
    return this;
  }  gather(options: {
    speechTimeout?: number;
    timeout?: number;
    numDigits?: number;
    action?: string;
    method?: string;
    language?: 'hi' | 'en';
    hints?: string[];
  }): this {
    const gatherOptions: any = {
      input: 'speech dtmf',
      speechTimeout: options.speechTimeout || 3,
      timeout: options.timeout || 10,
      action: options.action || '/api/gather',
      method: options.method || 'POST'
    };

    if (options.numDigits) {
      gatherOptions.numDigits = options.numDigits;
    }

    // Use en-US for better speech recognition
    gatherOptions.language = 'en-US';

    if (options.hints && options.hints.length > 0) {
      gatherOptions.hints = options.hints.join(',');
    }

    const gather = this.response.gather(gatherOptions);
    return this;
  }

  redirect(url: string): this {
    this.response.redirect(url);
    return this;
  }

  hangup(): this {
    this.response.hangup();
    return this;
  }

  pause(length: number = 1): this {
    this.response.pause({ length });
    return this;
  }

  record(options: {
    maxLength?: number;
    timeout?: number;
    action?: string;
    recordingStatusCallback?: string;
  } = {}): this {
    const recordOptions = {
      maxLength: options.maxLength || 30,
      timeout: options.timeout || 5,
      action: options.action || '/api/recording',
      recordingStatusCallback: options.recordingStatusCallback
    };

    this.response.record(recordOptions);
    return this;
  }

  toString(): string {
    return this.response.toString();
  }

  send(res: Response): void {
    res.type('text/xml');
    res.send(this.toString());
  }
}
