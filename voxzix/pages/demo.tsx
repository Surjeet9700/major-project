import Head from 'next/head';
import { useState } from 'react';
import { ModernNavigation } from '@/components/modern-navigation';
import Footer from '@/components/footer';
import RequestCallForm from '@/components/request-call-form';
import VoiceCallInterface from '@/components/voice-call-interface';
import {
  IconCamera,
  IconPhone,
  IconMail,
  IconMapPin,
  IconStar,
  IconClock,
  IconArrowLeft,
  IconDevices,
  IconLanguage,
  IconWorld,
  IconSparkles,
  IconCheck,
  IconUsers,
  IconAward,
  IconTrendingUp,
  IconBolt,
  IconHeadphones,
  IconMicrophone,
  IconBrain,
  IconGlobe
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
    },
    stats: {
      customers: "500+ Happy Customers",
      experience: "5+ Years Experience",
      rating: "4.9/5 Rating",
      languages: "Hindi & English"
    },
    benefits: {
      title: "Why Choose AI Voice Agent?",
      items: [
        {
          icon: IconBolt,
          title: "24/7 Availability",
          description: "Never miss a customer call, even outside business hours"
        },
        {
          icon: IconHeadphones,
          title: "Multilingual Support",
          description: "Handle customers in Hindi and English seamlessly"
        },
        {
          icon: IconBrain,
          title: "Intelligent Responses",
          description: "AI-powered conversations that understand context"
        },
        {
          icon: IconUsers,
          title: "Scalable Solution",
          description: "Handle multiple calls simultaneously without additional staff"
        }
      ]
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
    },
    stats: {
      customers: "500+ संतुष्ट ग्राहक",
      experience: "5+ वर्षों का अनुभव",
      rating: "4.9/5 रेटिंग",
      languages: "हिंदी और अंग्रेजी"
    },
    benefits: {
      title: "AI वॉइस एजेंट क्यों चुनें?",
      items: [
        {
          icon: IconBolt,
          title: "24/7 उपलब्धता",
          description: "व्यापारिक घंटों के बाहर भी कभी ग्राहक कॉल न छूटे"
        },
        {
          icon: IconHeadphones,
          title: "बहुभाषी समर्थन",
          description: "हिंदी और अंग्रेजी में ग्राहकों को निर्बाध रूप से संभालें"
        },
        {
          icon: IconBrain,
          title: "बुद्धिमान प्रतिक्रियाएं",
          description: "संदर्भ को समझने वाली AI-संचालित बातचीत"
        },
        {
          icon: IconUsers,
          title: "मापनीय समाधान",
          description: "अतिरिक्त स्टाफ के बिना एक साथ कई कॉल संभालें"
        }
      ]
    }
  }
};

