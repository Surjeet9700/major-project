"use client";

import { IconMicrophone, IconSparkles, IconRobot } from "@tabler/icons-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background pt-16">
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
            <IconSparkles className="w-3 h-3 mr-2" />
            Revolutionary AI Voice Agent for Business
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-6 leading-tight">
          Transform Your Business
          <br />
          with AI Voice Agents
        </h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Revolutionize customer service with our advanced AI voice agents. Handle inquiries, bookings, and support 24/7 with natural conversation that converts. 
          See our live photography studio demo below.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link href="/demo">
            <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
              <div className="flex items-center space-x-2">
                <IconMicrophone className="w-4 h-4" />
                <span>Try Live Demo</span>
              </div>
            </button>
          </Link>

          <Link href="#contact">
            <button className="border border-border text-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-secondary transition-colors">
              <div className="flex items-center space-x-2">
                <IconRobot className="w-4 h-4" />
                <span>Get Started</span>
              </div>
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-semibold text-foreground mb-1">24/7</div>
            <div className="text-sm text-muted-foreground">Always Available</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-semibold text-foreground mb-1">95%</div>
            <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-semibold text-foreground mb-1">30s</div>
            <div className="text-sm text-muted-foreground">Average Response Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
