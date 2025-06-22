import { VoiceSession } from '../types';

interface SessionStore {
  [callSid: string]: VoiceSession;
}

class SessionManager {
  private sessions: SessionStore = {};

  createSession(callSid: string, phoneNumber: string): VoiceSession {
    const session: VoiceSession = {
      callSid,
      phoneNumber,
      language: 'en',
      context: [],
      currentStep: 'welcome'
    };

    this.sessions[callSid] = session;
    return session;
  }

  getSession(callSid: string): VoiceSession | null {
    return this.sessions[callSid] || null;
  }

  updateSession(callSid: string, updates: Partial<VoiceSession>): VoiceSession | null {
    if (this.sessions[callSid]) {
      this.sessions[callSid] = { ...this.sessions[callSid], ...updates };
      return this.sessions[callSid];
    }
    return null;
  }

  addContext(callSid: string, message: string): void {
    if (this.sessions[callSid]) {
      this.sessions[callSid].context.push(message);
      
      if (this.sessions[callSid].context.length > 10) {
        this.sessions[callSid].context = this.sessions[callSid].context.slice(-8);
      }
    }
  }

  setLanguage(callSid: string, language: 'hi' | 'en'): void {
    if (this.sessions[callSid]) {
      this.sessions[callSid].language = language;
    }
  }

  setCurrentStep(callSid: string, step: string): void {
    if (this.sessions[callSid]) {
      this.sessions[callSid].currentStep = step;
    }
  }

  endSession(callSid: string): void {
    delete this.sessions[callSid];
  }

  cleanup(): void {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    Object.keys(this.sessions).forEach(callSid => {
      const session = this.sessions[callSid];
      // In a real implementation, you'd track session creation time
      // For now, we'll just keep sessions until explicitly ended
    });
  }
}

export const sessionManager = new SessionManager();

setInterval(() => {
  sessionManager.cleanup();
}, 5 * 60 * 1000); // Cleanup every 5 minutes
