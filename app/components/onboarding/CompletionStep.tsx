'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { 
  CheckCircle, 
  Sparkles, 
  ArrowRight, 
  
  Heart,
  Compass,
  Star,
  Share2,
  Download
} from 'lucide-react';
import { OnboardingStepProps } from '@/app/types/onboarding';
import { PRICING_PLANS } from '@/lib/billing';

const COMPLETION_FEATURES = [
  {
    icon: Compass,
    title: 'Start Discovering',
    description: 'Get personalized drink recommendations',
    action: 'Go to Dashboard'
  },
  {
    icon: 
    title: 'Customize Profile',
    description: 'Fine-tune your preferences anytime',
    action: 'Open Settings'
  },
  {
    icon: Heart,
    title: 'Save Favorites',
    description: 'Build your personal drink collection',
    action: 'View Favorites'
  },
  {
    icon: Share2,
    title: 'Share & Connect',
    description: 'Share discoveries with friends',
    action: 'Invite Friends'
  }
];

export default function CompletionStep({ onNext, data }: OnboardingStepProps) {
  const { user } = useUser();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const selectedPlan = PRICING_PLANS.find(plan => plan.id === data.selectedPlan) || PRICING_PLANS[0];
  const hasPreferences = !!data.preferences;

  useEffect(() => {
    // Trigger confetti animation
    setShowConfetti(true);
    
    // Mark as ready after animation
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    onNext({
      finalStepCompleted: true,
      redirectTo: '/dashboard'
    });
  };

  const handleGoToFeature = (action: string) => {
    const routes: Record<string, string> = {
      'Go to Dashboard': '/dashboard',
      'Open Settings': '/preferences',
      'View Favorites': '/dashboard?tab=favorites',
      'Invite Friends': '/dashboard?tab=share'
    };

    onNext({
      finalStepCompleted: true,
      redirectTo: routes[action] || '/dashboard'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-rose-400 rounded-full"
              initial={{
                x: '50vw',
                y: '50vh',
                scale: 0,
                rotate: 0
              }}
              animate={{
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                scale: [0, 1, 0],
                rotate: [0, 360]
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 0.5,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>
      )}

      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: 'easeOut',
          delay: 0.3
        }}
        className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-8 shadow-2xl"
      >
        <CheckCircle className="w-16 h-16 text-white" />
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Drinkjoy!
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
          🎉 Your account is all set up and ready to go
        </p>
        
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-12">
          Time to discover your perfect drink matches
        </p>
      </motion.div>

      {/* Setup Summary */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Your Drinkjoy Setup
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Account */}
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Account Created
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Welcome, {user?.firstName || 'Friend'}!
            </p>
          </div>

          {/* Preferences */}
          <div className="text-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
              hasPreferences 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-yellow-100 dark:bg-yellow-900/30'
            }`}>
              {hasPreferences ? (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <Settings className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              )}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Preferences
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {hasPreferences ? 'Personalized setup complete' : 'Set up anytime in settings'}
            </p>
          </div>

          {/* Plan */}
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {selectedPlan.name} Plan
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              ${selectedPlan.price}/{selectedPlan.interval}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          What's Next?
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {COMPLETION_FEATURES.map((feature, index) => (
            <motion.button
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
              onClick={() => handleGoToFeature(feature.action)}
              className="group flex items-start space-x-4 p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:scale-105 transition-all duration-200 text-left"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-rose-100 dark:from-purple-900/30 dark:to-rose-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {feature.description}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {feature.action} →
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Primary CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
        className="mb-8"
      >
        <button
          onClick={handleGetStarted}
          disabled={!isReady}
          className="group inline-flex items-center justify-center px-12 py-4 text-xl font-bold text-white bg-gradient-to-r from-purple-500 to-rose-500 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
          <span>Start Discovering Drinks</span>
          <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>

      {/* Additional Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2 }}
        className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm"
      >
        <button 
          onClick={() => handleGoToFeature('Open Settings')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Customize Preferences</span>
        </button>
        
        <button 
          onClick={() => handleGoToFeature('Invite Friends')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Invite Friends</span>
        </button>
        
        {data.selectedPlan === 'free' && (
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
          >
            <Star className="w-4 h-4" />
            <span>Upgrade Plan</span>
          </button>
        )}
      </motion.div>

      {/* Fun Welcome Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.5 }}
        className="mt-16 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50"
      >
        <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          🍹 Fun Fact
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          The average Drinkjoy user discovers{' '}
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            5 new favorite drinks
          </span>{' '}
          in their first month. What will yours be?
        </p>
      </motion.div>
    </div>
  );
}