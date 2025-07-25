'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Crown, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { SubscriptionPlan } from '@/app/types/billing';
import { PRICING_PLANS } from '@/lib/billing';

interface UpgradePromptProps {
  requiredPlan: SubscriptionPlan;
  feature: string;
  size?: 'small' | 'large';
  variant?: 'button' | 'banner' | 'modal';
  onUpgrade?: () => void;
  className?: string;
}

export default function UpgradePrompt({
  requiredPlan,
  feature,
  size = 'small',
  variant = 'button',
  onUpgrade,
  className = ''
}: UpgradePromptProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const plan = PRICING_PLANS.find(p => p.id === requiredPlan);
  
  if (!plan) {
    return null;
  }

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = '/sign-in?redirect_url=' + encodeURIComponent('/pricing');
      return;
    }

    if (onUpgrade) {
      onUpgrade();
      return;
    }

    if (plan.id === 'free') {
      return;
    }

    setLoading(true);

    try {
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
      setLoading(false);
    }
  };

  const planIcon = {
    free: null,
    premium: Crown,
    pro: Zap,
  };

  const PlanIcon = planIcon[requiredPlan];

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {PlanIcon && <PlanIcon className="w-5 h-5 mr-2" />}
            <div>
              <h3 className="font-semibold text-sm">
                Upgrade to {plan.name}
              </h3>
              <p className="text-purple-100 text-xs">
                Unlock {feature} and more premium features
              </p>
            </div>
          </div>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="bg-white text-purple-600 px-3 py-1 rounded text-sm font-medium hover:bg-purple-50 transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Upgrade'
            )}
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className={`text-center ${className}`}>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          {PlanIcon && <PlanIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Upgrade to {plan.name}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Get access to {feature} and unlock all premium features to enhance your Drinkjoy experience.
        </p>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-300">
              {plan.name} Plan
            </span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ${plan.price}<span className="text-sm font-normal">/month</span>
            </span>
          </div>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Upgrade Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>
    );
  }

  // Default button variant
  const buttonSizes = {
    small: 'px-3 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`${buttonSizes[size]} bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <Loader2 className={`${size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} animate-spin`} />
      ) : (
        <>
          {PlanIcon && <PlanIcon className={`${size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />}
          Upgrade to {plan.name}
          <ArrowRight className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} ml-2`} />
        </>
      )}
    </button>
  );
}