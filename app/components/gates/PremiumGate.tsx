'use client';

import { Crown, Sparkles, Zap } from 'lucide-react';
import FeatureGate from './FeatureGate';
import { SubscriptionPlan } from '@/app/types/billing';

interface PremiumGateProps {
  plan?: SubscriptionPlan;
  feature: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  showBadge?: boolean;
  onBlocked?: () => void;
}

const planConfig = {
  premium: {
    icon: Crown,
    name: 'Premium',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-amber-600'
  },
  pro: {
    icon: Zap,
    name: 'Pro',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-purple-600'
  }
};

export default function PremiumGate({
  plan = 'premium',
  feature,
  children,
  className = '',
  title,
  description,
  showBadge = true,
  onBlocked
}: PremiumGateProps) {
  const config = planConfig[plan as keyof typeof planConfig] || planConfig.premium;
  const Icon = config.icon;

  const fallback = (
    <div className={`relative overflow-hidden rounded-xl border-2 border-dashed ${config.borderColor} ${config.bgColor} p-8 text-center ${className}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 left-4">
          <Icon className="w-12 h-12" />
        </div>
        <div className="absolute bottom-4 right-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Icon className="w-24 h-24" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex justify-center mb-4">
          <div className={`${config.bgColor} p-4 rounded-full shadow-lg`}>
            <Icon className={`w-8 h-8 ${config.color}`} />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {title || `${config.name} Feature`}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
          {description || `${feature} is available to ${config.name} subscribers. Unlock this feature and many more with your upgrade.`}
        </p>

        <div className="space-y-3">
          <button 
            onClick={() => window.location.href = '/pricing'}
            className={`inline-flex items-center gap-2 bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
          >
            <Icon className="w-5 h-5" />
            Upgrade to {config.name}
          </button>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {showBadge && (
        <div className="absolute -top-2 -right-2 z-20">
          <div className={`inline-flex items-center gap-1 ${config.bgColor} ${config.borderColor} border px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="w-3 h-3" />
            {config.name}
          </div>
        </div>
      )}
      
      <FeatureGate
        requiredPlan={plan}
        feature={feature}
        fallback={fallback}
        showUpgrade={false}
        className={className}
        onBlocked={onBlocked}
      >
        {children}
      </FeatureGate>
    </div>
  );
}