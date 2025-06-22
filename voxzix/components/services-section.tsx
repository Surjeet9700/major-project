'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  IconMicrophone,
  IconRobot,
  IconLanguage,
  IconClock,
  IconPhone,
  IconCalendar,
  IconBrain,
  IconShield,
  IconHeadphones,
  IconSpeakerphone
} from '@tabler/icons-react';

export default function ServicesSection() {
  const aiFeatures = [
    {
      icon: IconRobot,
      title: 'AI Voice Agent',
      description: 'Advanced AI that understands context, handles bookings, and provides information naturally.',
      features: ['Natural conversation', 'Context awareness', 'Smart responses', 'Learning capability'],
      gradient: 'from-emerald-500 to-teal-500',
      highlight: 'Core Technology'
    },
    {
      icon: IconLanguage,
      title: 'Bilingual Support',
      description: 'Seamlessly switches between Hindi and English based on customer preference.',
      features: ['Hindi fluency', 'English proficiency', 'Auto-detection', 'Cultural context'],
      gradient: 'from-cyan-500 to-blue-500',
      highlight: 'Language AI'
    },
    {
      icon: IconCalendar,
      title: 'Smart Booking',
      description: 'Intelligent scheduling with availability checking and automatic confirmations.',
      features: ['Real-time availability', 'Auto-confirmation', 'Conflict resolution', 'Reminders'],
      gradient: 'from-purple-500 to-indigo-500',
      highlight: 'Automation'
    },
    {
      icon: IconBrain,
      title: 'Learning AI',
      description: 'Continuously improves from interactions to provide better customer service.',
      features: ['Pattern recognition', 'Preference learning', 'Performance optimization', 'Custom responses'],
      gradient: 'from-pink-500 to-rose-500',
      highlight: 'Machine Learning'
    },
    {
      icon: IconShield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime and data protection.',
      features: ['Data encryption', 'GDPR compliant', '99.9% uptime', 'Backup systems'],
      gradient: 'from-orange-500 to-red-500',
      highlight: 'Security'
    },
    {
      icon: IconHeadphones,
      title: '24/7 Availability',
      description: 'Never miss a customer call with round-the-clock AI assistance.',
      features: ['Always available', 'No holidays', 'Instant response', 'Global timezone'],
      gradient: 'from-violet-500 to-purple-500',
      highlight: 'Reliability'
    }
  ];

  const photographyServices = [
    {
      title: 'Wedding Photography',
      description: 'Cinematic wedding coverage with AI-assisted booking',
      price: 'From ₹25,000',
      bookingFeature: 'AI handles all booking inquiries'
    },
    {
      title: 'Portrait Sessions',
      description: 'Professional portraits with smart scheduling',
      price: 'From ₹8,000',
      bookingFeature: 'Instant availability checking'
    },
    {
      title: 'Corporate Events',
      description: 'Business photography with automated coordination',
      price: 'From ₹15,000',
      bookingFeature: 'Multi-language client support'
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* AI Technology Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-6 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400 text-lg px-6 py-2">
            🤖 AI-Powered Technology
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Revolutionary
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
              Voice AI Technology
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Experience the future of customer service with our groundbreaking AI voice agent 
            that understands, learns, and delivers exceptional photography booking experiences.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-2xl transition-all duration-500 border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm hover:border-emerald-500/30 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                      {feature.highlight}
                    </Badge>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-300 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-3">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-slate-400">
                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mr-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Photography Services with AI Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 text-lg px-6 py-2">
            📸 Photography Services
          </Badge>
          <h3 className="text-3xl md:text-5xl font-bold text-white mb-4">
            AI-Enhanced
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Photography Booking
            </span>
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {photographyServices.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-2xl transition-all duration-300 border border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm hover:border-purple-500/30">
                <CardContent className="p-8 text-center">
                  <h4 className="text-2xl font-bold text-white mb-3">{service.title}</h4>
                  <p className="text-slate-300 mb-4">{service.description}</p>
                  <div className="text-3xl font-bold text-purple-400 mb-4">{service.price}</div>
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center justify-center text-purple-300 text-sm">
                      <IconMicrophone className="w-4 h-4 mr-2" />
                      {service.bookingFeature}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-r from-emerald-900/20 via-teal-900/20 to-cyan-900/20 rounded-3xl p-12 border border-emerald-500/20 backdrop-blur-sm"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Experience the Future Today
          </h3>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Be among the first to experience AI-powered photography booking. 
            Call now and let our voice agent handle everything!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <IconPhone className="mr-3 h-6 w-6" />
              Call AI Agent Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 px-12 py-6 text-xl font-bold rounded-full backdrop-blur-sm"
            >
              <IconSpeakerphone className="mr-3 h-6 w-6" />
              +91 83743 45298
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
