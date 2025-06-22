import { getBusinessConfig } from '../config/business';

interface Messages {
  welcome: string;
  mainMenu: string;
  notUnderstood: string;
  goodbye: string;
  businessInfo: string;
  workingHours: string;
  booking: {
    start: string;
    getName: string;
    getService: string;
    getDate: string;
    getTime: string;
    confirm: string;
    success: string;
    failed: string;
  };
  tracking: {
    start: string;
    getOrderId: string;
    status: string;
    notFound: string;
  };
  pricing: {
    inquiry: string;
    packages: string;
  };
}

const config = getBusinessConfig();

export const yuvaMessages: { en: Messages; hi: Messages } = {
  en: {
    welcome: `Hello! Welcome to ${config.name}.`,
    mainMenu: `How can I help you? Say book appointment, track order, get pricing, or goodbye.`,
    notUnderstood: 'Sorry, I did not understand. Please try again.',
    goodbye: `Thank you for calling ${config.name}. Have a great day!`,
    businessInfo: `${config.name} is located at ${config.location.address}, ${config.location.city}. You can reach us at ${config.contact.phone[0]}.`,
    workingHours: `We are open Monday to Sunday, ${config.workingHours.monday.open} to ${config.workingHours.monday.close} weekdays, ${config.workingHours.saturday.open} to ${config.workingHours.saturday.close} weekends.`,
    booking: {
      start: 'I can help you book a photography session. What service do you need?',
      getName: 'May I have your name please?',
      getService: 'Which service? Say wedding, portrait, birthday, product photography, or photo printing.',
      getDate: 'What date would you prefer?',      getTime: 'What time would you prefer?',
      confirm: 'Thank you! Your request is noted. Our team will call you back.',
      success: 'Your appointment is booked successfully!',
      failed: 'Sorry, booking failed. Please try calling again.'
    },    tracking: {
      start: 'Please tell me your order number to track your order.',
      getOrderId: 'Please provide your order number.',
      status: 'Your order is being processed and will be ready soon.',
      notFound: 'Order number not found. Please check and try again.'
    },
    pricing: {
      inquiry: 'Portrait sessions start from ₹2500, wedding photography from ₹25000. Visit our studio for details.',
      packages: 'Basic packages include digital photos, premium packages include albums and frames.'
    }
  },  hi: {
    welcome: `नमस्ते! ${config.name} में आपका स्वागत है।`,
    mainMenu: `मैं आपकी कैसे सहायता करूं? बुकिंग, ऑर्डर ट्रैक, कीमत, या अलविदा कहें।`,
    notUnderstood: 'माफ़ करें, समझ नहीं आया। फिर से कोशिश करें।',
    goodbye: `${config.name} को कॉल करने के लिए धन्यवाद। शुभ दिन!`,
    businessInfo: `${config.name} ${config.location.address}, ${config.location.city} में है। फोन ${config.contact.phone[0]}।`,
    workingHours: `हम सोमवार से रविवार खुले हैं। ${config.workingHours.monday.open} से ${config.workingHours.monday.close} सप्ताह में, ${config.workingHours.saturday.open} से ${config.workingHours.saturday.close} सप्ताहांत में।`,
    booking: {
      start: 'मैं फोटोग्राफी सेशन बुक करने में मदद करूंगा। कौन सी सेवा चाहिए?',
      getName: 'आपका नाम क्या है?',
      getService: 'कौन सी सेवा? शादी, पोर्ट्रेट, जन्मदिन, प्रोडक्ट फोटोग्राफी, या प्रिंटिंग?',
      getDate: 'कौन सी तारीख पसंद करेंगे?',      getTime: 'कितने बजे का समय चाहिए?',
      confirm: 'धन्यवाद! आपका अनुरोध नोट हो गया। हमारी टीम आपको कॉल करेगी।',
      success: 'आपका अपॉइंटमेंट बुक हो गया!',
      failed: 'माफ़ करें, बुकिंग नहीं हो सकी। फिर से कॉल करें।'
    },
    tracking: {
      start: 'ऑर्डर ट्रैक करने के लिए ऑर्डर नंबर बताएं।',
      getOrderId: 'ऑर्डर नंबर बताएं।',
      status: 'आपका ऑर्डर प्रोसेस हो रहा है और जल्दी तैयार होगा।',
      notFound: 'ऑर्डर नंबर नहीं मिला। फिर से चेक करें।'
    },
    pricing: {
      inquiry: 'पोर्ट्रेट सेशन ₹2500 से, शादी की फोटोग्राफी ₹25000 से शुरू। विस्तार के लिए स्टूडियो आएं।',
      packages: 'बेसिक पैकेज में डिजिटल फोटो, प्रीमियम में एल्बम और फ्रेम।'
    }
  }
};

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
      'साल', 'पैसा', 'रुपये', 'कितना', 'कब', 'कहाँ', 'क्यों', 'कैसे', 'क्या',
      'फोटो', 'शादी', 'पोर्ट्रेट', 'जन्मदिन', 'प्रिंटिंग', 'फ्रेम'
    ];
    
    const englishKeywords = [
      'hello', 'thank', 'please', 'yes', 'no', 'help', 'time', 'day', 'month',
      'year', 'money', 'rupees', 'how', 'when', 'where', 'why', 'what', 'appointment',
      'photo', 'photography', 'wedding', 'portrait', 'birthday', 'printing', 'frame'
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
