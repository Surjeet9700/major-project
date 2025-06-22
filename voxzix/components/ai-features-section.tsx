"use client";

import { motion } from "framer-motion";
import { 
  IconMicrophone, 
  IconCalendar, 
  IconMessageChatbot, 
  IconBrain, 
  IconLanguage, 
  IconClock 
} from "@tabler/icons-react";

export default function AIFeaturesSection() {
  const features = [
    {
      icon: <IconMicrophone className="w-6 h-6 text-primary" />,
      title: "Voice-First Booking",
      description: "Simply call and speak naturally. Our AI understands context, preferences, and scheduling needs instantly."
    },
    {
      icon: <IconBrain className="w-6 h-6 text-primary" />,
      title: "Smart AI Understanding",
      description: "Advanced NLP processes complex requests like 'I need a family shoot next weekend, outdoor if weather permits.'"
    },
    {
      icon: <IconCalendar className="w-6 h-6 text-primary" />,
      title: "Intelligent Scheduling",
      description: "AI automatically finds optimal time slots based on your preferences, photographer availability, and location."
    },
    {
      icon: <IconMessageChatbot className="w-6 h-6 text-primary" />,
      title: "Contextual Conversations",
      description: "Remembers your history, preferences, and ongoing projects for personalized interactions every time."
    },
    {
      icon: <IconLanguage className="w-6 h-6 text-primary" />,
      title: "Multi-Language Support",
      description: "Communicate in your preferred language. Our AI supports 50+ languages with cultural nuances."
    },
    {
      icon: <IconClock className="w-6 h-6 text-primary" />,
      title: "Real-Time Updates",
      description: "Instant notifications about booking confirmations, photographer updates, and schedule changes via voice."
    }
  ];

  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 bg-secondary text-secondary-foreground text-sm mb-6" style={{ borderRadius: 'var(--radius)' }}>
            <IconBrain className="w-3 h-3 mr-2" />
            AI Features
          </div>
          
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Intelligent Voice Technology
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Experience the future of customer interaction with AI that understands, remembers, and responds naturally to your business needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border p-6 hover:shadow-md transition-shadow"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <div className="mb-4">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-4" style={{ borderRadius: 'var(--radius)' }}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
