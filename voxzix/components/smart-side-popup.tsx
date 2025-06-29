import React, { useEffect, useState } from 'react';
import { IconX, IconCamera, IconStar, IconClock, IconCheck, IconArrowRight } from '@tabler/icons-react';

interface Service {
  name: string;
  price: string;
  duration: string;
  features: string[];
  image?: string;
}

interface PricingInfo {
  service: string;
  range: string;
  features: string[];
}

interface BookingForm {
  fields: string[];
  completed: string[];
}

interface VisualData {
  type: 'services_display' | 'pricing_display' | 'booking_form' | 'booking_confirmation' | 'promotion' | 'faq' | 'dynamic_offer';
  services?: Service[];
  pricing?: Record<string, PricingInfo>;
  bookingForm?: BookingForm;
  bookingId?: string;
  promotion?: { title: string; description: string; image?: string; cta?: string };
  faq?: { question: string; answer: string }[];
  offer?: { title: string; details: string; expiresAt?: string };
}

interface SmartSidePopupProps {
  visualData: VisualData | null;
  isVisible: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
}

const translations = {
  en: {
    services: 'Our Services',
    pricing: 'Pricing Information',
    booking: 'Booking Progress',
    confirmation: 'Booking Confirmed',
    features: 'Features',
    duration: 'Duration',
    price: 'Price',
    bookNow: 'Book Now',
    learnMore: 'Learn More',
    close: 'Close',
    completed: 'Completed',
    pending: 'Pending',
    bookingId: 'Booking ID',
    paymentLink: 'Payment Link',
    calendarInvite: 'Calendar Invite'
  },
  hi: {
    services: 'हमारी सेवाएं',
    pricing: 'मूल्य जानकारी',
    booking: 'बुकिंग प्रगति',
    confirmation: 'बुकिंग कन्फर्म',
    features: 'विशेषताएं',
    duration: 'अवधि',
    price: 'मूल्य',
    bookNow: 'अभी बुक करें',
    learnMore: 'और जानें',
    close: 'बंद करें',
    completed: 'पूर्ण',
    pending: 'लंबित',
    bookingId: 'बुकिंग आईडी',
    paymentLink: 'भुगतान लिंक',
    calendarInvite: 'कैलेंडर इनवाइट'
  }
};

export default function SmartSidePopup({ visualData, isVisible, onClose, language }: SmartSidePopupProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const t = translations[language];

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible || !visualData) return null;

  const renderServicesDisplay = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <IconCamera className="w-5 h-5 text-primary" />
        {t.services}
      </h3>
      <div className="space-y-3">
        {visualData.services?.map((service, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-foreground">{service.name}</h4>
              <span className="text-primary font-bold text-sm">{service.price}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <IconClock className="w-4 h-4" />
              <span>{service.duration}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {service.features?.slice(0, 2).map((feature, idx) => (
                <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPricingDisplay = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <IconStar className="w-5 h-5 text-primary" />
        {t.pricing}
      </h3>
      <div className="space-y-3">
        {visualData.pricing && Object.entries(visualData.pricing).map(([service, info]) => (
          <div key={service} className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-medium text-foreground capitalize mb-2">{service} Photography</h4>
            <div className="text-primary font-bold text-lg mb-2">{info.range}</div>
            <div className="space-y-1">
              {info.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconCheck className="w-3 h-3 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBookingForm = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <IconCheck className="w-5 h-5 text-primary" />
        {t.booking}
      </h3>
      <div className="space-y-3">
        {visualData.bookingForm?.fields.map((field) => {
          const isCompleted = visualData.bookingForm?.completed.includes(field);
          return (
            <div key={field} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {isCompleted ? (
                  <IconCheck className="w-4 h-4" />
                ) : (
                  <span className="text-xs">{field.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className={`text-sm ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </span>
              {isCompleted && (
                <span className="text-xs text-green-500 ml-auto">{t.completed}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderBookingConfirmation = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <IconCheck className="w-5 h-5 text-green-500" />
        {t.confirmation}
      </h3>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <IconCheck className="w-6 h-6 text-white" />
          </div>
          <p className="text-green-800 font-medium">{t.confirmation}</p>
        </div>
        {visualData.bookingId && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t.bookingId}</p>
            <p className="font-mono text-lg font-bold text-foreground">{visualData.bookingId}</p>
          </div>
        )}
        <div className="mt-4 space-y-2">
          <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            {t.paymentLink}
          </button>
          <button className="w-full bg-secondary text-secondary-foreground py-2 px-4 rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors">
            {t.calendarInvite}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPromotion = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <IconStar className="w-5 h-5 text-yellow-500" />
        Promotion
      </h3>
      {visualData.promotion && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="font-bold text-lg mb-2">{visualData.promotion.title}</div>
          <div className="text-sm text-muted-foreground mb-2">{visualData.promotion.description}</div>
          {visualData.promotion.cta && (
            <button className="mt-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              {visualData.promotion.cta}
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderFAQ = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <IconStar className="w-5 h-5 text-primary" />
        FAQ
      </h3>
      <div className="space-y-2">
        {visualData.faq?.map((item, idx) => (
          <div key={idx} className="bg-muted border border-border rounded-lg p-3">
            <div className="font-medium text-foreground mb-1">Q: {item.question}</div>
            <div className="text-sm text-muted-foreground">A: {item.answer}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDynamicOffer = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <IconStar className="w-5 h-5 text-green-500" />
        Special Offer
      </h3>
      {visualData.offer && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="font-bold text-lg mb-2">{visualData.offer.title}</div>
          <div className="text-sm text-muted-foreground mb-2">{visualData.offer.details}</div>
          {visualData.offer.expiresAt && (
            <div className="text-xs text-green-700">Expires: {visualData.offer.expiresAt}</div>
          )}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (visualData.type) {
      case 'services_display':
        return renderServicesDisplay();
      case 'pricing_display':
        return renderPricingDisplay();
      case 'booking_form':
        return renderBookingForm();
      case 'booking_confirmation':
        return renderBookingConfirmation();
      case 'promotion':
        return renderPromotion();
      case 'faq':
        return renderFAQ();
      case 'dynamic_offer':
        return renderDynamicOffer();
      default:
        return null;
    }
  };

  return (
    <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 transition-all duration-500 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`bg-background border border-border rounded-xl shadow-2xl w-80 max-h-96 overflow-hidden ${
        isAnimating ? 'scale-105' : 'scale-100'
      } transition-transform duration-300`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-foreground">Live Assistant</span>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-80 overflow-y-auto">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="bg-muted/50 p-3 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>AI Assistant</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span>Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 