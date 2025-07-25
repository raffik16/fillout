'use client';

import React, { useRef } from 'react';
import { Navigation } from './Navigation';
import { Hero } from './Hero';
import { Features } from './Features';
import { HowItWorks } from './HowItWorks';
import { Testimonials } from './Testimonials';
import { CTA } from './CTA';
import { GlobalFooter } from '../layout/GlobalFooter';
import { AIChatWrapper, AIChatWrapperRef } from '../ai-chat';

export function Homepage() {
  const chatWrapperRef = useRef<AIChatWrapperRef>(null);

  const handleAIChatToggle = () => {
    chatWrapperRef.current?.toggleChat();
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero onAIChatToggle={handleAIChatToggle} />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <GlobalFooter />
      <AIChatWrapper ref={chatWrapperRef} />
    </div>
  );
}