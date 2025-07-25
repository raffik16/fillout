'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
    title: "Discover and Save Your Matches",
    description: "Like your favorites and build your personal drink collection for future reference."
  }
];

export function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const stepVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      rotateX: -15
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8
      }
    }
  };

  const chevronVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.5,
        delay: 0.5
      }
    }
  };

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How Drinkjoy Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get personalized drink recommendations in four simple steps
          </p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              className="text-center relative"
              variants={stepVariants}
            >
              <motion.div 
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 mb-6 group"
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.div 
                  className="text-6xl font-bold text-purple-600 mb-4"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: 0.2 + index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  {step.number}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
              {index < steps.length - 1 && (
                <motion.div 
                  className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2"
                  variants={chevronVariants}
                >
                  <ChevronRight className="w-8 h-8 text-purple-300" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}