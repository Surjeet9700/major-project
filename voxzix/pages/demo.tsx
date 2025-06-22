import Head from 'next/head';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ModernNavigation } from '@/components/modern-navigation';
import Footer from '@/components/footer';
import RequestCallForm from '@/components/request-call-form';
import VoiceCallInterface from '@/components/voice-call-interface';
import { 
  IconCamera, 
  IconCalendar, 
  IconPhone, 
  IconMail,
  IconMapPin,
  IconStar,
  IconUsers,
  IconClock,
  IconArrowLeft,
  IconMicrophone,
  IconVolume,
  IconDevices,
  IconLanguage,
  IconWorld
} from '@tabler/icons-react';
import Link from 'next/link';

const translations = {
  en: {
    title: "Photography Studio with AI Voice Agent",
    subtitle: "Experience how our AI voice agent handles real customer interactions for a photography business. See intelligent booking, pricing discussions, and seamless customer service automation.",
    backHome: "Back to Home",
    businessDemo: "Business Demo",
    experienceAgent: "Experience Our AI Voice Agent",
    experienceSubtitle: "Choose between a simulated demo or request a real call to experience our AI voice agent in action",
    interactiveSimulation: "Interactive Simulation",
    realCallDemo: "Real Call Demo",
    getRealDemo: "Get a Real Demo Call",
    getRealDemoDesc: "Our AI voice agent will call you and demonstrate real conversation capabilities with Twilio integration.",
    requestDemoCall: "Request Demo Call",
    businessName: "Yuva Digital Studio",
    businessLocation: "Hyderabad, Telangana",
    businessDescription: "Professional photography studio specializing in weddings, portraits, and events. Our AI voice agent handles all customer inquiries, bookings, and scheduling in Hindi and English, allowing us to focus on creating beautiful memories for our clients.",
    servicesAndPricing: "Services & Pricing",
    readyToTransform: "Ready to Transform Your Business?",
    transformSubtitle: "See how an AI voice agent can handle customer service, bookings, and inquiries for your business.",
    getStartedToday: "Get Started Today",
    freeTag: "FREE",
    liveTag: "LIVE",
    features: {
      browserSpeech: "Uses browser speech recognition and text-to-speech",
      simulatedFlow: "Simulated conversation flow",
      noCost: "No cost, instant experience",
      realTwilio: "Real Twilio voice call", 
      actualAI: "Actual AI conversation processing",
      fullDemo: "Full feature demonstration"
    },
    services: {
      wedding: {
        name: "Wedding Photography",
        price: "₹35,000 - ₹1,25,000",
        duration: "6-12 hours",
        features: ["Full day coverage", "Online gallery", "Professional editing", "Drone coverage"]
      },
      portrait: {
        name: "Portrait Sessions", 
        price: "₹2,500 - ₹4,500",
        duration: "1-2 hours",
        features: ["Professional lighting", "Multiple outfit changes", "Retouched images", "Print options"]
      },
      event: {
        name: "Event Photography",
        price: "₹5,000 - ₹8,500", 
        duration: "3-5 hours",
        features: ["Event coverage", "Candid shots", "Group photos", "Quick turnaround"]
      }
    }
  },
  hi: {
    title: "AI वॉइस एजेंट के साथ फोटोग्राफी स्टूडियो",
    subtitle: "देखें कि हमारा AI वॉइस एजेंट फोटोग्राफी बिजनेस के लिए वास्तविक ग्राहक संपर्क कैसे संभालता है। बुद्धिमान बुकिंग, मूल्य चर्चा, और निर्बाध ग्राहक सेवा स्वचालन देखें।",
    backHome: "होम पर वापस",
    businessDemo: "बिजनेस डेमो",
    experienceAgent: "हमारे AI वॉइस एजेंट का अनुभव करें",
    experienceSubtitle: "हमारे AI वॉइस एजेंट को क्रिया में देखने के लिए सिमुलेटेड डेमो या वास्तविक कॉल के बीच चुनें",
    interactiveSimulation: "इंटरैक्टिव सिमुलेशन",
    realCallDemo: "वास्तविक कॉल डेमो",
    getRealDemo: "वास्तविक डेमो कॉल प्राप्त करें",
    getRealDemoDesc: "हमारा AI वॉइस एजेंट आपको कॉल करेगा और Twilio एकीकरण के साथ वास्तविक बातचीत क्षमताओं का प्रदर्शन करेगा।",
    requestDemoCall: "डेमो कॉल का अनुरोध करें",
    businessName: "युवा डिजिटल स्टूडियो",
    businessLocation: "हैदराबाद, तेलंगाना",
    businessDescription: "शादी, पोर्ट्रेट और इवेंट्स में विशेषज्ञता वाला पेशेवर फोटोग्राफी स्टूडियो। हमारा AI वॉइस एजेंट हिंदी और अंग्रेजी में सभी ग्राहक पूछताछ, बुकिंग और शेड्यूलिंग संभालता है।",
    servicesAndPricing: "सेवाएं और मूल्य निर्धारण",
    readyToTransform: "अपने व्यापार को बदलने के लिए तैयार हैं?",
    transformSubtitle: "देखें कि AI वॉइस एजेंट आपके व्यापार के लिए ग्राहक सेवा, बुकिंग और पूछताछ कैसे संभाल सकता है।",
    getStartedToday: "आज ही शुरू करें",
    freeTag: "मुफ्त",
    liveTag: "लाइव",
    features: {
      browserSpeech: "ब्राउज़र स्पीच रिकग्निशन और टेक्स्ट-टू-स्पीच का उपयोग",
      simulatedFlow: "सिमुलेटेड वार्तालाप प्रवाह",
      noCost: "कोई लागत नहीं, तत्काल अनुभव",
      realTwilio: "वास्तविक Twilio वॉइस कॉल",
      actualAI: "वास्तविक AI वार्तालाप प्रसंस्करण",
      fullDemo: "पूर्ण सुविधा प्रदर्शन"
    },
    services: {
      wedding: {
        name: "शादी की फोटोग्राफी",
        price: "₹35,000 - ₹1,25,000", 
        duration: "6-12 घंटे",
        features: ["पूरे दिन की कवरेज", "ऑनलाइन गैलरी", "पेशेवर संपादन", "ड्रोन कवरेज"]
      },
      portrait: {
        name: "पोर्ट्रेट सेशन",
        price: "₹2,500 - ₹4,500",
        duration: "1-2 घंटे", 
        features: ["पेशेवर लाइटिंग", "कई आउटफिट चेंज", "रिटच की गई तस्वीरें", "प्रिंट विकल्प"]
      },
      event: {
        name: "इवेंट फोटोग्राफी",
        price: "₹5,000 - ₹8,500",
        duration: "3-5 घंटे",
        features: ["इवेंट कवरेज", "कैंडिड शॉट्स", "ग्रुप फोटो", "त्वरित टर्नअराउंड"]
      }
    }
  }
};

