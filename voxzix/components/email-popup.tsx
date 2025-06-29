"use client";

import { useState } from 'react';
import { IconMail, IconX, IconCheck } from '@tabler/icons-react';

interface EmailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailSubmit: (email: string) => void;
  language: 'en' | 'hi';
}

export default function EmailPopup({ isOpen, onClose, onEmailSubmit, language }: EmailPopupProps) {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translations = {
    en: {
      title: "Get Booking Confirmation",
      subtitle: "Enter your email to receive booking confirmation and updates",
      placeholder: "Enter your email address",
      submit: "Continue",
      cancel: "Skip",
      invalidEmail: "Please enter a valid email address",
      required: "Email is required to continue"
    },
    hi: {
      title: "बुकिंग कन्फर्मेशन प्राप्त करें",
      subtitle: "बुकिंग कन्फर्मेशन और अपडेट प्राप्त करने के लिए अपना ईमेल दर्ज करें",
      placeholder: "अपना ईमेल पता दर्ज करें",
      submit: "जारी रखें",
      cancel: "छोड़ें",
      invalidEmail: "कृपया एक वैध ईमेल पता दर्ज करें",
      required: "जारी रखने के लिए ईमेल आवश्यक है"
    }
  };

  const t = translations[language];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsValid(validateEmail(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      return;
    }

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onEmailSubmit(email);
      onClose();
    } catch (error) {
      console.error('Error submitting email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onEmailSubmit('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg shadow-lg max-w-md w-full p-6 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <IconMail className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {t.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <IconX className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <p className="text-sm text-muted-foreground mb-6">
          {t.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder={t.placeholder}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
            {email && !isValid && (
              <p className="text-xs text-destructive mt-1">
                {t.invalidEmail}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>...</span>
                </>
              ) : (
                <>
                  <IconCheck className="w-4 h-4" />
                  <span>{t.submit}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 