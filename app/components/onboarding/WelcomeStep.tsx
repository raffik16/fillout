'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { Sparkles, Coffee, Wines, ArrowRight, Heart } from 'lucide-react';
import { OnboardingStepProps } from '@/app/types/onboarding';

const WELCOME_FEATURES = [
  {
    icon: Sparkles,
    title: 'Personalized Recommendations',
    description: 'Get drink suggestions tailored to your taste preferences and dietary needs.'
  },
  {
    icon: Coffee,
    title: 'Comprehensive Database',
    description: 'Explore cocktails, beers, wines, spirits, and non-alcoholic beverages.'
  },
  {
    icon: Wine,
    title: 'Smart Matching',
    description: 'Our AI considers weather, occasion, and your flavor profile for perfect matches.'
  },
  {
    icon: Users,
    title: 'Social Features',
    description: 'Save favorites, track orders, and discover what others are enjoying.'
  }
];

export default function WelcomeStep({ onNext, data }: OnboardingStepProps) {
  const { user } = useUser();
  const [hasSeenAnimation, setHasSeenAnimation] = useState(data.hasSeenIntro);

  const handleGetStarted = () => {
    onNext({
      welcomeCompleted: true,
      hasSeenIntro: true
    });
  };

  const firstName = user?.firstName || 'there';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        {/* Welcome Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: 'easeOut',
            delay: 0.2
          }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-400 to-rose-500 rounded-full mb-8 shadow-2xl"
          onAnimationComplete={() => setHasSeenAnimation(true)}
        >
          <Heart className="w-12 h-12 text-white" />
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Drinkjoy,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-rose-500">
              {firstName}
            </span>
            !
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Discover your perfect drink match with AI-powered recommendations
          </p>
          
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Let's set up your account and find drinks you'll love
          </p>
        </motion.div>
      </div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="grid md:grid-cols-2 gap-8 mb-12"
      >
        {WELCOME_FEATURES.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
            className="flex items-start space-x-4 p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-rose-100 dark:from-purple-900/30 dark:to-rose-900/30 rounded-xl flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Account Setup Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 mb-12 border border-blue-200/50 dark:border-blue-700/50"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your Journey Begins Here
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                1
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                <strong>Set Preferences</strong><br />
                Tell us your taste preferences
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                2
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                <strong>Choose Plan</strong><br />
                Pick the right plan for you
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                3
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                <strong>Start Discovering</strong><br />
                Get personalized recommendations
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.6 }}
        className="text-center"
      >
        <button
          onClick={handleGetStarted}
          disabled={!hasSeenAnimation}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-rose-500 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span className="mr-2">Let's Get Started</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400 to-rose-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
        </button>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Takes about 3 minutes to complete • Skip any step if needed
        </p>
      </motion.div>

      {/* Fun Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2 }}
        className="mt-16 grid grid-cols-3 gap-8 text-center"
      >
        <div>
          <div className="text-2xl font-bold text-purple-500 dark:text-purple-400">
            10,000+
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Drinks in Database
          </div>
        </div>
        
        <div>
          <div className="text-2xl font-bold text-rose-500 dark:text-rose-400">
            50,000+
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Happy Users
          </div>
        </div>
        
        <div>
          <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">
            98%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Match Satisfaction
          </div>
        </div>
      </motion.div>
    </div>
  );
}