export default function BusinessDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');

  const t = translations[selectedLanguage];
  const services = Object.values(t.services);

  return (
    <>      <Head>
        <title>{selectedLanguage === 'hi' ? 'बिजनेस डेमो - VoxBiz AI वॉइस एजेंट | फोटोग्राफी स्टूडियो उदाहरण' : 'Business Demo - VoxBiz AI Voice Agent | Photography Studio Example'}</title>
        <meta name="description" content={selectedLanguage === 'hi' ? 'देखें कि VoxBiz AI वॉइस एजेंट फोटोग्राफी स्टूडियो के लिए वास्तविक ग्राहक बातचीत कैसे संभालता है।' : 'See how VoxBiz AI voice agent handles real customer interactions for a photography studio. Experience intelligent booking, pricing, and customer service automation.'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>      <div className="min-h-screen bg-background">
        <ModernNavigation />
        
        {/* Header */}
        <section className="pt-24 pb-12 bg-background">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <IconArrowLeft className="w-4 h-4" />
                <span>{t.backHome}</span>
              </Link>              {/* Language Selector */}
              <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm border border-border rounded-lg px-4 py-2">
                <IconLanguage className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Language:</span>
                <div className="flex items-center bg-background/80 rounded-md p-1 border">
                  {(['en', 'hi'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-sm ${
                        selectedLanguage === lang
                          ? 'bg-primary text-primary-foreground shadow-md transform scale-105'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }`}
                    >
                      {lang === 'en' ? 'EN' : 'हि'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
              <div className="text-center mb-16">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="inline-flex items-center px-3 py-1 bg-secondary text-secondary-foreground text-sm" style={{ borderRadius: 'var(--radius)' }}>
                  <IconCamera className="w-3 h-3 mr-2" />
                  {t.businessDemo}
                </div>                <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm" style={{ borderRadius: 'var(--radius)' }}>
                  <IconLanguage className="w-3 h-3 mr-2" />
                  {selectedLanguage === 'hi' ? 'हिन्दी' : 'English'}
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {t.title}
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t.subtitle}
              </p>
            </div>
          </div>
        </section>        {/* Live Demo Section */}
        <section className="py-16 bg-background">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {t.experienceAgent}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t.experienceSubtitle}
              </p>
            </div>            <div className="grid md:grid-cols-2 gap-8">
              {/* Simulated Demo */}
              <div className="flex">
                <div className="bg-card border border-border p-6 w-full flex flex-col min-h-[600px]" style={{ borderRadius: 'var(--radius)' }}>
                  <div className="flex items-center space-x-2 mb-4">
                    <IconDevices className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-medium text-foreground">
                      {t.interactiveSimulation}
                    </h3>
                    <span className="bg-green-500/10 text-green-600 text-xs px-2 py-1" style={{ borderRadius: 'var(--radius)' }}>
                      {t.freeTag}
                    </span>
                  </div>                  
                  <div className="flex-1 mb-4">
                    <VoiceCallInterface language={selectedLanguage} />
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border">
                    <p>• {t.features.browserSpeech}</p>
                    <p>• {t.features.simulatedFlow}</p>
                    <p>• {t.features.noCost}</p>
                  </div>
                </div>
              </div>

              {/* Real Call Demo */}
              <div className="flex">
                <div className="bg-card border border-border p-6 w-full flex flex-col min-h-[600px]" style={{ borderRadius: 'var(--radius)' }}>
                  <div className="flex items-center space-x-2 mb-4">
                    <IconPhone className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-medium text-foreground">
                      {t.realCallDemo}
                    </h3>
                    <span className="bg-blue-500/10 text-blue-600 text-xs px-2 py-1" style={{ borderRadius: 'var(--radius)' }}>
                      {t.liveTag}
                    </span>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto" style={{ borderRadius: 'var(--radius)' }}>
                        <IconPhone className="w-8 h-8 text-primary" />
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-foreground mb-2">
                          {t.getRealDemo}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-6">
                          {t.getRealDemoDesc}
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => setShowRequestForm(true)}
                        className="bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90 transition-opacity w-full inline-flex items-center justify-center space-x-2" 
                        style={{ borderRadius: 'var(--radius)' }}
                      >
                        <IconPhone className="w-4 h-4" />
                        <span>{t.requestDemoCall}</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border">
                    <p>• {t.features.realTwilio}</p>
                    <p>• {t.features.actualAI}</p>
                    <p>• {t.features.fullDemo}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>        {/* Sample Business Info */}
        <section className="py-16 bg-secondary/30">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Business Info */}
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  {t.businessName}
                </h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <IconMapPin className="w-4 h-4" />
                    <span>{t.businessLocation}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <IconPhone className="w-4 h-4" />
                    <span>+91-9876543210</span>
                  </div>
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <IconMail className="w-4 h-4" />
                    <span>info@yuvadigitalstudio.com</span>
                  </div>
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <IconStar className="w-4 h-4" />
                    <span>4.9/5 rating • 200+ reviews</span>
                  </div>
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <IconWorld className="w-4 h-4" />                    
                    <span>
                      {selectedLanguage === 'hi' ? 'हिंदी, अंग्रेजी' : 'Hindi, English'}
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  {t.businessDescription}
                </p>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  {t.servicesAndPricing}
                </h3>
                
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={index} className="bg-card border border-border p-4" style={{ borderRadius: 'var(--radius)' }}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-foreground">{service.name}</h4>
                        <span className="text-sm text-primary font-medium">{service.price}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                        <IconClock className="w-3 h-3" />
                        <span>{service.duration}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {service.features.map((feature, idx) => (
                          <span key={idx} className="text-xs bg-secondary text-secondary-foreground px-2 py-1" style={{ borderRadius: 'var(--radius)' }}>
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>        {/* CTA Section */}
        <section className="py-16 bg-background">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t.readyToTransform}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t.transformSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setShowRequestForm(true)}
                className="bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90 transition-opacity inline-flex items-center space-x-2" 
                style={{ borderRadius: 'var(--radius)' }}
              >
                <IconPhone className="w-4 h-4" />
                <span>{t.requestDemoCall}</span>
              </button>
              <Link href="/#contact">
                <button className="bg-secondary text-secondary-foreground px-6 py-3 font-medium hover:opacity-90 transition-opacity" style={{ borderRadius: 'var(--radius)' }}>
                  {t.getStartedToday}
                </button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>      {showRequestForm && (
        <RequestCallForm 
          onClose={() => setShowRequestForm(false)} 
          language={selectedLanguage} 
        />
      )}
    </>
  );
}
