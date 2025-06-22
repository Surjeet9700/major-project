"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { IconPhone, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import RequestCallForm from "./request-call-form";

export default function CTASection() {
  const [showRequestForm, setShowRequestForm] = useState(false);

  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-card border border-border p-12"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Transform Your Customer Experience?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of businesses already using AI voice agents to improve customer service, 
              reduce costs, and increase conversions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/demo">
              <button className="bg-primary text-primary-foreground px-8 py-4 font-medium hover:opacity-90 transition-opacity inline-flex items-center space-x-2" style={{ borderRadius: 'var(--radius)' }}>
                <span>Try Live Demo</span>
                <IconArrowRight className="w-4 h-4" />
              </button>
            </Link>
            
            <div className="text-sm text-muted-foreground">or</div>
            
            <button 
              onClick={() => setShowRequestForm(true)}
              className="bg-secondary text-secondary-foreground px-8 py-4 font-medium hover:opacity-90 transition-opacity inline-flex items-center space-x-2" 
              style={{ borderRadius: 'var(--radius)' }}
            >
              <IconPhone className="w-4 h-4" />
              <span>Request Demo Call</span>
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              No setup fees • 30-day free trial • Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>

      {showRequestForm && (
        <RequestCallForm onClose={() => setShowRequestForm(false)} />
      )}
    </section>
  );
}
