'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { CreditCard, Star, Check, ArrowRight, Zap, Gift } from 'lucide-react';
import { OnboardingStepProps } from '@/app/types/onboarding';
import { SubscriptionPlan } from '@/app/types/billing';
import { PRICING_PLANS } from '@/lib/billing';

export default function SubscriptionStep({ onNext, onSkip, data }: OnboardingStepProps) {
  const { user } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
    data.selectedPlan || 'free'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlanSelect = (planId: SubscriptionPlan) => {
    setSelectedPlan(planId);
  };

  const handleContinue = async () => {
    if (selectedPlan === 'free') {
      // Free plan - no payment processing needed
      onNext({
        selectedPlan,
        subscriptionCompleted: true
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // In a real implementation, this would create a Stripe checkout session
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          onboardingFlow: true
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        // Store selected plan before redirecting
        onNext({
          selectedPlan,
          subscriptionCompleted: true
        });
        
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      // For demo purposes, continue anyway
      onNext({
        selectedPlan,
        subscriptionCompleted: true
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    onNext({
      selectedPlan: 'free',
      subscriptionCompleted: true,
      skipSubscription: true
    });
  };

  const selectedPlanData = PRICING_PLANS.find(plan => plan.id === selectedPlan);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Plan
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Select the plan that best fits your drinking discovery needs. 
          You can always upgrade or downgrade later.
        </p>
      </motion.div>

      {/* Special Onboarding Offer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl p-6 mb-8 text-center"
      >
        <div className="flex items-center justify-center mb-2">
          <Gift className="w-6 h-6 mr-2" />
          <span className="font-bold text-lg">Welcome Bonus!</span>
        </div>
        <p className="text-sm opacity-90">
          Get your first month of Premium at 50% off when you complete onboarding today!
        </p>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {PRICING_PLANS.map((plan, index) => {
          const isSelected = selectedPlan === plan.id;
          const isPopular = plan.popular;
          const isWelcomeOffer = plan.id === 'premium';
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`relative rounded-2xl border-2 transition-all duration-200 cursor-pointer transform hover:scale-105 ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-xl'
                  : isPopular
                  ? 'border-purple-300 bg-white dark:bg-gray-800 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg'
              }`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Welcome Offer Badge */}
              {isWelcomeOffer && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    50% OFF
                  </div>
                </div>
              )}

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    {isWelcomeOffer ? (
                      <div>
                        <div className="flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-400 line-through mr-2">
                            ${plan.price}
                          </span>
                          <span className="text-4xl font-bold text-orange-500">
                            ${(plan.price / 2).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          First month, then ${plan.price}/{plan.interval}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          ${plan.price}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300 ml-1">
                          /{plan.interval}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Drink Recommendations
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {plan.features.drinkRecommendations === 'unlimited' 
                        ? 'Unlimited' 
                        : plan.features.drinkRecommendations}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Weather Integration
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {plan.features.weatherIntegration ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Saved Drinks
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {plan.features.savedDrinks === 'unlimited' 
                        ? 'Unlimited' 
                        : plan.features.savedDrinks}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Premium Recipes
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {plan.features.premiumRecipes ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </span>
                  </div>

                  {plan.id === 'pro' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          Analytics Access
                        </span>
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          Priority Support
                        </span>
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                    </>
                  )}
                </div>

                {/* Plan-specific benefits */}
                {plan.id === 'free' && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-2">
                      <Zap className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="font-medium text-blue-900 dark:text-blue-300">
                        Perfect for Beginners
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Try Drinkjoy risk-free and upgrade when ready
                    </p>
                  </div>
                )}

                {plan.id === 'premium' && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-2">
                      <Star className="w-5 h-5 text-purple-500 mr-2" />
                      <span className="font-medium text-purple-900 dark:text-purple-300">
                        Best Value
                      </span>
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-400">
                      Perfect balance of features and price
                    </p>
                  </div>
                )}

                {plan.id === 'pro' && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-2">
                      <Zap className="w-5 h-5 text-green-500 mr-2" />
                      <span className="font-medium text-green-900 dark:text-green-300">
                        For Professionals
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Advanced features for bars and restaurants
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Plan Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          Why Choose {selectedPlanData?.name}?
        </h3>
        
        <div className="text-center text-gray-600 dark:text-gray-300">
          {selectedPlan === 'free' && (
            <p>Start your journey with basic features. Perfect for exploring Drinkjoy without any commitment.</p>
          )}
          {selectedPlan === 'premium' && (
            <p>Get advanced recommendations with weather integration and premium recipes. Great for enthusiasts!</p>
          )}
          {selectedPlan === 'pro' && (
            <p>Access all features including analytics, unlimited everything, and priority support for professionals.</p>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
      >
        <button
          onClick={handleContinue}
          disabled={isProcessing}
          className="group inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <span className="mr-2">
              {selectedPlan === 'free' ? 'Continue with Free' : `Start ${selectedPlanData?.name}`}
            </span>
          )}
          {!isProcessing && <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
        </button>
        
        <button
          onClick={handleSkip}
          className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Skip for Now
        </button>
      </motion.div>

      {/* Money Back Guarantee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-8"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          💰 30-day money-back guarantee • ✨ Cancel anytime • 🔒 Secure payment
        </p>
      </motion.div>
    </div>
  );
}