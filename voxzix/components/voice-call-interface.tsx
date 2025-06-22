"use client";

import { useState, useRef, useEffect } from 'react';
import { IconPhone, IconPhoneOff, IconMicrophone, IconMicrophoneOff, IconVolume, IconLanguage, IconLoader } from '@tabler/icons-react';

interface Message {
  id: string;
  type: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

const translations = {
  en: {
    startCall: "Start Voice Call",
    endCall: "End Call",
    listening: "Listening...",
    speaking: "AI Speaking...",
    clickToTalk: "Click to Talk",
    callActive: "Call Active",
    greeting: "Hello! Welcome to Yuva Digital Studio. How can I help you today?",
    language: "Language",    micPermission: "Microphone permission required",
    speakNow: "Speak now...",
    processing: "Processing...",
    quickSuggestions: "Quick suggestions:",
    suggestions: [
      "What services do you offer?",
      "What are your wedding photography prices?", 
      "What are your working hours?",
      "I want to book an appointment"
    ]
  },
  hi: {
    startCall: "वॉइस कॉल शुरू करें",
    endCall: "कॉल समाप्त करें",
    listening: "सुन रहा हूं...",
    speaking: "AI बोल रहा है...",
    clickToTalk: "बात करने के लिए क्लिक करें",
    callActive: "कॉल सक्रिय",
    greeting: "नमस्ते! युवा डिजिटल स्टूडियो में आपका स्वागत है। आज मैं आपकी कैसे मदद कर सकता हूं?",
    language: "भाषा",    
    micPermission: "माइक्रोफोन की अनुमति चाहिए",
    speakNow: "अब बोलें...",
    processing: "प्रोसेसिंग...",
    quickSuggestions: "त्वरित सुझाव:",
    suggestions: [
      "आपकी सेवाएं क्या हैं?",
      "शादी की फोटोग्राफी की कीमत क्या है?",
      "आप कब खुले रहते हैं?",
      "मैं अपॉइंटमेंट बुक करना चाहता हूं"
    ]
  }
};

interface VoiceCallInterfaceProps {
  language?: 'en' | 'hi';
  className?: string;
}

export default function VoiceCallInterface({ 
  language = 'en', 
  className = '' 
}: VoiceCallInterfaceProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>(language);
  const [sessionId, setSessionId] = useState<string>(() => 'voice-session-' + Date.now());
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
    const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isRecognitionActive = useRef(false);
  const isCallActiveRef = useRef(false);
  
  const t = translations[selectedLanguage];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      setupSpeechRecognition();
    }
  }, [selectedLanguage]);
  const setupSpeechRecognition = () => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;      
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        console.log('🎤 Speech recognition started');
        setIsListening(true);
        setLiveTranscript('');
        isRecognitionActive.current = true;
      };      

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (interimTranscript) {
          setLiveTranscript(interimTranscript);
          console.log('🗣️ Interim speech:', interimTranscript);
        }
        
        if (finalTranscript) {
          console.log('✅ Final speech recognized:', finalTranscript);
          setLiveTranscript('');
          handleUserSpeech(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error);
        setIsListening(false);
        setLiveTranscript('');
        isRecognitionActive.current = false;
        
        if (event.error === 'not-allowed') {
          alert(t.micPermission);
        } else if (event.error === 'no-speech') {
          console.log('No speech detected, restarting...');          setTimeout(() => {
            if (isCallActiveRef.current && !isSpeaking && !isProcessing) {
              startListening();
            }
          }, 1000);
        }
      };      

      recognitionRef.current.onend = () => {
        console.log('🎤 Speech recognition ended');
        setIsListening(false);
        setLiveTranscript('');
        isRecognitionActive.current = false;
          if (isCallActiveRef.current && !isSpeaking && !isProcessing) {
          setTimeout(() => {
            startListening();
          }, 1500);
        }
      };
    } else {
      console.error('Speech recognition not supported');
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    }
  };
  const startCall = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });      console.log('✅ Microphone permission granted');
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      alert(t.micPermission);
      return;
    }    console.log('📞 Starting call with sessionId:', sessionId);
    setIsCallActive(true);
    isCallActiveRef.current = true;
    console.log('✅ Call state set to active');
    setMessages([]);
    
    const initialMessage: Message = {
      id: Date.now().toString(),
      type: 'agent',
      text: t.greeting,
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
      setTimeout(() => {
      speakText(t.greeting);
      setTimeout(() => {
        console.log('🎤 Auto-starting speech recognition after greeting...');
        startListening();
      }, 3000);
    }, 500);
  };  const endCall = () => {
    console.log('📞 Ending call');
    setIsCallActive(false);
    isCallActiveRef.current = false;
    console.log('❌ Call state set to inactive');
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    setMessages([]);
    setSessionId('voice-session-' + Date.now()); // Reset with new sessionId for next call
    setLiveTranscript('');
    
    if (recognitionRef.current && isRecognitionActive.current) {
      recognitionRef.current.stop();
    }
    
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };
  const startListening = () => {
    if (!recognitionRef.current || isRecognitionActive.current || isSpeaking || isProcessing) {
      console.log('Cannot start listening:', { 
        hasRecognition: !!recognitionRef.current, 
        isActive: isRecognitionActive.current,
        isSpeaking,
        isProcessing 
      });
      return;
    }

    try {
      console.log('👂 Starting to listen...');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      isRecognitionActive.current = false;
      setIsListening(false);
    }
  };
  const stopListening = () => {
    if (recognitionRef.current && isRecognitionActive.current) {
      console.log('🛑 Stopping speech recognition...');
      recognitionRef.current.stop();
      isRecognitionActive.current = false;
      setIsListening(false);
      setLiveTranscript('');
    }
  };  const handleUserSpeech = async (text: string) => {
    console.log('🎤 User said:', text);
    console.log('🔍 Call state check:', { isCallActive, isCallActiveRef: isCallActiveRef.current, sessionId });
    
    if (!isCallActiveRef.current) {
      console.warn('⚠️ Call not active, ignoring speech input');
      return;
    }
    
    if (!sessionId) {
      console.error('❌ No session ID available');
      return;
    }
    
    setIsListening(false);
    setIsProcessing(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      console.log('📤 Sending request with sessionId:', sessionId);
      
      const response = await fetch('/api/voice/conversation-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          userInput: text,
          language: selectedLanguage
        })
      });if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData
        });
        throw new Error(`API error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        text: result.data?.response || result.response || 'Sorry, I couldn\'t process your request.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
      
      if (result.data?.audioUrl) {
        await playTTSAudio(result.data.audioUrl);
      } else {
        speakText(agentMessage.text);
      }
      
    } catch (error) {
      console.error('Error processing speech:', error);
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        text: selectedLanguage === 'hi' 
          ? 'क्षमा करें, कुछ समस्या हुई। कृपया फिर कोशिश करें।'
          : 'Sorry, there was an issue. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      speakText(fallbackMessage.text);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isCallActive || isSpeaking || isProcessing) return;
    handleUserSpeech(suggestion);
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;

    setIsSpeaking(true);
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = synthRef.current.getVoices();
    let selectedVoice = null;
    
    if (selectedLanguage === 'hi') {
      selectedVoice = voices.find(voice => 
        voice.lang.includes('hi') || voice.name.includes('Hindi')
      );
    } else {
      selectedVoice = voices.find(voice => voice.lang.includes('en'));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = selectedLanguage === 'hi' ? 0.8 : 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
      utterance.onend = () => {
      setIsSpeaking(false);
      if (isCallActiveRef.current) {
        setTimeout(startListening, 1000);
      }
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (isCallActiveRef.current) {
        setTimeout(startListening, 1000);
      }
    };
    
    synthRef.current.speak(utterance);
  };

  const playTTSAudio = async (audioUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setIsSpeaking(true);
        const audio = new Audio(`/api/audio/${audioUrl.split('/').pop()}`);
        audio.onended = () => {
        setIsSpeaking(false);
        if (isCallActiveRef.current) {
          setTimeout(startListening, 1000);
        }
        resolve();
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        console.error('Error playing TTS audio');
        if (isCallActiveRef.current) {
          setTimeout(startListening, 1000);
        }
        reject(new Error('Audio playback failed'));
      };
      
      audio.play().catch(reject);
    });
  };
  return (
    <div className={`bg-card border border-border rounded-lg shadow-lg p-6 ${className}`} style={{ borderRadius: 'var(--radius)' }}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <IconPhone className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-card-foreground">AI Voice Agent</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <IconLanguage className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as 'en' | 'hi')}
            className="text-sm border border-input rounded px-2 py-1 bg-background text-foreground"
            style={{ borderRadius: 'var(--radius-sm)' }}
            disabled={isCallActive}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
        </div>
      </div>

      {!isCallActive ? (
        <div className="text-center py-12">
          <button
            onClick={startCall}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg font-medium transition-colors inline-flex items-center space-x-3 text-lg"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <IconPhone className="w-6 h-6" />
            <span>{t.startCall}</span>
          </button>
          <p className="text-muted-foreground mt-4 text-sm">
            {t.clickToTalk}
          </p>
        </div>
      ) : (        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full" style={{ borderRadius: 'var(--radius-xl)' }}>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="font-medium">{t.callActive}</span>
            </div>
          </div>          <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto" style={{ borderRadius: 'var(--radius)' }}>
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-card-foreground border border-border'
                    }`}
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    <p>{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
                {liveTranscript && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] px-3 py-2 rounded-lg text-sm bg-primary/60 text-primary-foreground border-2 border-primary/30 animate-pulse" style={{ borderRadius: 'var(--radius)' }}>
                    <p className="font-medium">{liveTranscript}</p>
                    <p className="text-xs opacity-80 mt-1 flex items-center">
                      <span className="w-2 h-2 bg-current rounded-full animate-ping mr-2"></span>
                      Speaking...
                    </p>
                  </div>
                </div>
              )}
              
              {isListening && !liveTranscript && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] px-3 py-2 rounded-lg text-sm bg-muted border border-border" style={{ borderRadius: 'var(--radius)' }}>
                    <p className="text-muted-foreground italic flex items-center">
                      <IconMicrophone className="w-4 h-4 mr-2 text-destructive animate-pulse" />
                      {t.speakNow}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {messages.length <= 1 && !isListening && !isSpeaking && !isProcessing && (
            <div className="bg-accent rounded-lg p-4" style={{ borderRadius: 'var(--radius)' }}>
              <p className="text-sm font-medium text-accent-foreground mb-3">{t.quickSuggestions}</p>
              <div className="flex flex-wrap gap-2">
                {t.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-full transition-colors"
                    style={{ borderRadius: 'var(--radius-xl)' }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}          <div className="flex justify-center space-x-4">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isSpeaking || isProcessing}
              className={`p-4 rounded-full transition-colors ${
                isListening
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground disabled:bg-muted disabled:text-muted-foreground'
              }`}
              style={{ borderRadius: 'var(--radius-xl)' }}
            >
              {isListening ? (
                <IconMicrophoneOff className="w-6 h-6" />
              ) : (
                <IconMicrophone className="w-6 h-6" />
              )}
            </button>
            
            <button
              onClick={endCall}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground p-4 rounded-full transition-colors"
              style={{ borderRadius: 'var(--radius-xl)' }}
            >
              <IconPhoneOff className="w-6 h-6" />
            </button>
          </div>          <div className="text-center text-sm text-muted-foreground">
            {isProcessing && (
              <div className="flex items-center justify-center space-x-2">
                <IconLoader className="w-4 h-4 animate-spin" />
                <span>{t.processing}</span>
              </div>
            )}
            {isSpeaking && (
              <div className="flex items-center justify-center space-x-2">
                <IconVolume className="w-4 h-4" />
                <span>{t.speaking}</span>
              </div>
            )}
            {isListening && (
              <div className="flex items-center justify-center space-x-2 text-destructive">
                <IconMicrophone className="w-4 h-4 animate-pulse" />
                <span className="font-medium">{t.listening}</span>
              </div>
            )}
            {!isListening && !isSpeaking && !isProcessing && (
              <div className="text-center">
                <span>{t.clickToTalk}</span>
                <br />
                <span className="text-xs opacity-60">Click the microphone button to speak</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
