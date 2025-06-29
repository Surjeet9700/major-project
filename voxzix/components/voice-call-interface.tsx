"use client";

import { useState, useRef, useEffect } from 'react';
import { IconPhone, IconPhoneOff, IconMicrophone, IconMicrophoneOff, IconVolume, IconLanguage, IconLoader, IconRobot, IconSpeakerphone } from '@tabler/icons-react';
import EmailPopup from './email-popup';
import SmartSidePopup from './smart-side-popup';
import React from 'react';

interface Message {
  id: string;
  type: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

interface VisualData {
  type: 'services_display' | 'pricing_display' | 'booking_form' | 'booking_confirmation';
  services?: any[];
  pricing?: Record<string, any>;
  bookingForm?: any;
  bookingId?: string;
}

const translations = {
  en: {
    startCall: "Start Voice Call",
    endCall: "End Call",
    listening: "Listening...",
    speaking: "AI Speaking...",
    clickToTalk: "Click to Talk",
    callActive: "Call Active",
    greetings: [
      "Hello! Welcome to Yuva Digital Studio. How can I help you today?",
      "Hi there! Welcome to Yuva Digital Studio. What can I do for you?",
      "Good day! This is Yuva Digital Studio. How may I assist you?",
      "Welcome to Yuva Digital Studio! I'm here to help with your photography needs.",
      "Hello! Thanks for calling Yuva Digital Studio. What brings you here today?"
    ],
    language: "Language",    
    micPermission: "Microphone permission required",
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
    greetings: [
      "नमस्ते! युवा डिजिटल स्टूडियो में आपका स्वागत है। आज मैं आपकी कैसे मदद कर सकता हूं?",
      "नमस्कार! युवा डिजिटल स्टूडियो में आपका स्वागत है। मैं आपकी क्या सेवा कर सकता हूं?",
      "आदाब! यह युवा डिजिटल स्टूडियो है। आज मैं आपकी कैसे सहायता कर सकता हूं?",
      "नमस्ते! युवा डिजिटल स्टूडियो में आपका हार्दिक स्वागत है। मैं यहां आपकी फोटोग्राफी की जरूरतों में मदद के लिए हूं।",
      "प्रणाम! युवा डिजिटल स्टूडियो को कॉल करने के लिए धन्यवाद। आज आप यहां क्यों आए हैं?"
    ],
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

const ELEVENLABS_API_KEY = 'sk_52d9f42330bae313596815b09b0c303c118c76dcf1e9f965';

export default function VoiceCallInterface({ 
  language = 'en', 
  className = '' 
}: VoiceCallInterfaceProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>(language);
  const [sessionId, setSessionId] = useState<string>(() => 'voice-session-' + Date.now());
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  
  // Smart side popup state
  const [visualData, setVisualData] = useState<VisualData | null>(null);
  const [showSidePopup, setShowSidePopup] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isRecognitionActive = useRef(false);
  const isCallActiveRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Enhanced echo prevention state
  const lastSpeechEndTime = useRef<number>(0);
  const audioPlaybackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSpeakingRef = useRef(false);
  const isPlayingAudioRef = useRef(false);
  
  // Track the last AI message for echo prevention
  const lastAIMessageRef = useRef<string>('');
  
  // --- Continuous listening with chain window ---
  let chainTimeout: NodeJS.Timeout | null = null;
  let chainedTranscript = '';
  
  const t = translations[selectedLanguage];

  const getRandomGreeting = () => {
    const greetings = t.greetings;
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: "smooth", 
      block: "nearest",
      inline: "nearest"
    });
  }, [messages, liveTranscript]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      setupSpeechRecognition();
    }
  }, [selectedLanguage]);

  // Handle visual data changes
  useEffect(() => {
    if (visualData) {
      setShowSidePopup(true);
      // Auto-hide after 10 seconds for non-confirmation types
      if (visualData.type !== 'booking_confirmation') {
        const timer = setTimeout(() => {
          setShowSidePopup(false);
          setVisualData(null);
        }, 10000);
        return () => clearTimeout(timer);
      }
    }
  }, [visualData]);

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
        setLiveTranscript(interimTranscript);
        if (finalTranscript) {
          console.log('🎤 Final transcript:', finalTranscript);
          setTranscript(finalTranscript);
          handleUserSpeech(finalTranscript);
          stopListening();
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('🎤 Speech recognition error:', event.error);
        setIsListening(false);
        isRecognitionActive.current = false;
      };

      recognitionRef.current.onend = () => {
        console.log('🎤 Speech recognition ended');
        setIsListening(false);
        isRecognitionActive.current = false;
        // Do NOT auto-restart listening - user must click mic button
      };
    }
  };

  const startCall = async () => {
    setShowEmailPopup(true);
  };

  const endCall = async () => {
    setIsCallActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    setLiveTranscript('');
    setTranscript('');
    isCallActiveRef.current = false;
    isRecognitionActive.current = false;
    
    // Clear visual data
    setVisualData(null);
    setShowSidePopup(false);
    
    // Stop any ongoing speech
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    
    // Clear any pending timeouts
    if (audioPlaybackTimeoutRef.current) {
      clearTimeout(audioPlaybackTimeoutRef.current);
    }
    
    console.log('📞 Call ended');
  };

  const startListening = () => {
    if (!isCallActive || isListening || isSpeaking || isProcessing) {
      console.log('🚫 Cannot start listening - call not active or AI speaking');
      return;
    }
    
    try {
      if (recognitionRef.current && !isRecognitionActive.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('🎤 Error starting speech recognition:', error);
    }
  };

  const stopListening = () => {
    try {
      if (recognitionRef.current && isRecognitionActive.current) {
        recognitionRef.current.stop();
      }
    } catch (error) {
      console.error('🎤 Error stopping speech recognition:', error);
    }
  };

  const [aiModel, setAiModel] = useState<'backend' | 'elevenlabs'>('backend');
  const [elevenLabsVoices, setElevenLabsVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('Rachel');
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);

  // Fetch ElevenLabs voices on mount
  useEffect(() => {
    if (aiModel === 'elevenlabs') {
      fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': ELEVENLABS_API_KEY }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.voices) {
            setElevenLabsVoices(data.voices);
            if (!data.voices.find((v: any) => v.name === selectedVoice)) {
              setSelectedVoice(data.voices[0]?.name || 'Rachel');
            }
          }
        })
        .catch(() => setElevenLabsVoices([]));
    }
  }, [aiModel]);

  const handleUserSpeech = async (text: string) => {
    setIsProcessing(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    try {
      let aiResponse = '';
      let audioUrl = '';
      if (aiModel === 'elevenlabs' && selectedLanguage === 'en') {
        // ElevenLabs Conversational AI
        const convRes = await fetch('https://api.elevenlabs.io/v1/ai/chat', {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model_id: 'eleven_monolingual_v1',
            messages: [
              { role: 'user', content: text }
            ],
            // Optionally add context/history here
          }),
        });
        const convData = await convRes.json();
        aiResponse = convData?.choices?.[0]?.message?.content || '';
        // ElevenLabs TTS
        if (aiResponse) {
          const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
            method: 'POST',
            headers: {
              'xi-api-key': ELEVENLABS_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: aiResponse,
              model_id: 'eleven_monolingual_v1',
              voice_settings: { stability: 0.5, similarity_boost: 0.8 }
            }),
          });
          if (ttsRes.ok) {
            const blob = await ttsRes.blob();
            audioUrl = URL.createObjectURL(blob);
          }
        }
      } else {
        // Default: backend AI
        const response = await fetch('/api/voice/conversation-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            userInput: text,
            language: selectedLanguage
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        aiResponse = data.success && data.data
          ? (typeof data.data.response === 'string' ? data.data.response : (data.data.response?.response || ''))
          : '';
        if (data.data && data.data.audioUrl) {
          audioUrl = data.data.audioUrl;
        }
        if (data.data && data.data.response && typeof data.data.response === 'object' && data.data.response.visualData) {
          setVisualData(data.data.response.visualData);
        } else if (data.data && data.data.visualData) {
          setVisualData(data.data.visualData);
        }
      }
      lastAIMessageRef.current = aiResponse;
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        text: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMessage]);
      if (selectedLanguage === 'hi') {
        await speakText(aiResponse);
      } else if (audioUrl) {
        const played = await playTTSAudio(audioUrl, aiResponse, true);
        if (!played) {
          await speakText(aiResponse);
        }
      } else {
        await speakText(aiResponse);
      }
    } catch (error) {
      const errorMessage = selectedLanguage === 'hi'
        ? 'क्षमा करें, कुछ तकनीकी समस्या है। कृपया फिर कोशिश करें।'
        : 'Sorry, there was a technical issue. Please try again.';
      lastAIMessageRef.current = errorMessage;
      const errorAgentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        text: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorAgentMessage]);
      await speakText(errorMessage);
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        if (isCallActiveRef.current) {
          startListening();
        }
      }, 500);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleUserSpeech(suggestion);
  };

  const speakText = (text: string) => {
    return new Promise<void>((resolve) => {
      if (!synthRef.current) {
        console.warn('🔊 Speech synthesis not available');
        resolve();
        return;
      }

      // Cancel any ongoing speech
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        isSpeakingRef.current = true;
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        lastSpeechEndTime.current = Date.now();
        resolve();
      };
      utterance.onerror = (event) => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        resolve();
      };
      synthRef.current.speak(utterance);
    });
  };

  // playTTSAudio returns true if audio played, false if fallback was used
  const playTTSAudio = async (audioUrl: string, fallbackText?: string, returnPlayed?: boolean): Promise<boolean|void> => {
    if (selectedLanguage === 'hi') {
      await speakText(fallbackText || '');
      return returnPlayed ? false : undefined;
    }
    return new Promise((resolve) => {
      if (!audioUrl) {
        if (fallbackText) {
          speakText(fallbackText).then(() => resolve(returnPlayed ? false : undefined));
        } else {
          resolve(returnPlayed ? false : undefined);
        }
        return;
      }
      const audio = new Audio(audioUrl);
      isPlayingAudioRef.current = true;
      let played = false;
      const cleanup = () => {
        isPlayingAudioRef.current = false;
        if (audioPlaybackTimeoutRef.current) {
          clearTimeout(audioPlaybackTimeoutRef.current);
        }
      };
      const onLoaded = () => {};
      const onCanPlay = () => {
        audio.play().then(() => {
          played = true;
        }).catch(() => {
          cleanup();
          if (fallbackText) {
            speakText(fallbackText).then(() => resolve(returnPlayed ? false : undefined));
          } else {
            resolve(returnPlayed ? false : undefined);
          }
        });
      };
      const onEnded = () => {
        cleanup();
        resolve(returnPlayed ? played : undefined);
      };
      const onError = () => {
        cleanup();
        if (fallbackText) {
          speakText(fallbackText).then(() => resolve(returnPlayed ? false : undefined));
        } else {
          resolve(returnPlayed ? false : undefined);
        }
      };
      const onLoadStart = () => {
        audioPlaybackTimeoutRef.current = setTimeout(() => {
          cleanup();
          if (fallbackText) {
            speakText(fallbackText).then(() => resolve(returnPlayed ? false : undefined));
          } else {
            resolve(returnPlayed ? false : undefined);
          }
        }, 10000);
      };
      audio.addEventListener('loadeddata', onLoaded);
      audio.addEventListener('canplay', onCanPlay);
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);
      audio.addEventListener('loadstart', onLoadStart);
      const cleanupEventListeners = () => {
        audio.removeEventListener('loadeddata', onLoaded);
        audio.removeEventListener('canplay', onCanPlay);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
        audio.removeEventListener('loadstart', onLoadStart);
      };
      audio.addEventListener('ended', cleanupEventListeners);
      audio.addEventListener('error', cleanupEventListeners);
    });
  };

  const handleEmailSubmit = async (email: string) => {
    setCustomerEmail(email);
    setShowEmailPopup(false);
    
    // Set email in session
    if (email) {
      try {
        await fetch('/api/voice/set-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            email
          }),
        });
        console.log('📧 Email set in session:', email);
      } catch (error) {
        console.error('📧 Error setting email:', error);
      }
    }
    
    // Start the call
    await startCallInternal();
  };

  const startCallInternal = async () => {
    setIsCallActive(true);
    isCallActiveRef.current = true;
    const greeting = getRandomGreeting();
    lastAIMessageRef.current = greeting;
    const greetingMessage: Message = {
      id: Date.now().toString(),
      type: 'agent',
      text: greeting,
      timestamp: new Date()
    };
    setMessages([greetingMessage]);
    try {
      if (selectedLanguage === 'hi') {
        await speakText(greeting);
      } else {
        const response = await fetch('/api/voice/conversation-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            userInput: greeting,
            language: selectedLanguage
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.audioUrl) {
            await playTTSAudio(data.data.audioUrl, greeting);
          } else {
            await speakText(greeting);
          }
        } else {
          await speakText(greeting);
        }
      }
    } catch (err) {
      await speakText(greeting);
    }
    // Wait 500ms before listening after greeting
    setTimeout(() => {
      if (isCallActiveRef.current) {
        startListening();
      }
    }, 500);
    console.log('📞 Call started');
  };

  // Voice preview function
  const previewVoice = async () => {
    setIsPreviewingVoice(true);
    try {
      const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'This is a sample of the selected ElevenLabs voice.',
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.8 }
        }),
      });
      if (ttsRes.ok) {
        const blob = await ttsRes.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPreviewingVoice(false);
        audio.onerror = () => setIsPreviewingVoice(false);
        audio.play();
      } else {
        setIsPreviewingVoice(false);
      }
    } catch {
      setIsPreviewingVoice(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Smart Side Popup */}
      <SmartSidePopup
        visualData={visualData}
        isVisible={showSidePopup}
        onClose={() => {
          setShowSidePopup(false);
          setVisualData(null);
        }}
        language={selectedLanguage}
      />

      {/* Email Popup */}
      {showEmailPopup && (
        <EmailPopup
          isOpen={showEmailPopup}
          onClose={() => setShowEmailPopup(false)}
          onEmailSubmit={handleEmailSubmit}
          language={selectedLanguage}
        />
      )}

      {/* Main Interface */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isCallActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="font-medium text-foreground">
                {isCallActive ? t.callActive : t.startCall}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as 'en' | 'hi')}
                className="text-xs bg-background border border-border rounded px-2 py-1"
              >
                <option value="en">EN</option>
                <option value="hi">हि</option>
              </select>
              
              <button
                onClick={isCallActive ? endCall : startCall}
                className={`p-2 rounded-lg transition-colors ${
                  isCallActive 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {isCallActive ? <IconPhoneOff className="w-4 h-4" /> : <IconPhone className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* AI Model and Voice Selector */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <IconRobot className="w-5 h-5" />
            <label className="text-sm font-medium">AI Model:</label>
            <select value={aiModel} onChange={e => setAiModel(e.target.value as any)} className="border rounded px-2 py-1">
              <option value="backend">Backend AI</option>
              <option value="elevenlabs">Latest Model</option>
            </select>
          </div>
          {aiModel === 'elevenlabs' && (
            <div className="flex items-center gap-2">
              <IconSpeakerphone className="w-5 h-5" />
              <label className="text-sm font-medium">Voice:</label>
              <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)} className="border rounded px-2 py-1">
                {elevenLabsVoices.map(v => (
                  <option key={v.voice_id} value={v.name}>{v.name}</option>
                ))}
              </select>
              <button onClick={previewVoice} disabled={isPreviewingVoice} className="ml-2 px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
                {isPreviewingVoice ? 'Previewing...' : 'Preview Voice'}
              </button>
            </div>
          )}
          <span className="ml-4 text-xs text-muted-foreground">
            Active: {aiModel === 'elevenlabs' ? `ElevenLabs (${selectedVoice})` : 'Backend AI'}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {/* Live transcript */}
          {liveTranscript && (
            <div className="flex justify-end">
              <div className="max-w-[80%] p-3 rounded-lg bg-primary/20 border border-primary/30">
                <p className="text-sm text-muted-foreground italic">{liveTranscript}</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Status and Controls */}
        <div className="p-4 border-t border-border bg-muted/30">
          {/* Status indicators */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {isListening && (
              <div className="flex items-center gap-2 text-blue-600">
                <IconMicrophone className="w-4 h-4 animate-pulse" />
                <span className="text-sm">{t.listening}</span>
              </div>
            )}
            
            {isSpeaking && (
              <div className="flex items-center gap-2 text-green-600">
                <IconVolume className="w-4 h-4 animate-pulse" />
                <span className="text-sm">{t.speaking}</span>
              </div>
            )}
            
            {isProcessing && (
              <div className="flex items-center gap-2 text-orange-600">
                <IconLoader className="w-4 h-4 animate-spin" />
                <span className="text-sm">{t.processing}</span>
              </div>
            )}
          </div>

          {/* Main control button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={isCallActive ? startListening : startCall}
              disabled={!isCallActive || isSpeaking || isProcessing}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isCallActive && !isSpeaking && !isProcessing
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              } ${isListening ? 'animate-pulse' : ''}`}
            >
              {isListening ? (
                <IconMicrophoneOff className="w-6 h-6" />
              ) : (
                <IconMicrophone className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Quick suggestions */}
          {isCallActive && messages.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">{t.quickSuggestions}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {t.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isSpeaking || isProcessing}
                    className="text-xs bg-background border border-border rounded-full px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
