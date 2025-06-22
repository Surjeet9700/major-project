"use client";

import { motion } from "framer-motion";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { IconStar, IconQuote } from "@tabler/icons-react";

export default function TestimonialsSection() {  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Restaurant Owner",
      image: "/api/placeholder/80/80",
      rating: 5,
      text: "VoxBiz AI agent transformed our reservation system. We went from missing 30% of calls to capturing every single inquiry. Revenue increased 40% in just 3 months. Our customers love how easy it is to book tables.",
      highlight: "40% revenue increase in 3 months"
    },
    {
      name: "Michael Chen",
      role: "CEO, TechStart Inc.",
      image: "/api/placeholder/80/80",
      rating: 5,
      text: "As a fast-growing startup, we needed 24/7 customer support but couldn't afford a full team. VoxBiz AI handles 90% of our inquiries perfectly, letting our team focus on product development. Game-changer for scaling businesses.",
      highlight: "Handles 90% of inquiries automatically"
    },
    {
      name: "Dr. Emma Rodriguez",
      role: "Medical Practice Owner",
      image: "/api/placeholder/80/80",
      rating: 5,
      text: "Patient appointment scheduling used to take 3 staff members and countless phone tags. Now our AI agent handles complex scheduling, insurance verification, and follow-ups. We've reduced admin costs by 60%.",
      highlight: "60% reduction in admin costs"
    },
    {
      name: "David Thompson",
      role: "Real Estate Broker",
      image: "/api/placeholder/80/80",
      rating: 5,
      text: "I never miss a lead anymore. The AI agent qualifies prospects, schedules viewings, and even handles basic property questions while I'm with other clients. My conversion rate doubled because every call gets immediate attention.",
      highlight: "Doubled conversion rate"
    },
    {
      name: "Lisa Park",
      role: "E-commerce Director",
      image: "/api/placeholder/80/80",
      rating: 5,
      text: "Customer service was our biggest expense. VoxBiz AI handles order tracking, returns, and product questions flawlessly. We cut support costs by 75% while improving customer satisfaction scores.",
      highlight: "75% cost reduction with better satisfaction"
    },
    {
      name: "James Wilson",
      role: "Father of 3",
      image: "/api/placeholder/80/80",
      rating: 5,
      text: "Trying to coordinate family photos with three kids' schedules seemed impossible. The AI agent found a photographer who could work around our chaotic schedule and even suggested the best times based on our kids' ages. Mind-blowing service!",
      highlight: "AI optimized scheduling for family dynamics"
    }
  ];

  return (
    <section className="relative py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border border-yellow-500/30 rounded-full px-4 py-2">
              <IconStar className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">Customer Reviews</span>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            What Our Customers Say
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Don't just take our word for it. Here's what real customers say about their experience 
            with our AI voice agent and photography services.
          </p>

          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">4.9★</div>
              <div className="text-gray-300">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">2,500+</div>
              <div className="text-gray-300">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">95%</div>
              <div className="text-gray-300">Rebooking Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">30s</div>
              <div className="text-gray-300">Avg Call Duration</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <CardSpotlight className="h-full">
                <div className="relative z-20 h-full flex flex-col">
                  {/* Quote Icon */}
                  <div className="mb-6">
                    <IconQuote className="w-8 h-8 text-purple-400" />
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-gray-300 leading-relaxed mb-6 flex-grow">
                    "{testimonial.text}"
                  </blockquote>

                  {/* Highlight */}
                  <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-lg p-3 mb-6">
                    <p className="text-sm font-medium text-purple-300">
                      ✨ {testimonial.highlight}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <IconStar
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>

                  {/* Author */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </CardSpotlight>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Trusted by Thousands of Customers
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join the photography revolution. Experience booking that's as simple as having a conversation.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
              >
                Experience AI Booking Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-gray-600 px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300 hover:border-purple-500"
              >
                Read More Reviews
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}