"use client";

import { motion } from "framer-motion";
import { IconMicrophone, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

export default function VoiceAgentDemo() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="mb-16">
          <div className="inline-flex items-center px-3 py-1 bg-secondary text-secondary-foreground text-sm mb-6" style={{ borderRadius: 'var(--radius)' }}>
            <IconMicrophone className="w-3 h-3 mr-2" />
            Interactive Demo
          </div>
          
          <h2 className="text-3xl font-semibold text-foreground mb-4">
            Experience AI Voice Intelligence
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            See how our AI voice agent handles real customer conversations with intelligence and professionalism.
          </p>
        </div>
        
        <div className="bg-card border border-border p-8 mb-8" style={{ borderRadius: 'var(--radius)' }}>
          <div className="mb-8">
            <div className="w-20 h-20 bg-primary flex items-center justify-center mx-auto mb-6" style={{ borderRadius: 'var(--radius)' }}>
              <IconMicrophone className="w-8 h-8 text-primary-foreground" />
            </div>
            
            <h3 className="text-lg font-medium text-foreground mb-3">
              Photography Studio Demo
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Watch our AI handle customer inquiries, bookings, and pricing discussions for a photography business.
            </p>
            
            <Link href="/demo">
              <button className="bg-primary text-primary-foreground px-8 py-3 text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center space-x-2" style={{ borderRadius: 'var(--radius)' }}>
                <span>Try Live Demo</span>
                <IconArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
        
        <div className="bg-secondary/50 p-6" style={{ borderRadius: 'var(--radius)' }}>
          <h3 className="text-lg font-medium text-foreground mb-3">
            Ready to Experience It Yourself?
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Call our AI voice agent and experience intelligent conversation firsthand.
          </p>
          <div className="text-lg font-mono text-foreground">
            +1 (555) VOXBIZ-AI
          </div>
        </div>
      </div>
    </section>
  );
}
