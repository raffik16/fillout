'use client';

import React from 'react';
import { Zap, Archive, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  keyword: string;
}

const features: Feature[] = [
  {
    icon: <Zap className="w-8 h-8" />,
    title: "AI-Powered Recommendations",
    description: "Advanced matching algorithm considers your taste preferences, occasion, and mood for perfect suggestions.",
    keyword: "AI recommendations"
  },
  {
    icon: <Archive className="w-8 h-8" />,
    title: "Comprehensive Drink Database",
    description: "Access thousands of drinks across cocktails, beer, wine, spirits, and non-alcoholic options.",
    keyword: "drink database"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Smart Occasion Matching",
    description: "Whether it's happy hour, a celebration, or business meeting - we match drinks to your moment.",
    keyword: "occasion matching"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Allergy-Safe Filtering",
    description: "Enjoy drinks worry-free with comprehensive allergen detection and filtering.",
    keyword: "allergy-safe drinks"
  }
];

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Drinkjoy?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of drink discovery with AI-powered recommendations tailored just for you
          </p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 group cursor-pointer relative overflow-hidden"
              whileHover={{ 
                y: -8,
                transition: { duration: 0.2 }
              }}
            >
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              {/* purple-rose accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-purple-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative mb-4 group-hover:scale-110 transition-transform duration-200 z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-purple-200">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 relative z-10">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed relative z-10">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}