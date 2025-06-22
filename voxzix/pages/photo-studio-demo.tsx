import Head from 'next/head';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IconCamera, 
  IconCalendar, 
  IconPhone, 
  IconMail,
  IconMapPin,
  IconStar,
  IconUsers,
  IconClock,
  IconPalette
} from '@tabler/icons-react';

export default function PhotoStudioDemo() {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    {
      id: 1,
      name: "Wedding Photography",
      price: "$2,500 - $5,000",
      duration: "8-10 hours",
      description: "Complete wedding day coverage with professional editing and online gallery",
      image: "/api/placeholder/400/300",
      features: ["Engagement session", "Full day coverage", "Online gallery", "Professional editing"]
    },
    {
      id: 2,
      name: "Portrait Sessions",
      price: "$350 - $650",
      duration: "1-2 hours",
      description: "Professional portraits for individuals, families, or corporate headshots",
      image: "/api/placeholder/400/300",
      features: ["Professional lighting", "Multiple outfit changes", "Retouched images", "Print options"]
    },
    {
      id: 3,
      name: "Event Photography",
      price: "$800 - $1,500",
      duration: "4-6 hours",
      description: "Corporate events, parties, and special occasions",
      image: "/api/placeholder/400/300",
      features: ["Event coverage", "Candid shots", "Group photos", "Quick turnaround"]
    }
  ];

  const portfolioImages = [
    { id: 1, category: "Wedding", src: "/api/placeholder/300/400" },
    { id: 2, category: "Portrait", src: "/api/placeholder/300/400" },
    { id: 3, category: "Event", src: "/api/placeholder/300/400" },
    { id: 4, category: "Wedding", src: "/api/placeholder/300/400" },
    { id: 5, category: "Portrait", src: "/api/placeholder/300/400" },
    { id: 6, category: "Event", src: "/api/placeholder/300/400" }
  ];

  return (
    <>
      <Head>
        <title>Yuva Digital Studio - Professional Photography | AI Voice Booking</title>
        <meta name="description" content="Professional photography studio with AI voice booking. Call and book your session in seconds!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-cyan-900/20" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="flex items-center justify-center mb-6">
                <IconCamera className="w-12 h-12 text-purple-400 mr-4" />
                <h1 className="text-4xl md:text-6xl font-bold">
                  <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Yuva Digital Studio
                  </span>
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Professional Photography with Revolutionary AI Voice Booking
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <a
                  href="tel:+1234567890"
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-cyan-600 px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                >
                  <div className="relative flex items-center space-x-2">
                    <IconPhone className="w-5 h-5" />
                    <span>Call Now: (555) 123-4567</span>
                  </div>
                </a>
                
                <button className="group relative overflow-hidden border-2 border-gray-600 px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300 hover:border-purple-500">
                  <div className="relative flex items-center space-x-2">
                    <IconMail className="w-5 h-5" />
                    <span>Email Us</span>
                  </div>
                </button>
              </div>

              <div className="inline-flex items-center px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                <span className="text-sm text-green-300">AI Voice Agent Available 24/7</span>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Services Section */}
        <section className="py-20 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Professional photography services tailored to capture your most precious moments
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-black/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="h-48 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 flex items-center justify-center">
                    <IconCamera className="w-16 h-16 text-purple-400" />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                    <p className="text-gray-300 mb-4">{service.description}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-purple-400 font-semibold">{service.price}</span>
                      <span className="text-sm text-gray-400 flex items-center">
                        <IconClock className="w-4 h-4 mr-1" />
                        {service.duration}
                      </span>
                    </div>
                    
                    <ul className="space-y-1 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-center">
                          <IconStar className="w-3 h-3 text-purple-400 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                      Book Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Portfolio</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                See our recent work and the moments we've helped capture
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative group overflow-hidden rounded-lg aspect-[3/4]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-cyan-600/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconPalette className="w-12 h-12 text-white/50" />
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-black/50 px-3 py-1 rounded-full text-sm">{image.category}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h2>
              <p className="text-xl text-gray-300">
                Ready to book your session? Our AI voice agent is standing by!
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <IconPhone className="w-6 h-6 text-purple-400" />
                  <div>
                    <h3 className="font-semibold">Call Our AI Agent</h3>
                    <p className="text-gray-300">(555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <IconMail className="w-6 h-6 text-purple-400" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-gray-300">hello@yuvadigital.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <IconMapPin className="w-6 h-6 text-purple-400" />
                  <div>
                    <h3 className="font-semibold">Studio Location</h3>
                    <p className="text-gray-300">123 Creative Street, Photo City, PC 12345</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Quick Book via Voice</h3>
                <p className="text-gray-300 mb-6">
                  Simply call and say: "I'd like to book a portrait session for next Saturday"
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-800/50 rounded">
                    <span className="text-sm">Available Hours</span>
                    <span className="text-sm text-purple-400">9 AM - 6 PM</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-800/50 rounded">
                    <span className="text-sm">Response Time</span>
                    <span className="text-sm text-purple-400">Instant</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-800/50 rounded">
                    <span className="text-sm">Languages</span>
                    <span className="text-sm text-purple-400">English, Spanish</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <IconCamera className="w-6 h-6 text-purple-400" />
                <span className="text-lg font-bold">Yuva Digital Studio</span>
              </div>
              <div className="text-sm text-gray-400">
                © 2024 Yuva Digital Studio. Powered by VoxBiz AI Voice Agent.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
