'use client';

import React from 'react';
import { 
  useSubscriptionPlan, 
  usePlanFeatures, 
  useIsPremium
  useIsSubscriptionActive,
  useFeatureUsagePercentage,
  useCanPerformAction 
} from '../../../lib/clerk/client';

// Mock usage data - in a real app, this would come from your backend
const mockUsageData = {
  savedDrinks: 7,
  aiChatMessages: 15,
};

export function SubscriptionPage() {
  const subscriptionPlan = useSubscriptionPlan();
  const planFeatures = usePlanFeatures();
  const isPremium = useIsPremiumUser();
  const isActive = useIsSubscriptionActive();
  
  const savedDrinksUsage = useFeatureUsagePercentage('maxSavedDrinks', mockUsageData.savedDrinks);
  const aiChatUsage = useFeatureUsagePercentage('aiChatMessages', mockUsageData.aiChatMessages);
  
  const canSaveMoreDrinks = useCanPerformAction('maxSavedDrinks', mockUsageData.savedDrinks);
  const canSendMoreMessages = useCanPerformAction('aiChatMessages', mockUsageData.aiChatMessages);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-purple-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '$0',
      period: 'forever',
      features: [
        '10 saved drinks',
        '20 AI chat messages/month',
        'Basic recommendations',
        'Weather integration',
        'Email support'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: '$9.99',
      period: 'per month',
      features: [
        '100 saved drinks',
        'Unlimited AI chat',
        'Advanced filtering',
        'Personalized recommendations',
        'Priority support',
        'Export data'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '$19.99',
      period: 'per month',
      features: [
        'Unlimited saved drinks',
        'Unlimited AI chat',
        'All advanced features',
        'Premium recommendations',
        'Priority support',
        'Export data',
        'Custom preferences'
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Subscription & Usage
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your subscription and view your usage statistics
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Current Plan
        </h2>
        
        {subscriptionPlan ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {subscriptionPlan.planName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status: <span className={`font-medium ${
                    isActive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {subscriptionPlan.status.charAt(0).toUpperCase() + subscriptionPlan.status.slice(1)}
                  </span>
                </p>
              </div>
              {isPremium && (
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current period ends
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(subscriptionPlan.currentPeriodEnd)}
                  </p>
                </div>
              )}
            </div>

            {subscriptionPlan.cancelAtPeriodEnd && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                  Your subscription will be cancelled at the end of the current period.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No active subscription found.
          </p>
        )}
      </div>

      {/* Usage Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Usage Statistics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Saved Drinks */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                Saved Drinks
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {mockUsageData.savedDrinks} / {planFeatures.maxSavedDrinks === -1 ? '∞' : planFeatures.maxSavedDrinks}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageColor(savedDrinksUsage)}`}
                style={{ width: `${Math.min(savedDrinksUsage, 100)}%` }}
              />
            </div>
            {!canSaveMoreDrinks && planFeatures.maxSavedDrinks !== -1 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Limit reached. Upgrade to save more drinks.
              </p>
            )}
          </div>

          {/* AI Chat Messages */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                AI Chat Messages
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {mockUsageData.aiChatMessages} / {planFeatures.aiChatMessages === -1 ? '∞' : planFeatures.aiChatMessages}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageColor(aiChatUsage)}`}
                style={{ width: `${Math.min(aiChatUsage, 100)}%` }}
              />
            </div>
            {!canSendMoreMessages && planFeatures.aiChatMessages !== -1 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Monthly limit reached. Resets on {formatDate(subscriptionPlan?.currentPeriodEnd || '')}.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Plan Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`border-2 rounded-lg p-6 ${
                subscriptionPlan?.planId === plan.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">
                    {plan.period}
                  </span>
                </div>
                {subscriptionPlan?.planId === plan.id && (
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                    Current Plan
                  </span>
                )}
              </div>
              
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-4 h-4 text-green-500 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              {subscriptionPlan?.planId !== plan.id && (
                <button
                  className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    // Handle plan upgrade/change
                    console.log(`Upgrade to ${plan.id}`);
                  }}
                >
                  {plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Billing Actions */}
      {isPremium && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Billing Actions
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              View Billing History
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Update Payment Method
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Cancel Subscription
            </button>
          </div>
        </div>
      )}
    </div>
  );
}