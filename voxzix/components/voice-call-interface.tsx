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
    greetings: [
      "Hello! Welcome to Yuva Digital Studio. How can I help you today?",
      "Hi there! Welcome to Yuva Digital Studio. What can I do for you?",
      "Good day! This is Yuva Digital Studio. How may I assist you?",
      "Welcome to Yuva Digital Studio! I'm here to help with your photography needs.",
      "Hello! Thanks for calling Yuva Digital Studio. What brings you here today?"
    ],
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

export default function VoiceCallInterface({ 
  language = 'en', 
  className = '' 
}: VoiceCallInterfaceProps) {  const [isCallActive, setIsCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>(language);
  const [sessionId, setSessionId] = useState<string>(() => 'voice-session-' + Date.now());
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
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
  }, [selectedLanguage]);  const setupSpeechRecognition = () => {
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
      };          recognitionRef.current.onresult = (event: any) => {
        // ENHANCED ECHO PREVENTION: Don't process if AI is speaking or just finished speaking
        const timeSinceLastSpeech = Date.now() - lastSpeechEndTime.current;
        if (isSpeaking || isProcessing || isSpeakingRef.current || isPlayingAudioRef.current || timeSinceLastSpeech < 1000) {
          console.log('🚫 Ignoring speech input - AI activity detected:', {
            isSpeaking,
            isProcessing,
            isSpeakingRef: isSpeakingRef.current,
            isPlayingAudio: isPlayingAudioRef.current,
            timeSinceLastSpeech
          });
          return;
        }
        
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
        
        // Enhanced filter for common AI response patterns to prevent echo
        const aiResponsePatterns = [
          /my name is not required/i,
          /i'm an ai assistant/i,
          /let's focus on/i,
          /i just need your name/i,
          /let's start with your name/i,
          /how can i help you/i,
          /welcome to yuva digital/i,
          /what can i do for you/i,
          /what services do you offer/i,
          /what are your working hours/i,
          /thank you for calling/i,
          /photography studio/i,
          /digital studio/i,
          /book an appointment/i,
          /wedding photography/i,
          /portrait photography/i,
          /photo session/i,
          /ai is speaking/i,
          /मैं एक एआई सहायक/i,
          /नाम आवश्यक नहीं/i,
          /युवा डिजिटल स्टूडियो/i,
          /कैसे मदद कर सकता/i,
          /क्या सेवाएं प्रदान/i,
          /फोटोग्राफी/i,
          /अपॉइंटमेंट/i,
          /बुकिंग/i,
          /स्टूडियो/i,
          /सेवाएं/i,
          /कीमत/i,
          /समय/i
        ];
        
        const isEcho = aiResponsePatterns.some(pattern => 
          pattern.test(interimTranscript) || pattern.test(finalTranscript)
        );
        
        if (isEcho) {
          console.log('🚫 Detected potential echo, ignoring:', finalTranscript || interimTranscript);
          return;
        }
        
        // Additional check: ignore very short phrases that might be noise
        if (finalTranscript && finalTranscript.trim().length < 3) {
          console.log('🚫 Ignoring very short speech (likely noise):', finalTranscript);
          return;
        }
        
        if (interimTranscript && !isEcho) {
          setLiveTranscript(interimTranscript);
          console.log('🗣️ Interim speech:', interimTranscript);
        }
        
        if (finalTranscript && !isEcho && finalTranscript.trim().length >= 3) {
          console.log('✅ Final speech recognized:', finalTranscript);
          setLiveTranscript('');
          // Stop recognition immediately to prevent further echo
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
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
          console.log('No speech detected - stopping recognition to prevent loops');
          // Do NOT auto-restart to prevent loops
        } else {
          console.log('Speech recognition error:', event.error, '- manual restart required');
        }
      };recognitionRef.current.onend = () => {
        console.log('🎤 Speech recognition ended');
        setIsListening(false);
        setLiveTranscript('');
        isRecognitionActive.current = false;
        
        // ENHANCED ECHO PREVENTION: Only restart if explicitly needed
        // Do NOT automatically restart listening to prevent loops
        console.log('🔄 Speech recognition ended - waiting for manual restart');
      };
    } else {
      console.error('Speech recognition not supported');
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    }
  };  const startCall = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone permission granted');
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      alert(t.micPermission);
      return;
    }

    console.log('📞 Starting call with sessionId:', sessionId);
    setIsCallActive(true);
    isCallActiveRef.current = true;
    console.log('✅ Call state set to active');
    
    // Use consistent greeting text for both display and speech
    const greetingText = getRandomGreeting();
    
    const initialMessage: Message = {
      id: Date.now().toString(),
      type: 'agent',
      text: greetingText,
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);    
    // Use TTS service directly for initial greeting (not browser TTS)
    setTimeout(async () => {
      try {
        const response = await fetch('/api/voice/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: greetingText,
            language: selectedLanguage
          })
        });
        if (response.ok) {
          const audioBlob = await response.blob();
          if (!audioBlob || audioBlob.size === 0) {
            speakText(greetingText);
          } else {
            const audioUrl = URL.createObjectURL(audioBlob);
            await playTTSAudio(audioUrl, greetingText);
          }
        } else {
          speakText(greetingText);
        }
      } catch (error) {
        speakText(greetingText);
      }
      setTimeout(() => {
        if (isCallActiveRef.current && !isSpeakingRef.current && !isPlayingAudioRef.current) {
          startListening();
        }
      }, 2000);
    }, 300);
  };const endCall = async () => {
    console.log('📞 Ending call');
    
    // Clear all timeouts to prevent any delayed listening restarts
    if (audioPlaybackTimeoutRef.current) {
      clearTimeout(audioPlaybackTimeoutRef.current);
      audioPlaybackTimeoutRef.current = null;
    }
    
    // Cleanup session audio files
    try {
      await fetch('/api/voice/conversation-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cleanup',
          sessionId: sessionId
        })
      });
    } catch (error) {
      console.warn('Failed to cleanup session audio files:', error);
    }
    
    setIsCallActive(false);
    isCallActiveRef.current = false;
    console.log('❌ Call state set to inactive');
    setIsListening(false);
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    isPlayingAudioRef.current = false;
    setIsProcessing(false);
    setMessages([]);
    setSessionId('voice-session-' + Date.now());
    setLiveTranscript('');
    lastSpeechEndTime.current = 0;
    
    if (recognitionRef.current && isRecognitionActive.current) {
      recognitionRef.current.stop();
    }

    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };const startListening = () => {
    // ENHANCED ECHO PREVENTION: More comprehensive checks
    const timeSinceLastSpeech = Date.now() - lastSpeechEndTime.current;
      if (!recognitionRef.current || 
        isRecognitionActive.current || 
        isSpeaking || 
        isProcessing ||
        isSpeakingRef.current ||
        isPlayingAudioRef.current ||
        timeSinceLastSpeech < 1500) { // Reduced wait time for faster conversation
      
      console.log('🚫 Cannot start listening:', { 
        hasRecognition: !!recognitionRef.current, 
        isActive: isRecognitionActive.current,
        isSpeaking,
        isProcessing,
        isSpeakingRef: isSpeakingRef.current,
        isPlayingAudio: isPlayingAudioRef.current,
        timeSinceLastSpeech,
        minWaitTime: 1500
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
      });
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData
        });
        throw new Error(`API error: ${response.status} - ${errorData}`);
      }
      const result = await response.json();
      const agentMessageText = result.data?.response || result.response || 'Sorry, I couldn\'t process your request.';
      setMessages(prev => {
        if (prev.length > 0 && prev[prev.length - 1].type === 'agent' && prev[prev.length - 1].text === agentMessageText) {
          return prev;
        }
        return [...prev, {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          text: agentMessageText,
          timestamp: new Date()
        }];
      });
      try {
        const ttsResponse = await fetch('/api/voice/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: agentMessageText,
            language: selectedLanguage
          })
        });
        if (ttsResponse.ok) {
          const audioBlob = await ttsResponse.blob();
          if (!audioBlob || audioBlob.size === 0) {
            speakText(agentMessageText);
          } else {
            const audioUrl = URL.createObjectURL(audioBlob);
            await playTTSAudio(audioUrl, agentMessageText);
          }
        } else {
          speakText(agentMessageText);
        }
      } catch (ttsError) {
        speakText(agentMessageText);
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
  };  const speakText = (text: string) => {
    if (!synthRef.current) return;
    if (recognitionRef.current && isRecognitionActive.current) {
      recognitionRef.current.stop();
    }
    if (audioPlaybackTimeoutRef.current) {
      clearTimeout(audioPlaybackTimeoutRef.current);
      audioPlaybackTimeoutRef.current = null;
    }
    setIsSpeaking(true);
    isSpeakingRef.current = true;
    isPlayingAudioRef.current = true;
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const speak = () => {
      if (!synthRef.current) return;
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synthRef.current.getVoices();
      let selectedVoice = null;
      if (selectedLanguage === 'hi') {
        selectedVoice = voices.find(voice => voice.lang.includes('hi') || voice.name.toLowerCase().includes('hindi'));
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
        isSpeakingRef.current = false;
        isPlayingAudioRef.current = false;
        lastSpeechEndTime.current = Date.now();
        if (isCallActiveRef.current) {
          audioPlaybackTimeoutRef.current = setTimeout(() => {
            if (!isSpeakingRef.current && !isPlayingAudioRef.current && isCallActiveRef.current) {
              startListening();
            }
          }, 1500);
        }
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        isPlayingAudioRef.current = false;
        lastSpeechEndTime.current = Date.now();
        if (isCallActiveRef.current) {
          audioPlaybackTimeoutRef.current = setTimeout(() => {
            if (!isSpeakingRef.current && !isPlayingAudioRef.current) {
              startListening();
            }
          }, 1500);
        }
      };
      synthRef.current.speak(utterance);
    };
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        speak();
      };
      window.speechSynthesis.getVoices();
    } else {
      speak();
    }
  };  const playTTSAudio = async (audioUrl: string, fallbackText?: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!audioUrl || audioUrl === 'blob:null' || audioUrl.startsWith('blob:') && audioUrl.length < 20) {
        if (fallbackText) speakText(fallbackText);
        resolve();
        return;
      }
      
      // ENHANCED ECHO PREVENTION: Stop speech recognition and set all audio states
      if (recognitionRef.current && isRecognitionActive.current) {
        console.log('🛑 Force stopping speech recognition before audio playback');
        recognitionRef.current.stop();
        isRecognitionActive.current = false;
        setIsListening(false);
        setLiveTranscript('');
      }
      
      // Clear any existing timeouts
      if (audioPlaybackTimeoutRef.current) {
        clearTimeout(audioPlaybackTimeoutRef.current);
        audioPlaybackTimeoutRef.current = null;
      }
      
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      isPlayingAudioRef.current = true;
      
      // Handle both blob URLs and regular URLs
      let fullAudioUrl: string;
      if (audioUrl.startsWith('blob:')) {
        fullAudioUrl = audioUrl; // Use blob URL directly
      } else if (audioUrl.startsWith('/api/audio/')) {
        // Extract filename from backend audio URL
        const filename = audioUrl.split('/').pop();
        fullAudioUrl = `/api/audio/${filename}`;
      } else if (audioUrl.startsWith('http')) {
        fullAudioUrl = audioUrl;
      } else {
        // For relative URLs, extract filename and use Next.js proxy
        const filename = audioUrl.replace('/api/audio/', '');
        fullAudioUrl = `/api/audio/${filename}`;
      }
      
      console.log('🔊 Playing audio:', fullAudioUrl.startsWith('blob:') ? 'blob URL' : fullAudioUrl);
      
      const audio = new Audio();
      
      let audioLoaded = false;
      let playbackStarted = false;
      
      const cleanup = () => {
        audio.removeEventListener('loadeddata', onLoaded);
        audio.removeEventListener('canplay', onCanPlay);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
        audio.removeEventListener('loadstart', onLoadStart);
        
        // Clean up blob URL if created locally
        if (fullAudioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(fullAudioUrl);
        }
      };
      
      const onLoaded = () => {
        audioLoaded = true;
        console.log('✅ Audio loaded successfully');
      };
      
      const onCanPlay = () => {
        if (!playbackStarted) {
          playbackStarted = true;
          console.log('▶️ Starting audio playback');
          audio.play().catch(onError);
        }
      };        const onEnded = () => {
        console.log('🔚 Audio playback ended');
        cleanup();
        
        // Enhanced state cleanup for echo prevention
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        isPlayingAudioRef.current = false;
        lastSpeechEndTime.current = Date.now();
        
        // FASTER restart for real-time conversation
        if (isCallActiveRef.current) {
          audioPlaybackTimeoutRef.current = setTimeout(() => {
            console.log('👂 Manually restarting listening after audio ended');
            // Triple-check that we're ready to restart
            if (!isSpeakingRef.current && !isPlayingAudioRef.current && isCallActiveRef.current && !isRecognitionActive.current) {
              startListening();
            } else {
              console.log('🚫 Skipping restart - conditions not met:', {
                isSpeaking: isSpeakingRef.current,
                isPlayingAudio: isPlayingAudioRef.current,
                isCallActive: isCallActiveRef.current,
                isRecognitionActive: isRecognitionActive.current
              });
            }
          }, 2000); // Reduced delay for faster conversation
        }
        resolve();
      };
        const onError = (error?: any) => {
        console.error('❌ Audio playback failed:', error);
        cleanup();
        
        // Enhanced error state cleanup
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        isPlayingAudioRef.current = false;
        lastSpeechEndTime.current = Date.now();
        
        if (isCallActiveRef.current) {
          audioPlaybackTimeoutRef.current = setTimeout(() => {
            if (!isSpeakingRef.current && !isPlayingAudioRef.current) {
              startListening();
            }
          }, 1500); // Faster restart on error
        }
        
        resolve();
      };
      
      const onLoadStart = () => {
        console.log('📥 Starting to load audio...');
        setTimeout(() => {
          if (!audioLoaded && !playbackStarted) {
            console.warn('⚠️ Audio loading timeout, falling back to browser TTS');
            onError('Audio loading timeout');
          }
        }, 3000); // Reduced timeout for faster fallback
      };
      
      audio.addEventListener('loadeddata', onLoaded);
      audio.addEventListener('canplay', onCanPlay);
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);
      audio.addEventListener('loadstart', onLoadStart);
      
      audio.preload = 'auto';
      audio.src = fullAudioUrl;
      audio.load();
      
      // Faster force play for real-time conversation
      setTimeout(() => {
        if (!playbackStarted) {
          console.log('🚀 Force starting audio playback');
          audio.play().catch((err) => {
            console.error('🚫 Force play failed:', err);
            onError(err);
          });
        }
      }, 1000); // Reduced delay for faster audio start
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
      ) : (        
      
      <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full" style={{ borderRadius: 'var(--radius-xl)' }}>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="font-medium">{t.callActive}</span>
            </div>
          </div>          
          
          <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto scroll-smooth" style={{ borderRadius: 'var(--radius)' }}>
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
              <div ref={messagesEndRef} />
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
          </div>         
           <div className="text-center text-sm text-muted-foreground">
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
