'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Step {
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Tell us your preferences",
    description: "Share your taste preferences, allergies, and dietary restrictions."
  },
  {
    number: "02",
    title: "Choose your occasion",
    description: "Select your setting or let the weather guide your choice."
  },
  {
    number: "03",
    title: "Get AI recommendations",
    description: "Receive personalized drink suggestions powered by AI."
  },
  {
    number: "04",
    title: "Find or make your drink",
    description: "Discover nearby places or get detailed recipes to make at home."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How Drinkjoy Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get personalized drink recommendations in four simple steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 mb-6 group">
                <div className="text-6xl font-bold text-red-600 mb-4 group-hover:scale-110 transition-transform duration-200">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ChevronRight className="w-8 h-8 text-red-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}