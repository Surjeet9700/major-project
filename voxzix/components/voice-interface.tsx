"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconMicrophone, 
  IconMicrophoneOff, 
  IconVolume, 
  IconVolumeOff,
  IconLoader,
  IconPhone,
  IconPhoneOff,
  IconLanguage
} from '@tabler/icons-react';

interface Message {
  id: string;
  type: 'user' | 'agent';
  text: string;
  timestamp: Date;
  isPlaying?: boolean;
}

const translations = {
  en: {
    greeting: "Hello! Thank you for calling Yuva Digital Studio. I'm your AI assistant. How can I help you today?",
    startCall: "Start Demo Call",
    endCall: "End Call",
    listening: "Listening...",
    speaking: "Speaking...",
    clickToTalk: "Click to talk",
    language: "Language"
  },
  hi: {
    greeting: "नमस्ते! युवा डिजिटल स्टूडियो में आपका स्वागत है। मैं आपका AI सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
    startCall: "डेमो कॉल शुरू करें",
    endCall: "कॉल समाप्त करें", 
    listening: "सुन रहा हूं...",
    speaking: "बोल रहा हूं...",
    clickToTalk: "बात करने के लिए क्लिक करें",
    language: "भाषा"
  }
};

interface VoiceInterfaceProps {
  language?: 'en' | 'hi';
}

