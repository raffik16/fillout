'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Zap, Check, Sparkles, TrendingUp } from 'lucide-react';
import { SubscriptionPlan } from '@/app/types/billing';
import { PRICING_PLANS } from '@/lib/billing';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggeredBy?: string;
  requiredPlan?: SubscriptionPlan;
  currentUsage?: {
    feature: string;
    current: number;
    limit: number;
    resetDate: string;
  };
  className?: string;
}

interface FeatureHighlight {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  planRequired: SubscriptionPlan;
}

const featureHighlights: FeatureHighlight[] = [
  {
    icon: Sparkles,
    title: 'Unlimited AI Chats',
    description: 'Get unlimited personalized drink recommendations from your AI bartender',
    planRequired: 'premium'
  },
  {
    icon: TrendingUp,
    title: 'Advanced Analytics',
    description: 'Deep insights into your drinking preferences and trends',
    planRequired: 'premium'
  },
  {
    icon: Crown,
    title: 'Premium Recipes',
    description: 'Access exclusive cocktail recipes and preparation techniques',
    planRequired: 'premium'
  },
  {
    icon: Zap,
    title: 'Priority Support',
    description: '24/7 premium customer support and feature requests',
    planRequired: 'pro'
  }
];

export default function UpgradeModal({
  isOpen,
  onClose,
  triggeredBy,
  requiredPlan,
  currentUsage,
  className = ''
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(requiredPlan || 'premium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(requiredPlan || 'premium');
      setLoading(false);
      setError(null);
    }
  }, [isOpen, requiredPlan]);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          successUrl: window.location.href,
          cancelUrl: window.location.href
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;

    } catch (error) {
      console.error('Error creating checkout session:', error);
      setError('Failed to start upgrade process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'premium': return Crown;
      case 'pro': return Zap;
      default: return Crown;
    }
  };

  const getPlanColor = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'premium': return 'amber';
      case 'pro': return 'purple';
      default: return 'amber';
    }
  };

  const planColorMap = {
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      button: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
      ring: 'ring-amber-500'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-700 dark:text-purple-300',
      button: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      ring: 'ring-purple-500'
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden ${className}`}
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-100 to-purple-100 dark:from-amber-900/20 dark:to-purple-900/20 rounded-full text-sm font-medium text-amber-800 dark:text-amber-200 mb-4">
                  <Crown className="w-4 h-4" />
                  Upgrade Required
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Unlock Premium Features
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                  {triggeredBy ? `${triggeredBy} is a premium feature. ` : ''}
                  Upgrade your plan to access unlimited AI chats, advanced analytics, and exclusive content.
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Usage Alert */}
              {currentUsage && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    Usage Limit Reached
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-2">
                    You&apos;ve used {currentUsage.current} out of {currentUsage.limit} {currentUsage.feature} this month.
                  </p>
                  <p className="text-yellow-600 dark:text-yellow-400 text-xs">
                    Resets on {new Date(currentUsage.resetDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Feature Highlights */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {featureHighlights.map((feature, index) => {
                  const Icon = feature.icon;
                  const isIncluded = selectedPlan === 'pro' || 
                    (selectedPlan === 'premium' && feature.planRequired !== 'pro');
                  
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${
                        isIncluded 
                          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          isIncluded 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isIncluded 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${
                            isIncluded 
                              ? 'text-green-900 dark:text-green-100' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {feature.title}
                          </h4>
                          <p className={`text-sm ${
                            isIncluded 
                              ? 'text-green-700 dark:text-green-300' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {feature.description}
                          </p>
                        </div>
                        {isIncluded && (
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Plan Selection */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {PRICING_PLANS.filter(plan => plan.id !== 'free').map((plan) => {
                  const Icon = getPlanIcon(plan.id);
                  const colorKey = getPlanColor(plan.id) as keyof typeof planColorMap;
                  const colors = planColorMap[colorKey];
                  const isSelected = selectedPlan === plan.id;
                  
                  return (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? `${colors.border} ${colors.bg} ring-4 ${colors.ring} ring-opacity-20` 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${colors.bg}`}>
                          <Icon className={`w-6 h-6 ${colors.text}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {plan.name}
                          </h3>
                          {plan.popular && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                              Most Popular
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          ${plan.price}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          /{plan.interval}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {plan.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {plan.features.drinkRecommendations === 'unlimited' 
                              ? 'Unlimited' 
                              : plan.features.drinkRecommendations
                            } AI recommendations
                          </span>
                        </div>
                        {plan.features.premiumRecipes && (
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              Premium recipes & techniques
                            </span>
                          </div>
                        )}
                        {plan.features.analyticsAccess && (
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              Advanced analytics dashboard
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpgrade}
                  disabled={loading}
                  className={`flex-1 ${planColorMap[getPlanColor(selectedPlan) as keyof typeof planColorMap].button} text-white py-3 px-6 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    `Upgrade to ${PRICING_PLANS.find(p => p.id === selectedPlan)?.name}`
                  )}
                </motion.button>
                
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Maybe Later
                </button>
              </div>

              {/* Trust Signals */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Cancel anytime</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}