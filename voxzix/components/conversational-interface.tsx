"use client";

import { useState, useRef, useEffect } from 'react';
import { IconSend, IconBolt, IconUser, IconLanguage, IconLoader } from '@tabler/icons-react';

interface Message {
  id: string;
  type: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

const translations = {
  en: {
    placeholder: "Type your message here...",
    send: "Send",
    greeting: "Hello! Welcome to Yuva Digital Studio. How can I help you today?",
    language: "Language",
    typing: "AI is typing...",
    suggestions: [
      "What services do you offer?",
      "What are your wedding photography prices?",
      "What are your working hours?",
      "I want to book an appointment"
    ]
  },
  hi: {
    placeholder: "यहाँ अपना संदेश टाइप करें...",
    send: "भेजें",
    greeting: "नमस्ते! युवा डिजिटल स्टूडियो में आपका स्वागत है। आज मैं आपकी कैसे मदद कर सकता हूं?",
    language: "भाषा",
    typing: "AI टाइप कर रहा है...",
    suggestions: [
      "आपकी सेवाएं क्या हैं?",
      "शादी की फोटोग्राफी की कीमत क्या है?",
      "आप कब खुले रहते हैं?",
      "मैं अपॉइंटमेंट बुक करना चाहता हूं"
    ]
  }
};

interface ConversationalInterfaceProps {
  language?: 'en' | 'hi';
  className?: string;
}

export default function ConversationalInterface({ 
  language = 'en', 
  className = '' 
}: ConversationalInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>(language);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const t = translations[selectedLanguage];

  useEffect(() => {
    const newSessionId = 'chat-session-' + Date.now();
    setSessionId(newSessionId);
    
    const initialMessage: Message = {
      id: Date.now().toString(),
      type: 'agent',
      text: t.greeting,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [selectedLanguage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/business/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: messageText,
          language: selectedLanguage,
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        text: result.data?.response || result.response || 'Sorry, I couldn\'t process your request.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        text: selectedLanguage === 'hi' 
          ? 'क्षमा करें, कुछ तकनीकी समस्या है। कृपया फिर कोशिश करें।'
          : 'Sorry, there was a technical issue. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleLanguageChange = (newLanguage: 'en' | 'hi') => {
    setSelectedLanguage(newLanguage);
    setMessages([]);
    const newSessionId = 'chat-session-' + Date.now();
    setSessionId(newSessionId);
  };

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg flex flex-col h-[600px] ${className}`}>
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <IconBolt className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <IconLanguage className="w-4 h-4 text-gray-500" />
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'hi')}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[80%] ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {message.type === 'user' ? (
                  <IconUser className="w-4 h-4" />
                ) : (
                  <IconBolt className="w-4 h-4" />
                )}
              </div>
              
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <IconBolt className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <IconLoader className="w-4 h-4 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t.typing}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {t.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.placeholder}
            disabled={isLoading}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
          >
            <IconSend className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
