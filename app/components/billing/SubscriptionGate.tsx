'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Lock, Crown, Zap } from 'lucide-react';
import { SubscriptionPlan } from '@/app/types/billing';
import { PRICING_PLANS } from '@/lib/billing';
import UpgradePrompt from './UpgradePrompt';

interface SubscriptionGateProps {
  requiredPlan: SubscriptionPlan;
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export default function SubscriptionGate({
  requiredPlan,
  feature,
  children,
  fallback,
  className = ''
}: SubscriptionGateProps) {
  const { user, isLoaded } = useUser();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!isLoaded) return;

      try {
        const response = await fetch('/api/billing/check-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ requiredPlan }),
        });

        const { hasAccess: access } = await response.json();
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking subscription access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [isLoaded, requiredPlan]);

  if (!isLoaded || loading) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-32 ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const planIcon = {
    free: Lock,
    premium: Crown,
    pro: Zap,
  };

  const PlanIcon = planIcon[requiredPlan];
  const plan = PRICING_PLANS.find(p => p.id === requiredPlan);

  return (
    <div className={`${className}`}>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
            <PlanIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {plan?.name} Feature
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {feature} is available to {plan?.name} subscribers. 
          Upgrade to unlock this feature and many more.
        </p>

        <UpgradePrompt
          requiredPlan={requiredPlan}
          feature={feature}
          size="large"
        />
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          {user ? 'Upgrade your plan to continue' : 'Sign in to upgrade your plan'}
        </p>
      </div>
    </div>
  );
}