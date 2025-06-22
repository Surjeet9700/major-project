"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { IconPhone, IconLoader } from "@tabler/icons-react";

interface RequestCallFormProps {
  onClose: () => void;
  language?: 'en' | 'hi' | 'te';
}

export default function RequestCallForm({ onClose, language = 'en' }: RequestCallFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.startsWith("1")) {
      return `+${cleaned}`;
    }
    return cleaned.length >= 10 ? `+1${cleaned}` : `+1${cleaned}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const response = await fetch('/api/request-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },        body: JSON.stringify({
          phoneNumber: formattedPhone,
          language: language
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to request call');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div className="bg-card border border-border p-8 max-w-md w-full text-center" style={{ borderRadius: 'var(--radius)' }}>
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconPhone className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Call Request Sent!
          </h3>
          <p className="text-muted-foreground mb-6">
            Our AI voice agent will call you shortly. Please keep your phone ready.
          </p>
          <button
            onClick={onClose}
            className="bg-primary text-primary-foreground px-6 py-2 font-medium hover:opacity-90 transition-opacity w-full"
            style={{ borderRadius: 'var(--radius)' }}
          >
            Close
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border p-8 max-w-md w-full" style={{ borderRadius: 'var(--radius)' }}>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Request a Demo Call
          </h3>
          <p className="text-muted-foreground">
            Enter your phone number and our AI voice agent will call you to demonstrate its capabilities.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3 py-2 bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              style={{ borderRadius: 'var(--radius)' }}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 p-3" style={{ borderRadius: 'var(--radius)' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border text-foreground hover:bg-secondary transition-colors"
              style={{ borderRadius: 'var(--radius)' }}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 font-medium hover:opacity-90 transition-opacity inline-flex items-center justify-center space-x-2"
              style={{ borderRadius: 'var(--radius)' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <IconLoader className="w-4 h-4 animate-spin" />
                  <span>Calling...</span>
                </>
              ) : (
                <>
                  <IconPhone className="w-4 h-4" />
                  <span>Request Call</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            By requesting a call, you agree to receive a demonstration call from our AI voice agent. Standard call rates may apply.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
