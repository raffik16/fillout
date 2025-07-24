'use client';

import React from 'react';
import { Zap, Cloud, Clock, Shield } from 'lucide-react';
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
    title: "Personalized Recommendations",
    description: "Tailored suggestions based on your unique tastes, allergies, and occasion.",
    keyword: "personalized drinks"
  },
  {
    icon: <Cloud className="w-8 h-8" />,
    title: "Weather-Based Recommendations",
    description: "Let the weather inspire your drink choice with smart suggestions.",
    keyword: "weather-based drinks"
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: "Happy Hour Specials",
    description: "Find the best deals and discounts near you in real-time.",
    keyword: "happy hour specials"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Allergy-Safe Filtering",
    description: "Enjoy drinks without worrying about allergens with smart filtering.",
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
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-red-200 group cursor-pointer"
              whileHover={{ 
                y: -8,
                transition: { duration: 0.2 }
              }}
            >
              <div className="text-red-600 mb-4 group-hover:scale-110 transition-transform duration-200">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}