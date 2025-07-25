'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SignupModal } from './SignupModal';

export function CTA() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  
  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 to-purple-500 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
          Start Discovering Your Perfect Drink Today!
        </h2>
        <p className="text-xl mb-8 opacity-90 leading-relaxed">
          Join thousands of happy drinkers and get personalized recommendations tailored just for you
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => setIsSignupModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-8 py-4 rounded-full hover:from-purple-700 hover:to-purple-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Get Started Free
          </button>
          <Link 
            href="/app"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-500 hover:border-purple-500 transition-all duration-200 font-semibold text-lg text-center"
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