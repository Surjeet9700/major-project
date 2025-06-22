"use client";

import { motion } from "framer-motion";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import { IconCamera, IconUsers, IconHeart, IconBusinessPlan } from "@tabler/icons-react";

export default function ServicesShowcase() {
  const services = [
    {
      category: "Wedding Photography",
      title: "Capture Your Perfect Day",
      src: "/api/placeholder/400/300",
      content: (
        <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
          <div className="flex items-center mb-6">
            <IconHeart className="w-8 h-8 text-red-500 mr-3" />
            <h3 className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
              Wedding Photography
            </h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto mb-6">
            Book your wedding photography through our AI voice agent. Simply call and describe your vision, 
            preferred style, and wedding details. Our AI understands your needs and matches you with the perfect photographer.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-neutral-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Weddings Captured</div>
            </div>
            <div className="bg-white dark:bg-neutral-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">4.9★</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Average Rating</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg">
            <p className="text-sm font-medium">💬 "Schedule my wedding shoot for June 15th, outdoor ceremony style"</p>
            <p className="text-xs mt-2 opacity-80">← Just speak naturally to our AI agent</p>
          </div>
        </div>
      )
    },
    {
      category: "Portrait Photography",
      title: "Professional Portraits Made Easy",
      src: "/api/placeholder/400/300",
      content: (
        <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
          <div className="flex items-center mb-6">
            <IconUsers className="w-8 h-8 text-blue-500 mr-3" />
            <h3 className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
              Portrait Photography
            </h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto mb-6">
            From professional headshots to family portraits, our AI agent handles all your booking needs. 
            Specify your requirements, and we'll find the perfect photographer and time slot.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-neutral-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">1000+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Portraits Taken</div>
            </div>
            <div className="bg-white dark:bg-neutral-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">24h</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Booking Availability</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-lg">
            <p className="text-sm font-medium">💬 "I need professional headshots for LinkedIn this week"</p>
            <p className="text-xs mt-2 opacity-80">← AI finds available photographers instantly</p>
          </div>
        </div>
      )
    },
    {
      category: "Event Photography",
      title: "Capture Every Moment",
      src: "/api/placeholder/400/300",
      content: (
        <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
          <div className="flex items-center mb-6">
            <IconCamera className="w-8 h-8 text-green-500 mr-3" />
            <h3 className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
              Event Photography
            </h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto mb-6">
            Corporate events, parties, or special occasions - our AI agent understands your event needs 
            and coordinates with photographers who specialize in your type of event.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-neutral-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">200+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Events Covered</div>
            </div>
            <div className="bg-white dark:bg-neutral-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">48h</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Fast Delivery</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 rounded-lg">
            <p className="text-sm font-medium">💬 "Book photographer for company holiday party December 20th"</p>
            <p className="text-xs mt-2 opacity-80">← AI handles all event coordination</p>
          </div>
        </div>
      )
    },
    {
      category: "Commercial Photography",
      title: "Professional Business Solutions",
      src: "/api/placeholder/400/300",
      content: (
        <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
          <div className="flex items-center mb-6">
            <IconBusinessPlan className="w-8 h-8 text-orange-500 mr-3" />
            <h3 className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
              Commercial Photography
            </h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto mb-6">
            Product photography, marketing materials, and brand imagery. Our AI agent understands commercial 
            requirements and connects you with photographers experienced in your industry.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-neutral-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">150+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Brand Projects</div>
            </div>
            <div className="bg-white dark:bg-neutral-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">98%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Client Satisfaction</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 rounded-lg">
            <p className="text-sm font-medium">💬 "Need product photos for our new clothing line launch"</p>
            <p className="text-xs mt-2 opacity-80">← AI matches you with specialists</p>
          </div>
        </div>
      )
    }
  ];

  const cards = services.map((service, index) => (
    <Card key={index} card={service} index={index} />
  ));

  return (
    <section className="relative py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 py-2">
              <IconCamera className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Professional Services</span>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            AI-Powered Photography Services
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Discover our comprehensive photography services, all bookable through our revolutionary AI voice agent. 
            Simply call and describe what you need - our AI handles the rest.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Carousel items={cards} />
        </motion.div>

        {/* Service Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">2000+</div>
            <div className="text-gray-300">Projects Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">4.9★</div>
            <div className="text-gray-300">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">24/7</div>
            <div className="text-gray-300">AI Availability</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">30s</div>
            <div className="text-gray-300">Avg Booking Time</div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Book Your Photography Session?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Experience the simplest way to book professional photography. Just call our AI agent and describe your needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
              >
                Book via AI Voice Agent
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-gray-600 px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/25"
              >
                View Portfolio
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
