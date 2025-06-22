"use client";
import React from "react";
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "./ui/hero-highlight";
import { Sparkles } from "./ui/sparkles";
import { BackgroundBeams } from "./ui/background-beams";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Phone, Play, Mic, Brain, Camera, Star } from "lucide-react";

export const AIHeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <BackgroundBeams />
      <Sparkles
        id="tsparticles"
        className="absolute inset-0"
        particleColor="#8b5cf6"
        particleSize={1}
        minSize={0.4}
        maxSize={1.4}
        speed={0.4}
        particleDensity={50}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center"
          >
            <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 px-4 py-2 text-lg">
              <Brain className="h-4 w-4 mr-2" />
              World's First AI Voice Photography Assistant
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <HeroHighlight className="text-5xl md:text-7xl lg:text-8xl font-bold">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Capture Moments
              </div>
              <div className="text-white">
                With <Highlight className="text-black">AI Intelligence</Highlight>
              </div>
            </div>
          </HeroHighlight>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
          >
            Experience the future of photography with our revolutionary AI voice agent. 
            Book sessions, track orders, and get instant support through natural conversation.
            <span className="block mt-4 text-purple-300 font-semibold">
              Simply speak, and we'll handle the rest.
            </span>
          </motion.p>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto my-12"
          >
            {[
              { icon: Mic, title: "Voice Booking", desc: "Book sessions with just your voice" },
              { icon: Brain, title: "AI Assistant", desc: "24/7 intelligent customer support" },
              { icon: Camera, title: "Pro Photography", desc: "Award-winning photography services" },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.2, duration: 0.6 }}
                className="group relative p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <feature.icon className="h-8 w-8 text-purple-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none px-8 py-4 text-lg font-semibold group"
            >
              <Phone className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Try AI Voice Booking
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-purple-400/50 text-purple-300 hover:bg-purple-500/10 px-8 py-4 text-lg group"
            >
              <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto mt-16"
          >
            {[
              { number: "10K+", label: "Happy Clients" },
              { number: "98%", label: "Voice Accuracy" },
              { number: "24/7", label: "AI Support" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + index * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-400 mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 text-purple-400/20">
        <Star className="h-8 w-8 animate-pulse" />
      </div>
      <div className="absolute top-40 right-20 text-pink-400/20">
        <Camera className="h-6 w-6 animate-bounce" />
      </div>
      <div className="absolute bottom-20 left-20 text-cyan-400/20">
        <Mic className="h-10 w-10 animate-pulse" />
      </div>
    </div>
  );
};
