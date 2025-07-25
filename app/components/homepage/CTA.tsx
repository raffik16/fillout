'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SignupModal } from './SignupModal';

export function CTA() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  
  return (
    <section className="py-20 bg-gradient-to-br from-red-600 to-orange-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
          Start Discovering Your Perfect Drink Today!
        </h2>
        <p className="text-xl mb-8 opacity-90 leading-relaxed">
          Join thousands of happy drinkers and get personalized recommendations tailored just for you
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/sign-up"
            className="bg-white text-red-600 px-8 py-4 rounded-full hover:bg-gray-100 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
          >
            Get Started Free
          </Link>
          <Link 
            href="/app"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-red-600 transition-all duration-200 font-semibold text-lg text-center"
          >
            Try Demo
          </Link>
        </div>
      </div>
      
      {/* Signup Modal */}
      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)} 
      />
    </section>
  );
}