export default function VoiceInterface({ language = 'en' }: VoiceInterfaceProps) {  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [transcript, setTranscript] = useState('');  
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>(language);
  const [sessionId, setSessionId] = useState<string>(''); // Single session ID
  const [useTTSAudio, setUseTTSAudio] = useState(true); // Always use Bark TTS for better voice quality
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [lastSpeechEndTime, setLastSpeechEndTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const t = translations[selectedLanguage];

  // Sync language prop with internal state
  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Enable continuous listening
      recognitionRef.current.interimResults = false;
      
      // Set language based on selection
      const langCode = selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';
      recognitionRef.current.lang = langCode;      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[event.results.length - 1][0].transcript;
          // Don't process if we're currently speaking or just finished speaking
        const timeSinceLastSpeech = Date.now() - lastSpeechEndTime;
        if (isSpeaking || isProcessingAudio || timeSinceLastSpeech < 5000) {
          console.log('🚫 Ignoring speech while AI is speaking or too soon after:', text);
          return;
        }
        
        // Filter out potential AI speech feedback (common AI phrases)
        const aiPhrases = [
          'hello thank you for calling',
          'yuva digital studio',
          'how can i help',
          'booking',
          'photography',
          'rupees',
          'thank you for calling yuva',
          'digital studio',
          'ai assistant',
          'नमस्ते युवा डिजिटल',
          'स्टूडियो में आपका स्वागत',
          'मैं आपका ai सहायक',
          'युवा डिजिटल स्टूडियो',
          'फोटोग्राफी',
          'बुकिंग'
        ];
        
        const lowerText = text.toLowerCase();
        const isLikelyAISpeech = aiPhrases.some(phrase => lowerText.includes(phrase));
        
        if (isLikelyAISpeech) {
          console.log('🚫 Filtering out potential AI speech feedback:', text);
          return;
        }
        
        // Only process if text is long enough and not just noise
        if (text.trim().length >= 3) {
          console.log('✅ Processing user speech:', text);
          setTranscript(text);
          handleUserMessage(text);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Restart listening after a brief pause for no-speech errors
          setTimeout(() => {
            if (isActive && !isSpeaking) {
              startListening();
            }
          }, 1000);
        }
        setIsListening(false);
      };      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Prevent immediate restart if we just finished speaking
        const timeSinceLastSpeech = Date.now() - lastSpeechEndTime;
        const minWaitTime = 2000; // Wait at least 2 seconds after speaking ends
        
        if (isActive && !isSpeaking && !isProcessingAudio && timeSinceLastSpeech > minWaitTime) {
          setTimeout(() => {
            if (isActive && !isSpeaking && !isProcessingAudio) {
              startListening();
            }
          }, 1000); // Additional 1 second delay
        }
      };
    }
  }, [selectedLanguage, isActive, isSpeaking]);
  const startCall = async () => {
    setIsActive(true);
    setMessages([]);
    
    // Generate a single session ID for this conversation
    const newSessionId = 'demo-session-' + Date.now();
    setSessionId(newSessionId);        setTimeout(async () => {
      try {
        // Always use audio endpoint for Bark TTS
        const response = await fetch('/api/voice/conversation-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },body: JSON.stringify({
            sessionId: newSessionId,
            userInput: selectedLanguage === 'hi' ? 'नमस्ते' : 'hello',
            language: selectedLanguage
          })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }        const result = await response.json();
        
        const initialMessage: Message = {
          id: Date.now().toString(),
          type: 'agent',
          text: result.data?.response || result.response || t.greeting,
          timestamp: new Date()
        };
          setMessages([initialMessage]);        // Use HuggingFace TTS if available, otherwise fallback to browser TTS
        if (result.data?.audioUrl) {
          playTTSAudio(result.data.audioUrl);
        } else {
          // Fallback to browser TTS when HuggingFace TTS fails
          console.warn('No HuggingFace TTS audio available, falling back to browser TTS');
          speakText(initialMessage.text);
        }
        
        // Auto-start listening after initial greeting
        setTimeout(() => {
          startListening();
        }, 2000);
          } catch (error) {
        console.error('Error starting conversation:', error);
        
        const fallbackMessage: Message = {
          id: Date.now().toString(),
          type: 'agent',
          text: t.greeting,
          timestamp: new Date()
        };
        setMessages([fallbackMessage]);
          // Try to get TTS audio for greeting too
        try {
          const greetingResponse = await fetch('/api/voice/conversation-audio', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: newSessionId,
              userInput: t.greeting,
              language: selectedLanguage
            })
          });
          
          if (greetingResponse.ok) {
            const greetingResult = await greetingResponse.json();
            if (greetingResult.data?.audioUrl) {
              playTTSAudio(greetingResult.data.audioUrl);
              return;
            }
          }
        } catch (greetingError) {
          console.warn('Greeting TTS also failed:', greetingError);
        }
        
        // Only use browser TTS as last resort
        speakText(fallbackMessage.text);
      }
    }, 1000);
  };

  const endCall = () => {
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setMessages([]);
    setTranscript('');
    setSessionId(''); // Clear session ID
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    window.speechSynthesis.cancel();
  };
  const startListening = async () => {
    if (!recognitionRef.current || isListening) return;

    try {
      setIsListening(true);
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop listening immediately before speaking to prevent feedback
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
        setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice based on language
      const voices = speechSynthesis.getVoices();
      let selectedVoice = null;
      
      if (selectedLanguage === 'hi') {
        selectedVoice = voices.find(voice => voice.lang.includes('hi')) || voices.find(voice => voice.name.includes('Hindi'));
      } else {
        selectedVoice = voices.find(voice => voice.lang.includes('en'));
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = 1.3; // Increased from 0.9 to 1.3 for faster speech
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => {
        console.log('🔊 Starting browser TTS speech');
      };
      
      utterance.onend = () => {
        console.log('✅ Browser TTS speech ended');
        setIsSpeaking(false);
        setIsProcessingAudio(false);
        setLastSpeechEndTime(Date.now()); // Track when speech ends
        // Longer delay before restarting listening to prevent feedback
        if (isActive) {
          setTimeout(() => {
            if (isActive && !isSpeaking && !isProcessingAudio) {
              console.log('🎤 Restarting listening after browser speech');
              startListening();
            }
          }, 3000); // Increased to 3 seconds for better feedback prevention
        }
      };
      
      utterance.onerror = (e) => {
        console.error('❌ Browser TTS error:', e);
        setIsSpeaking(false);
        setIsProcessingAudio(false);
        setLastSpeechEndTime(Date.now());
        // Auto-restart listening on error too
        if (isActive) {
          setTimeout(() => {
            if (isActive && !isSpeaking && !isProcessingAudio) {
              startListening();
            }
          }, 3000); // Increased delay
        }
      };
      
      window.speechSynthesis.speak(utterance);
    }  };

  const playTTSAudio = async (audioUrl: string) => {
    try {
      // Stop listening immediately before playing audio to prevent feedback
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
      
      setIsSpeaking(true);
      setIsProcessingAudio(true);
      
      // Construct full audio URL with backend base URL
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const fullAudioUrl = audioUrl.startsWith('http') ? audioUrl : `${backendUrl}${audioUrl}`;
      
      console.log('🔊 Playing TTS audio from:', fullAudioUrl);
      const audio = new Audio(fullAudioUrl);
      
      audio.onloadstart = () => {
        console.log('🔊 Starting TTS audio playback');
      };
      
      audio.onended = () => {
        console.log('✅ TTS audio playback ended');
        setIsSpeaking(false);
        setIsProcessingAudio(false);
        setLastSpeechEndTime(Date.now()); // Track when TTS audio ends
        // Longer delay before restarting listening to prevent feedback
        if (isActive) {
          setTimeout(() => {            
            if (isActive && !isSpeaking && !isProcessingAudio) {
              console.log('🎤 Restarting listening after TTS playback');
              startListening();
            }
          }, 4000); // Increased to 4 seconds for better feedback prevention
        }
      };
      
      audio.onerror = (e) => {
        console.error('❌ Error playing TTS audio:', e);
        setIsSpeaking(false);
        setIsProcessingAudio(false);
        setLastSpeechEndTime(Date.now());
        // Auto-restart listening on error too
        if (isActive) {
          setTimeout(() => {
            if (isActive && !isSpeaking && !isProcessingAudio) {
              startListening();
            }
          }, 3000); // Increased delay
        }
      };
      
      await audio.play();
    } catch (error) {
      console.error('❌ Error playing TTS audio:', error);
      setIsSpeaking(false);
      setIsProcessingAudio(false);
      setLastSpeechEndTime(Date.now());
      // Auto-restart listening on error
      if (isActive) {
        setTimeout(() => {
          if (isActive && !isSpeaking && !isProcessingAudio) {
            startListening();
          }
        }, 3000); // Increased delay
      }
    }
  };const handleUserMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);    try {
      // Always use audio endpoint for Bark TTS
      const response = await fetch('/api/voice/conversation-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },body: JSON.stringify({
          sessionId: sessionId, // Use the same session ID throughout conversation
          userInput: text,
          language: selectedLanguage
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }      const result = await response.json();
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        text: result.data?.response || result.response || 'Sorry, I couldn\'t process your request.',
        timestamp: new Date()
      };
        setMessages(prev => [...prev, agentMessage]);        // Use HuggingFace TTS if available, otherwise fallback to browser TTS
      if (result.data?.audioUrl) {
        playTTSAudio(result.data.audioUrl);
      } else {
        // Fallback to browser TTS when HuggingFace TTS fails
        console.warn('No HuggingFace TTS audio available, falling back to browser TTS');
        speakText(agentMessage.text);
      }
        } catch (error) {
      console.error('Error calling backend API:', error);
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        text: selectedLanguage === 'hi' 
          ? 'क्षमा करें, मुझे आपकी बात समझने में समस्या हुई। कृपया फिर से कोशिश करें।'
          : 'Sorry, I had trouble understanding. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
        // Try to get TTS audio for fallback message too
      try {
        const fallbackResponse = await fetch('/api/voice/conversation-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: sessionId,
            userInput: fallbackMessage.text,
            language: selectedLanguage
          })
        });
        
        if (fallbackResponse.ok) {
          const fallbackResult = await fallbackResponse.json();
          if (fallbackResult.data?.audioUrl) {
            playTTSAudio(fallbackResult.data.audioUrl);
            return;
          }
        }
      } catch (fallbackError) {
        console.warn('Fallback TTS also failed:', fallbackError);
      }
      
      // Only use browser TTS as last resort
      speakText(fallbackMessage.text);
    }
  };
  const quickResponses = selectedLanguage === 'hi' ? [
    "नमस्ते, आपकी सेवाएं क्या हैं?",
    "शादी की फोटोग्राफी के लिए कीमत क्या है?",
    "आप कब खुले रहते हैं?",
    "मैं अपॉइंटमेंट बुक करना चाहता हूं"
  ] : [
    "Hello, what services do you offer?",
    "What's the price for wedding photography?",
    "What are your working hours?", 
    "I'd like to book an appointment"
  ];
  return (
    <div className="bg-card border border-border p-6 h-full flex flex-col" style={{ borderRadius: 'var(--radius)' }}>      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Interactive Voice Demo
          </h3>
          <p className="text-sm text-muted-foreground">
            Experience our AI voice agent with speech recognition
          </p>
        </div>        <div className="flex items-center space-x-2 bg-secondary/50 px-2 py-1 rounded">
          <IconLanguage className="w-3 h-3 text-primary" />
          <span className="text-xs font-medium text-foreground">
            {selectedLanguage.toUpperCase()}
          </span>
          <span className="ml-2 px-2 py-1 text-xs rounded bg-primary text-primary-foreground">
            AI Voice
          </span>
        </div>
      </div>

      {!isActive ? (
        <div className="flex-1 flex flex-col justify-center text-center">
          <button
            onClick={startCall}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 font-medium transition-colors inline-flex items-center justify-center space-x-2 mb-3"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <IconPhone className="w-4 h-4" />
            <span>{t.startCall}</span>
          </button>
          <p className="text-xs text-muted-foreground">
            {selectedLanguage === 'hi' ? 'युवा डिजिटल स्टूडियो को कॉल करने के लिए क्लिक करें' :
             'Click to simulate calling Yuva Digital Studio'}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20" style={{ borderRadius: 'var(--radius)' }}>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                {selectedLanguage === 'hi' ? 'युवा डिजिटल स्टूडियो से जुड़े' :
                 'Connected to Yuva Digital Studio'}
              </span>
            </div>
            <button
              onClick={endCall}
              className="bg-red-500 hover:bg-red-600 text-white p-2 transition-colors"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <IconPhoneOff className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 max-h-48 overflow-y-auto space-y-3 p-3 bg-secondary/30" style={{ borderRadius: 'var(--radius)' }}>
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 text-sm ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {message.type === 'agent' && <IconVolume className="w-3 h-3" />}
                      <span className="text-xs font-medium">
                        {message.type === 'user' ? 'You' : 'AI Agent'}
                      </span>
                      {message.type === 'agent' && isSpeaking && (
                        <IconLoader className="w-3 h-3 animate-spin" />
                      )}
                    </div>
                    <p>{message.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex flex-col space-y-3">
            <div className="flex justify-center">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isSpeaking}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : isSpeaking
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {isListening ? (
                  <IconMicrophone className="w-6 h-6" />
                ) : isSpeaking ? (
                  <IconMicrophoneOff className="w-6 h-6" />
                ) : (
                  <IconMicrophone className="w-6 h-6" />
                )}
              </button>
            </div>
              <p className="text-xs text-center text-muted-foreground">
              {isListening ? 'Listening...' : isSpeaking ? 'AI is speaking...' : 'Speak anytime'}
            </p>

            {transcript && (
              <div className="p-2 bg-secondary/50 text-sm text-center" style={{ borderRadius: 'var(--radius)' }}>
                <span className="text-muted-foreground">You said: </span>
                <span className="text-foreground">"{transcript}"</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2">
              <p className="text-xs text-muted-foreground text-center mb-2">Quick responses:</p>
              {quickResponses.slice(currentStep, currentStep + 1).map((response, index) => (
                <button
                  key={index}
                  onClick={() => handleUserMessage(response)}
                  disabled={isSpeaking}
                  className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 transition-colors disabled:opacity-50"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  "{response}"
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
