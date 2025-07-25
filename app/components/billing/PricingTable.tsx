'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Check, Star, Loader2 } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/billing';
import { PricingPlan } from '@/app/types/billing';

interface PricingTableProps {
  currentPlan?: string;
  className?: string;
}

export default function PricingTable({ currentPlan = 'free', className = '' }: PricingTableProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!user) {
      // Redirect to sign in
      window.location.href = '/sign-in';
      return;
    }

    if (plan.id === 'free') {
      return; // No action needed for free plan
    }

    setLoading(plan.id);

    try {
      // In a real implementation, this would call Clerk's billing API
      // For now, redirect to Clerk's hosted billing portal
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          planId: plan.id,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(null);
    }
  };

  const formatFeatureValue = (value: number | string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? 'Included' : 'Not included';
    }
    if (value === 'unlimited') {
      return 'Unlimited';
    }
    return value.toString();
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Drinkjoy Plan
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover more drinks, get personalized recommendations, and unlock premium features 
          to enhance your drinking experience.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {PRICING_PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const isPopular = plan.popular;
          
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 bg-white dark:bg-gray-800 shadow-lg transition-all duration-200 hover:shadow-xl ${
                isPopular
                  ? 'border-orange-500 scale-105'
                  : 'border-gray-200 dark:border-gray-700'
              } ${isCurrentPlan ? 'ring-2 ring-orange-500' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Current Plan
                  </span>
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
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 ml-1">
                      /{plan.interval}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Drink Recommendations
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatFeatureValue(plan.features.drinkRecommendations)}
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
                      {formatFeatureValue(plan.features.savedDrinks)}
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

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Analytics Access
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {plan.features.analyticsAccess ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Priority Support
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {plan.features.prioritySupport ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan || loading === plan.id}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isPopular
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  } ${
                    isCurrentPlan
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : ''
                  }`}
                >
                  {loading === plan.id ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          All plans include our core features: allergy filtering, basic drink recommendations, 
          and access to our extensive drink database.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Need a custom plan for your business? <a href="/contact" className="text-orange-500 hover:text-orange-600">Contact us</a>
        </p>
      </div>
    </div>
  );
}