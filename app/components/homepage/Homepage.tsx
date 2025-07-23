'use client';

import React from 'react';
import { Navigation } from './Navigation';
import { Hero } from './Hero';
import { Features } from './Features';
import { HowItWorks } from './HowItWorks';
import { Testimonials } from './Testimonials';
import { CTA } from './CTA';
import { GlobalFooter } from '../layout/GlobalFooter';

export function Homepage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <GlobalFooter />
    </div>
  );
}