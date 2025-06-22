"use client";

import { motion } from "framer-motion";
import { 
  IconBusinessplan, 
  IconPhone, 
  IconClock, 
  IconTrendingUp,
  IconUsers,
  IconRobot
} from "@tabler/icons-react";

export default function BusinessBenefits() {
  const benefits = [
    {
      icon: <IconBusinessplan className="w-6 h-6 text-primary" />,
      title: "Reduce Operating Costs",
      description: "Cut customer service costs by up to 70% while improving response quality and availability.",
      stats: "70% Cost Reduction"
    },
    {
      icon: <IconClock className="w-6 h-6 text-primary" />,
      title: "24/7 Availability",
      description: "Never miss a customer inquiry. Your AI agent works around the clock, across all time zones.",
      stats: "100% Uptime"
    },
    {
      icon: <IconTrendingUp className="w-6 h-6 text-primary" />,
      title: "Increase Conversions",
      description: "AI agents convert 3x better than traditional forms by providing instant, personalized responses.",
      stats: "3x Higher Conversion"
    },
    {
      icon: <IconUsers className="w-6 h-6 text-primary" />,
      title: "Scale Customer Support",
      description: "Handle unlimited concurrent conversations without hiring additional staff or training overhead.",
      stats: "Unlimited Scale"
    },
    {
      icon: <IconRobot className="w-6 h-6 text-primary" />,
      title: "Human-Like Conversations",
      description: "Advanced AI understands context, emotions, and complex requests just like your best employees.",
      stats: "95% Natural Feel"
    },
    {
      icon: <IconPhone className="w-6 h-6 text-primary" />,
      title: "Instant Response Time",
      description: "Customers get immediate answers to their questions, improving satisfaction and reducing bounce rates.",
      stats: "Under 1 Second"
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 bg-secondary text-secondary-foreground text-sm mb-6" style={{ borderRadius: 'var(--radius)' }}>
            <IconBusinessplan className="w-3 h-3 mr-2" />
            Business Benefits
          </div>
          
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Transform Your Business Operations
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            See measurable improvements in cost reduction, customer satisfaction, and operational efficiency from day one.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
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
                  {benefit.icon}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  <span className="text-sm font-medium text-primary">
                    {benefit.stats}
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