export default function BusinessDemo() {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');

  const t = translations[selectedLanguage];
  const services = Object.values(t.services);

  return (
    <>
      <Head>
        <title>{selectedLanguage === 'hi' ? 'बिजनेस डेमो - VoxBiz AI वॉइस एजेंट | फोटोग्राफी स्टूडियो उदाहरण' : 'Business Demo - VoxBiz AI Voice Agent | Photography Studio Example'}</title>
        <meta name="description" content={selectedLanguage === 'hi' ? 'देखें कि VoxBiz AI वॉइस एजेंट फोटोग्राफी स्टूडियो के लिए वास्तविक ग्राहक बातचीत कैसे संभालता है।' : 'See how VoxBiz AI voice agent handles real customer interactions for a photography studio. Experience intelligent booking, pricing, and customer service automation.'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-background">
        <ModernNavigation />

        {/* Enhanced Header with Gradient Background */}
        <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full blur-xl"></div>
            <div className="absolute top-40 right-20 w-32 h-32 bg-secondary rounded-full blur-xl"></div>
            <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-accent rounded-full blur-xl"></div>
          </div>

          <div className="max-w-6xl mx-auto px-6 relative">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors group">
                <IconArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>{t.backHome}</span>
              </Link>
              
              {/* Enhanced Language Selector */}
              <div className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm border border-border rounded-xl px-4 py-2 shadow-lg">
                <IconLanguage className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Language:</span>
                <div className="flex items-center bg-background/80 rounded-lg p-1 border">
                  {(['en', 'hi'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-md ${
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
              {/* Enhanced Badges */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-sm font-medium rounded-full border border-primary/20 shadow-sm">
                  <IconCamera className="w-3 h-3 mr-2" />
                  {t.businessDemo}
                </div>
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-secondary/10 to-secondary/5 text-secondary-foreground text-sm font-medium rounded-full border border-secondary/20 shadow-sm">
                  <IconSparkles className="w-3 h-3 mr-2" />
                  {selectedLanguage === 'hi' ? 'हिन्दी' : 'English'}
                </div>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                {t.title}
              </h1>

              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                {t.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Enhanced Live Demo Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {t.experienceAgent}
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t.experienceSubtitle}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Enhanced Simulated Demo */}
              <div className="group">
                <div className="bg-gradient-to-br from-card to-card/50 border border-border p-8 w-full flex flex-col min-h-[700px] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconDevices className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {t.interactiveSimulation}
                      </h3>
                      <p className="text-sm text-muted-foreground">Try it now, completely free</p>
                    </div>
                    <span className="bg-green-500/10 text-green-600 text-xs px-3 py-1 rounded-full font-medium border border-green-500/20">
                      {t.freeTag}
                    </span>
                  </div>
                  
                  <div className="flex-1 mb-6">
                    <VoiceCallInterface language={selectedLanguage} />
                  </div>

                  <div className="text-sm text-muted-foreground space-y-2 pt-6 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <IconCheck className="w-4 h-4 text-green-500" />
                      <span>{t.features.browserSpeech}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IconCheck className="w-4 h-4 text-green-500" />
                      <span>{t.features.simulatedFlow}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IconCheck className="w-4 h-4 text-green-500" />
                      <span>{t.features.noCost}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Real Call Demo */}
              <div className="group">
                <div className="bg-gradient-to-br from-card to-card/50 border border-border p-8 w-full flex flex-col min-h-[700px] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <IconPhone className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {t.realCallDemo}
                      </h3>
                      <p className="text-sm text-muted-foreground">Experience real AI conversation</p>
                    </div>
                    <span className="bg-blue-500/10 text-blue-600 text-xs px-3 py-1 rounded-full font-medium border border-blue-500/20">
                      {t.liveTag}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mx-auto rounded-2xl border border-blue-500/20">
                        <IconPhone className="w-10 h-10 text-blue-500" />
                      </div>

                      <div>
                        <h4 className="text-xl font-semibold text-foreground mb-3">
                          {t.getRealDemo}
                        </h4>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                          {t.getRealDemoDesc}
                        </p>
                      </div>

                      <button
                        onClick={() => setShowRequestForm(true)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 w-full inline-flex items-center justify-center space-x-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <IconPhone className="w-5 h-5" />
                        <span>{t.requestDemoCall}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-2 pt-6 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <IconCheck className="w-4 h-4 text-blue-500" />
                      <span>{t.features.realTwilio}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IconCheck className="w-4 h-4 text-blue-500" />
                      <span>{t.features.actualAI}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IconCheck className="w-4 h-4 text-blue-500" />
                      <span>{t.features.fullDemo}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Business Info Section */}
        <section className="py-20 bg-gradient-to-br from-secondary/20 via-background to-primary/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Enhanced Business Info */}
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    {t.businessName}
                  </h2>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-card border border-border p-4 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconUsers className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t.stats.customers}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                          <IconAward className="w-5 h-5 text-secondary-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t.stats.experience}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <IconStar className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t.stats.rating}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <IconGlobe className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t.stats.languages}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

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
                </div>

                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t.businessDescription}
                </p>
              </div>

              {/* Enhanced Services */}
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-8">
                  {t.servicesAndPricing}
                </h3>

                <div className="space-y-6">
                  {services.map((service, index) => (
                    <div key={index} className="bg-card border border-border p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-foreground">{service.name}</h4>
                        <span className="text-lg text-primary font-bold">{service.price}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                        <IconClock className="w-4 h-4" />
                        <span>{service.duration}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {service.features.map((feature, idx) => (
                          <span key={idx} className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full font-medium">
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
        </section>

        {/* New Benefits Section */}
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                {t.benefits.title}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {t.benefits.items.map((benefit, index) => (
                <div key={index} className="bg-card border border-border p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                  <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-4 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {t.readyToTransform}
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t.transformSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => setShowRequestForm(true)}
                className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-8 py-4 font-semibold hover:from-primary/90 hover:to-primary transition-all duration-300 inline-flex items-center space-x-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <IconPhone className="w-5 h-5" />
                <span>{t.requestDemoCall}</span>
              </button>
              <Link href="/#contact">
                <button className="bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground px-8 py-4 font-semibold hover:from-secondary/90 hover:to-secondary transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105">
                  {t.getStartedToday}
                </button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {showRequestForm && (
        <RequestCallForm
          onClose={() => setShowRequestForm(false)}
          language={selectedLanguage}
        />
      )}
    </>
  );
}
