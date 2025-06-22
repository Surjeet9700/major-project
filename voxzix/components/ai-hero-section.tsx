'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MacbookScroll } from '@/components/ui/macbook-scroll';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { SparklesCore } from '@/components/ui/sparkles';
import { HeroHighlight, Highlight } from '@/components/ui/hero-highlight';
import { IconMicrophone, IconPhone, IconRobot, IconLanguage, IconClock, IconShield } from '@tabler/icons-react';

export default function AIHeroSection() {
  return (
    <div className="w-full">
      <HeroHighlight>
        <div className="overflow-hidden dark:bg-black bg-white w-full">
          {/* Hero Section with MacBook Scroll */}
          <MacbookScroll
            title={
              <div className="flex flex-col items-center space-y-8 pt-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center"
                >
                  <Badge className="mb-8 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400 text-lg px-6 py-2">
                    🚀 World's First AI Voice Agent for Photography
                  </Badge>
                  
                  <h1 className="text-4xl md:text-7xl font-bold text-center mb-8">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-500">
                      The Future of{' '}
                    </span>
                    <Highlight className="text-black dark:text-white">
                      AI-Powered Photography
                    </Highlight>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-neutral-300 max-w-4xl mx-auto mb-12 leading-relaxed">
                    Experience the world's first AI-powered voice agent that books photography sessions in{' '}
                    <span className="text-emerald-400 font-semibold">Hindi and English</span>. 
                    No more missed calls, no more scheduling hassles - just pure intelligence.
                  </p>
                  
                  <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16">
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 border-0"
                    >
                      <IconMicrophone className="mr-3 h-6 w-6" />
                      Try Voice Agent
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 px-12 py-6 text-xl font-bold rounded-full backdrop-blur-sm"
                    >
                      <IconPhone className="mr-3 h-6 w-6" />
                      Call +91 83743 45298
                    </Button>
                  </div>
                </motion.div>
              </div>
            }
            badge={
              <div className="h-full w-full bg-gradient-to-br from-emerald-900/20 via-teal-900/20 to-cyan-900/20 rounded-2xl border border-emerald-500/20 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="relative">
                    <SparklesCore
                      id="tsparticlesfullpage"
                      background="transparent"
                      minSize={0.6}
                      maxSize={1.4}
                      particleDensity={100}
                      className="w-full h-full absolute inset-0"
                      particleColor="#10B981"
                    />
                    <div className="relative z-10">
                      <IconRobot className="h-24 w-24 text-emerald-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2">AI Voice Agent</h3>
                      <p className="text-emerald-300 text-lg">Live Demo</p>
                      <div className="mt-4 flex justify-center space-x-2">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse delay-100"></div>
                        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
            src=""
            showGradient={false}
          />
          
          {/* Features Grid */}
          <div className="relative pb-20">
            <BackgroundBeams />
            <div className="relative z-10 max-w-7xl mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                <div className="group p-8 rounded-2xl bg-gradient-to-br from-emerald-950/50 via-teal-950/50 to-cyan-950/50 border border-emerald-500/20 backdrop-blur-sm hover:border-emerald-400/40 hover:bg-emerald-900/20 transition-all duration-300 transform hover:scale-105">
                  <IconClock className="h-12 w-12 text-emerald-400 mb-4 group-hover:text-emerald-300 transition-colors" />
                  <div className="text-4xl font-bold text-emerald-400 mb-2">24/7</div>
                  <div className="text-xl text-neutral-300 font-semibold">AI Voice Agent</div>
                  <div className="text-neutral-400 mt-2">Always available, never sleeps</div>
                </div>
                
                <div className="group p-8 rounded-2xl bg-gradient-to-br from-teal-950/50 via-cyan-950/50 to-blue-950/50 border border-teal-500/20 backdrop-blur-sm hover:border-teal-400/40 hover:bg-teal-900/20 transition-all duration-300 transform hover:scale-105">
                  <IconLanguage className="h-12 w-12 text-teal-400 mb-4 group-hover:text-teal-300 transition-colors" />
                  <div className="text-4xl font-bold text-teal-400 mb-2">2 Languages</div>
                  <div className="text-xl text-neutral-300 font-semibold">Hindi & English</div>
                  <div className="text-neutral-400 mt-2">Seamless bilingual support</div>
                </div>
                
                <div className="group p-8 rounded-2xl bg-gradient-to-br from-cyan-950/50 via-blue-950/50 to-indigo-950/50 border border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/40 hover:bg-cyan-900/20 transition-all duration-300 transform hover:scale-105">
                  <IconShield className="h-12 w-12 text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors" />
                  <div className="text-4xl font-bold text-cyan-400 mb-2">99.9%</div>
                  <div className="text-xl text-neutral-300 font-semibold">Accuracy</div>
                  <div className="text-neutral-400 mt-2">Enterprise-grade reliability</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </HeroHighlight>
    </div>
  );
}
