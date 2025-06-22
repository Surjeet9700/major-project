export interface BusinessConfig {
  name: string;
  type: string;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  contact: {
    phone: string[];
    email: string;
    website?: string;
    social?: {
      instagram?: string;
      facebook?: string;
      youtube?: string;
    };
  };
  workingHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  services: ServiceConfig[];
  pricing: {
    [serviceId: string]: {
      basePrice: number;
      currency: string;
      packages?: PackageConfig[];
    };
  };
  languages: {
    primary: string;
    supported: string[];
  };
  booking: {
    advanceBookingDays: number;
    slotDuration: number;
    bufferTime: number;
    cancelPolicy: string;
  };
  businessOwner?: {
    name: string;
    experience: string;
    specialization: string[];
    awards?: string[];
    about: string;
  };
  equipment?: {
    cameras: string[];
    lenses: string[];
    lighting: string[];
    accessories: string[];
  };
  specialFeatures?: string[];
}

export interface ServiceConfig {
  id: string;
  name: string;
  nameHi: string;
  description: string;
  descriptionHi: string;
  category: string;
  duration: number;
  isActive: boolean;
  requirements?: string[];
  keywords: string[];
  keywordsHi: string[];
}

export interface PackageConfig {
  id: string;
  name: string;
  nameHi: string;
  price: number;
  description: string;
  includes: string[];
  duration: number;
}

