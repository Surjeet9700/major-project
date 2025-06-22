"use client";

import { IconPhone, IconMail, IconMapPin } from "@tabler/icons-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold text-foreground">VoxBiz</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Revolutionary AI voice agents that transform customer service. 
              Experience the future of business communication.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <IconPhone className="w-4 h-4" />
                <span>+1 (555) VOXBIZ-AI</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <IconMail className="w-4 h-4" />
                <span>hello@voxbiz.ai</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <IconMapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Benefits</a></li>
              <li><a href="/photo-studio-demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Live Demo</a></li>
              <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a></li>
              <li><a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="#privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a></li>
              <li><a href="#terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {currentYear} VoxBiz. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground mt-2 md:mt-0">
              Powered by Advanced AI Technology
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

