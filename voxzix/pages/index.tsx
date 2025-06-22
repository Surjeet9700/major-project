import Head from 'next/head';
import { ModernNavigation } from '@/components/modern-navigation';
import HeroSection from '@/components/hero-section-simple';
import AIFeaturesSection from '@/components/ai-features-section';
import VoiceAgentDemo from '@/components/voice-agent-demo';
import BusinessBenefits from '@/components/business-benefits';
import CTASection from '@/components/cta-section';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <>
      <Head>
        <title>VoxBiz - AI Voice Agent for Businesses | Transform Customer Service with AI</title>
        <meta name="description" content="Revolutionary AI voice agent that handles customer inquiries, bookings, and support 24/7. See our photography studio demo and learn how it can transform your business." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>        
      <div className="min-h-screen bg-background">
        <ModernNavigation />
        <HeroSection />
        <div id="features">
          <AIFeaturesSection />
        </div>
        <div id="demo">
          <VoiceAgentDemo />
        </div>
        <div id="benefits">
          <BusinessBenefits />
        </div>
        <div id="contact">
          <CTASection />
        </div>
        <Footer />
      </div>
    </>
  );
}