export const yuvaDigitalStudioConfig: BusinessConfig = {
  name: "Yuva Digital Studio",
  type: "Photography & Digital Services Studio",
  location: {
    address: "Shop No. 12, First Floor, Begum Bazaar Road, Hyderabad",
    city: "Hyderabad", 
    state: "Telangana",
    pincode: "500012",
    landmark: "Near Charminar, Opposite State Bank of India"
  },
  contact: {
    phone: ["+91-9876543210", "+91-8765432109"],
    email: "info@yuvadigitalstudio.com",
    website: "www.yuvadigitalstudio.com",
    social: {
      instagram: "@yuvadigitalstudio_hyd",
      facebook: "Yuva Digital Studio Hyderabad", 
      youtube: "Yuva Digital Studio Hyderabad"
    }
  },
  workingHours: {
    monday: { open: "09:30", close: "20:30", isOpen: true },
    tuesday: { open: "09:30", close: "20:30", isOpen: true },
    wednesday: { open: "09:30", close: "20:30", isOpen: true },
    thursday: { open: "09:30", close: "20:30", isOpen: true },
    friday: { open: "09:30", close: "20:30", isOpen: true },
    saturday: { open: "09:00", close: "21:00", isOpen: true },
    sunday: { open: "10:00", close: "19:00", isOpen: true }
  },  services: [
    {
      id: "wedding_photography",
      name: "Wedding Photography & Videography",
      nameHi: "शादी की फोटोग्राफी और वीडियोग्राफी",
      description: "Complete wedding photography and videography services including pre-wedding, ceremony, and reception",
      descriptionHi: "प्री-वेडिंग, सेरेमनी और रिसेप्शन सहित संपूर्ण शादी फोटोग्राफी और वीडियोग्राफी सेवाएं",
      category: "wedding",
      duration: 480,
      isActive: true,
      requirements: ["Advance booking required", "Venue details needed", "50% advance payment"],
      keywords: ["wedding", "marriage", "shaadi", "photography", "videography", "pre-wedding", "reception", "ceremony"],
      keywordsHi: ["शादी", "विवाह", "फोटो", "वीडियो", "फोटोग्राफी", "प्री-वेडिंग", "रिसेप्शन"]
    },
    {
      id: "portrait_session", 
      name: "Portrait & Family Photography",
      nameHi: "पोर्ट्रेट और पारिवारिक फोटोग्राफी",
      description: "Professional individual, couple, and family portrait sessions with studio or outdoor options",
      descriptionHi: "स्टूडियो या आउटडोर विकल्पों के साथ व्यावसायिक व्यक्तिगत, जोड़े और पारिवारिक पोर्ट्रेट सेशन",
      category: "portrait",
      duration: 90,
      isActive: true,
      keywords: ["portrait", "individual", "family", "couple", "professional", "headshot", "studio", "outdoor"],
      keywordsHi: ["पोर्ट्रेट", "व्यक्तिगत", "पारिवारिक", "जोड़े", "स्टूडियो", "आउटडोर"]
    },
    {
      id: "birthday_events",
      name: "Birthday & Event Photography",
      nameHi: "जन्मदिन और इवेंट फोटोग्राफी", 
      description: "Birthday parties, anniversaries, corporate events, and celebration photography",
      descriptionHi: "जन्मदिन पार्टी, सालगिरह, कॉर्पोरेट इवेंट और उत्सव फोटोग्राफी",
      category: "events",
      duration: 180,
      isActive: true,
      keywords: ["birthday", "party", "celebration", "anniversary", "corporate", "events", "cake cutting"],
      keywordsHi: ["जन्मदिन", "पार्टी", "सालगिरह", "कॉर्पोरेट", "इवेंट", "केक"]
    },
    {
      id: "product_commercial",
      name: "Product & Commercial Photography",
      nameHi: "प्रोडक्ट और कमर्शियल फोटोग्राफी",
      description: "Professional product photography for e-commerce, catalogs, and business marketing",
      descriptionHi: "ई-कॉमर्स, कैटलॉग और व्यापारिक मार्केटिंग के लिए व्यावसायिक उत्पाद फोटोग्राफी",
      category: "commercial",
      duration: 120,
      isActive: true,
      keywords: ["product", "business", "commercial", "catalog", "ecommerce", "marketing", "jewelry", "clothing"],
      keywordsHi: ["प्रोडक्ट", "व्यापार", "कैटलॉग", "ई-कॉमर्स", "मार्केटिंग", "ज्वेलरी"]
    },
    {
      id: "photo_printing_frames",
      name: "Photo Printing & Custom Frames",
      nameHi: "फोटो प्रिंटिंग और कस्टम फ्रेम",
      description: "High-quality photo printing, canvas prints, photo albums, and custom wooden/metal frames",
      descriptionHi: "उच्च गुणवत्ता फोटो प्रिंटिंग, कैनवास प्रिंट, फोटो एल्बम, और कस्टम लकड़ी/धातु फ्रेम",
      category: "printing",
      duration: 60,
      isActive: true,
      keywords: ["printing", "frames", "canvas", "album", "lamination", "wooden", "metal", "custom"],
      keywordsHi: ["प्रिंटिंग", "फ्रेम", "कैनवास", "एल्बम", "लकड़ी", "धातु", "कस्टम"]
    },
    {
      id: "passport_documents",
      name: "Passport & Document Photography", 
      nameHi: "पासपोर्ट और दस्तावेज़ फोटोग्राफी",
      description: "Official passport photos, visa photos, ID cards, and document photography as per government standards",
      descriptionHi: "सरकारी मानकों के अनुसार आधिकारिक पासपोर्ट फोटो, वीज़ा फोटो, आईडी कार्ड और दस्तावेज़ फोटोग्राफी",
      category: "documents",
      duration: 15,
      isActive: true,
      keywords: ["passport", "visa", "documents", "official", "id", "aadhar", "license", "government"],
      keywordsHi: ["पासपोर्ट", "वीज़ा", "दस्तावेज़", "आधिकारिक", "आधार", "लाइसेंस", "सरकारी"]
    },
    {
      id: "maternity_newborn",
      name: "Maternity & Newborn Photography",
      nameHi: "मैटर्निटी और नवजात फोटोग्राफी",
      description: "Beautiful maternity shoots and adorable newborn photography sessions",
      descriptionHi: "सुंदर मैटर्निटी शूट और प्यारे नवजात फोटोग्राफी सेशन",
      category: "lifestyle",
      duration: 120,
      isActive: true,
      keywords: ["maternity", "newborn", "baby", "pregnancy", "mother", "family"],
      keywordsHi: ["मैटर्निटी", "नवजात", "बच्चा", "गर्भावस्था", "माता", "पारिवारिक"]
    }
  ],
  pricing: {
    wedding_photography: {
      basePrice: 35000,
      currency: "INR",
      packages: [
        {
          id: "basic_wedding",
          name: "Basic Wedding Package",
          nameHi: "बेसिक शादी पैकेज",
          price: 35000,
          description: "6 hours coverage, 300 edited photos, basic videography",
          includes: ["6 hours photography", "300 edited photos", "Basic highlight video", "Online gallery", "50 printed photos"],
          duration: 360
        },
        {
          id: "premium_wedding", 
          name: "Premium Wedding Package",
          nameHi: "प्रीमियम शादी पैकेज",
          price: 65000,
          description: "10 hours coverage, 500 photos, cinematic video, drone shots",
          includes: ["10 hours photography", "500 edited photos", "Cinematic highlight video", "Drone coverage", "Online gallery", "USB drive", "100 printed photos"],
          duration: 600
        },
        {
          id: "luxury_wedding",
          name: "Luxury Wedding Package", 
          nameHi: "लक्जरी शादी पैकेज",
          price: 1.25000,
          description: "Complete 3-day coverage, unlimited photos, multiple videos",
          includes: ["3 days coverage", "Unlimited photos", "Multiple videos", "Drone coverage", "Same day editing", "Photo album", "Canvas prints", "Live streaming"],
          duration: 2160
        }
      ]
    },    portrait_session: {
      basePrice: 2500,
      currency: "INR",
      packages: [
        {
          id: "basic_portrait",
          name: "Basic Portrait Session",
          nameHi: "बेसिक पोर्ट्रेट सेशन",
          price: 2500,
          description: "1 hour studio session, 15 edited photos",
          includes: ["1 hour session", "15 edited photos", "Online gallery"],
          duration: 60
        },
        {
          id: "premium_portrait",
          name: "Premium Portrait Session", 
          nameHi: "प्रीमियम पोर्ट्रेट सेशन",
          price: 4500,
          description: "2 hours session, 30 photos, outdoor + studio",
          includes: ["2 hours session", "30 edited photos", "Studio + outdoor", "Printed photos", "Digital frames"],
          duration: 120
        }
      ]
    },
    birthday_events: {
      basePrice: 5000,
      currency: "INR",
      packages: [
        {
          id: "basic_birthday",
          name: "Basic Birthday Package",
          nameHi: "बेसिक जन्मदिन पैकेज",
          price: 5000,
          description: "3 hours coverage, 100 edited photos",
          includes: ["3 hours photography", "100 edited photos", "Cake cutting shots", "Online gallery"],
          duration: 180
        },
        {
          id: "premium_birthday",
          name: "Premium Birthday Package",
          nameHi: "प्रीमियम जन्मदिन पैकेज", 
          price: 8500,
          description: "5 hours coverage, 200 photos, videography",
          includes: ["5 hours photography", "200 edited photos", "Highlight video", "Decoration shots", "USB drive"],
          duration: 300
        }
      ]
    },
    product_commercial: {
      basePrice: 3000,
      currency: "INR",
      packages: [
        {
          id: "basic_product",
          name: "Basic Product Shoot",
          nameHi: "बेसिक प्रोडक्ट शूट",
          price: 3000,
          description: "Up to 20 products, white background",
          includes: ["20 products", "White background", "Basic editing", "High resolution"],
          duration: 120
        },
        {
          id: "premium_product",
          name: "Premium Product Shoot",
          nameHi: "प्रीमियम प्रोडक्ट शूट",
          price: 6500,
          description: "Up to 50 products, multiple backgrounds, lifestyle shots",
          includes: ["50 products", "Multiple backgrounds", "Lifestyle shots", "Advanced editing", "360° photos"],
          duration: 240
        }
      ]
    },
    photo_printing_frames: {
      basePrice: 50,
      currency: "INR",
      packages: [
        {
          id: "standard_printing",
          name: "Standard Photo Printing",
          nameHi: "स्टैंडर्ड फोटो प्रिंटिंग",
          price: 50,
          description: "Per photo printing (4x6 inch)",
          includes: ["High quality print", "Glossy/Matte finish", "Border options"],
          duration: 10
        },
        {
          id: "custom_frames",
          name: "Custom Photo Frames",
          nameHi: "कस्टम फोटो फ्रेम",
          price: 500,
          description: "Wooden/metal frames with custom designs",
          includes: ["Wooden/metal frame", "Custom design", "Glass protection", "Multiple sizes"],
          duration: 60
        }
      ]
    },
    passport_documents: {
      basePrice: 200,
      currency: "INR",
      packages: [
        {
          id: "passport_photos",
          name: "Passport Size Photos",
          nameHi: "पासपोर्ट साइज़ फोटो",
          price: 200,
          description: "8 copies of passport size photos",
          includes: ["8 copies", "Government standards", "Instant delivery", "Digital copies"],
          duration: 15
        },
        {
          id: "document_photos",
          name: "All Document Photos",
          nameHi: "सभी दस्तावेज़ फोटो",
          price: 350,
          description: "Multiple document size photos",
          includes: ["Multiple sizes", "16 total copies", "Government standards", "Digital & printed"],
          duration: 20
        }
      ]
    },
    maternity_newborn: {
      basePrice: 6000,
      currency: "INR",
      packages: [
        {
          id: "maternity_shoot",
          name: "Maternity Photography",
          nameHi: "मैटर्निटी फोटोग्राफी",
          price: 6000,
          description: "Beautiful maternity session with props",
          includes: ["2 hours session", "30 edited photos", "Props included", "Online gallery", "Printed photos"],
          duration: 120
        },
        {
          id: "newborn_shoot",
          name: "Newborn Photography",
          nameHi: "नवजात फोटोग्राफी", 
          price: 7500,
          description: "Safe newborn photography with family",
          includes: ["2 hours session", "25 edited photos", "Safe props", "Family shots", "Digital album"],
          duration: 120
        }
      ]
    }
  },
  languages: {
    primary: "hi",
    supported: ["hi", "en"]
  },
  booking: {
    advanceBookingDays: 30,
    slotDuration: 60,
    bufferTime: 15,
    cancelPolicy: "Free cancellation 24 hours before appointment. 50% refund for cancellations within 24 hours."
  },
  businessOwner: {
    name: "Rajesh Kumar Yuva",
    experience: "15+ years in photography",
    specialization: ["Wedding Photography", "Portrait Photography", "Commercial Photography"],
    awards: ["Best Wedding Photographer Hyderabad 2023", "Excellence in Portrait Photography 2022"],
    about: "Passionate photographer with over 15 years of experience capturing life's precious moments. Specialized in wedding and portrait photography with a unique artistic vision."
  },
  equipment: {
    cameras: ["Canon EOS R5", "Sony A7R IV", "Canon 5D Mark IV"],
    lenses: ["24-70mm f/2.8", "70-200mm f/2.8", "85mm f/1.4", "35mm f/1.4"],
    lighting: ["Professional studio lights", "LED panels", "Reflectors", "Softboxes"],
    accessories: ["Drone for aerial shots", "Gimbal stabilizer", "Professional tripods", "Wireless flash triggers"]
  },
  specialFeatures: [
    "Same day photo delivery for urgent requirements",
    "Free pre-wedding consultation",
    "Drone photography available",
    "Live photo sharing during events",
    "Custom photo albums and frames",
    "Digital photo restoration services",
    "Professional photo editing",
    "Multiple language support (Hindi, English)"
  ]
};

