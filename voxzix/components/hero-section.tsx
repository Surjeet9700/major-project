"use client";

import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { Sparkles } from "@/components/ui/sparkles";
import { IconMicrophone, IconSparkles, IconRobot } from "@tabler/icons-react";

export default function HeroSection() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <BackgroundBeams />
      <div className="absolute inset-0 bg-black/50 z-10" />
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center mb-6"
        >
          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-3">
            <IconSparkles className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">World's First AI Voice Agent for Photography</span>
          </div>
        </motion.div>

        <HeroHighlight>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Professional Photography
            <br />
            Meets{" "}
            <Highlight className="text-white bg-gradient-to-r from-purple-600 to-cyan-600">
              AI Innovation
            </Highlight>
          </motion.h1>
        </HeroHighlight>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          Experience the future of photography booking with our revolutionary AI voice agent. 
          Simply speak to book appointments, track orders, and get instant support - no apps, no forms, just conversation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <button className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-cyan-600 px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center space-x-2">
              <IconMicrophone className="w-5 h-5" />
              <span>Try Voice Agent Now</span>
            </div>
          </button>

          <button className="group relative overflow-hidden border-2 border-gray-600 px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/25">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center space-x-2">
              <IconRobot className="w-5 h-5" />
              <span>Watch Demo</span>
            </div>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="text-2xl font-bold text-purple-400 mb-2">24/7</div>
            <div className="text-gray-300">AI Voice Support</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="text-2xl font-bold text-cyan-400 mb-2">95%</div>
            <div className="text-gray-300">Booking Accuracy</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="text-2xl font-bold text-purple-400 mb-2">30s</div>
            <div className="text-gray-300">Average Booking Time</div>
          </div>
        </motion.div>
      </div>

      <Sparkles 
        id="tsparticles"
        background="transparent"
        minSize={0.6}
        maxSize={1.4}
        particleDensity={100}
        className="w-full h-full absolute inset-0 z-10"
        particleColor="#8B5CF6"
      />
    </div>
  );
}
