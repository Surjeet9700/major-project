export const languageDetector = {
  detect(text: string): 'hi' | 'en' {
    const hindiPattern = /[\u0900-\u097F]/;
    const englishPattern = /^[a-zA-Z\s0-9.,!?'"()-]+$/;
    
    if (hindiPattern.test(text)) {
      return 'hi';
    }
    
    if (englishPattern.test(text.trim())) {
      return 'en';
    }
    
    const hindiKeywords = [
      'नमस्ते', 'धन्यवाद', 'कृपया', 'हाँ', 'नहीं', 'मदद', 'समय', 'दिन', 'महीना',
      'साल', 'पैसा', 'रुपये', 'कितना', 'कब', 'कहाँ', 'क्यों', 'कैसे', 'क्या'
    ];
    
    const englishKeywords = [
      'hello', 'thank', 'please', 'yes', 'no', 'help', 'time', 'day', 'month',
      'year', 'money', 'rupees', 'how', 'when', 'where', 'why', 'what', 'appointment'
    ];
    
    const lowerText = text.toLowerCase();
    
    const hindiMatches = hindiKeywords.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    ).length;
    
    const englishMatches = englishKeywords.filter(keyword => 
      lowerText.includes(keyword)
    ).length;
    
    return hindiMatches > englishMatches ? 'hi' : 'en';
  },

  isHindi(text: string): boolean {
    return this.detect(text) === 'hi';
  },

  isEnglish(text: string): boolean {
    return this.detect(text) === 'en';
  }
};

export const messages = {
  hi: {
    welcome: 'नमस्ते! VoxBiz में आपका स्वागत है। मैं आपकी सहायता के लिए यहाँ हूँ।',
    languageSelect: 'कृपया अपनी भाषा चुनें। हिंदी के लिए 1 दबाएं या अंग्रेजी के लिए 2 दबाएं।',
    mainMenu: 'मैं आपकी कैसे मदद कर सकता हूँ? आप अपॉइंटमेंट बुक कर सकते हैं, ऑर्डर ट्रैक कर सकते हैं, या कीमतों के बारे में पूछ सकते हैं।',
    notUnderstood: 'माफ करें, मैं समझ नहीं पाया। कृपया दोबारा कहें।',
    goodbye: 'धन्यवाद! VoxBiz चुनने के लिए आपका शुक्रिया। अच्छा दिन हो!',
    booking: {
      start: 'मैं आपके लिए अपॉइंटमेंट बुक करूंगा। आपका नाम क्या है?',
      getName: 'कृपया अपना पूरा नाम बताएं।',
      getService: 'आप किस सेवा के लिए अपॉइंटमेंट चाहते हैं?',
      getDate: 'आप कौन सी तारीख पसंद करेंगे?',
      confirm: 'आपका अपॉइंटमेंट बुक हो गया है। आपको जल्द ही एक कन्फर्मेशन कॉल आएगी।'
    },
    tracking: {
      start: 'मैं आपके ऑर्डर की जानकारी देता हूँ। कृपया अपना ऑर्डर नंबर बताएं।',
      notFound: 'माफ करें, यह ऑर्डर नंबर नहीं मिला। कृपया दोबारा जांच करें।',
      status: 'आपका ऑर्डर तैयार हो रहा है और जल्द ही डिलीवर होगा।'
    }
  },
  
  en: {
    welcome: 'Hello! Welcome to VoxBiz. I am here to assist you.',
    languageSelect: 'Please select your language. Press 1 for Hindi or 2 for English.',
    mainMenu: 'How may I help you today? You can book an appointment, track an order, or ask about pricing.',
    notUnderstood: 'Sorry, I did not understand that. Please try again.',
    goodbye: 'Thank you for choosing VoxBiz. Have a great day!',
    booking: {
      start: 'I will help you book an appointment. What is your name?',
      getName: 'Please tell me your full name.',
      getService: 'What service would you like to book an appointment for?',
      getDate: 'What date would you prefer?',
      confirm: 'Your appointment has been booked. You will receive a confirmation call shortly.'
    },
    tracking: {
      start: 'I will help you track your order. Please provide your order number.',
      notFound: 'Sorry, I could not find that order number. Please check and try again.',
      status: 'Your order is being prepared and will be delivered soon.'
    }
  }
};