export const getBusinessConfig = (): BusinessConfig => {
  return yuvaDigitalStudioConfig;
};

export const getServiceByKeyword = (keyword: string, language: 'hi' | 'en' = 'en'): ServiceConfig | null => {
  const config = getBusinessConfig();
  const searchTerm = keyword.toLowerCase();
  
  return config.services.find(service => {
    if (!service.isActive) return false;
    
    const keywords = language === 'hi' ? service.keywordsHi : service.keywords;
    return keywords.some(k => k.toLowerCase().includes(searchTerm)) ||
           service.name.toLowerCase().includes(searchTerm) ||
           service.nameHi.includes(searchTerm);
  }) || null;
};

export const getWorkingHours = (day?: string): { isOpen: boolean; hours?: string } => {
  const config = getBusinessConfig();
  const today = day || new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const dayKey = today.toLowerCase();
  
  const workingDay = config.workingHours[dayKey];
  if (!workingDay || !workingDay.isOpen) {
    return { isOpen: false };
  }
  
  return {
    isOpen: true,
    hours: `${workingDay.open} - ${workingDay.close}`
  };
};

export const formatBusinessInfo = (language: 'hi' | 'en' = 'en'): string => {
  const config = getBusinessConfig();
  
  if (language === 'hi') {
    return `${config.name} - ${config.location.address}, ${config.location.city}। फोन: ${config.contact.phone[0]}। हमारी सेवाएं: ${config.services.filter(s => s.isActive).map(s => s.nameHi).join(', ')}।`;
  } else {
    return `${config.name} - ${config.location.address}, ${config.location.city}. Phone: ${config.contact.phone[0]}. Our services: ${config.services.filter(s => s.isActive).map(s => s.name).join(', ')}.`;
  }
};
