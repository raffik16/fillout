'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X, TrendingUp } from 'lucide-react';
import { UsageData } from '@/app/types/billing';
import { FREE_TIER_LIMITS } from '@/lib/billing';
import { motion, AnimatePresence } from 'framer-motion';

interface UsageLimitWarningProps {
  feature: keyof typeof FREE_TIER_LIMITS;
  currentUsage?: number;
  showOnlyNearLimit?: boolean;
  className?: string;
}

export default function UsageLimitWarning({
  feature,
  currentUsage,
  showOnlyNearLimit = true,
  className = ''
}: UsageLimitWarningProps) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/billing/usage');
        const usageData = await response.json();
        setUsage(usageData);
      } catch (error) {
        console.error('Error fetching usage:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!currentUsage) {
      fetchUsage();
    } else {
      setLoading(false);
    }
  }, [currentUsage]);

  if (loading) {
    return null;
  }

  const limit = FREE_TIER_LIMITS[feature];
  const usageCount = currentUsage ?? usage?.[feature] ?? 0;
  const usagePercentage = (usageCount / limit) * 100;
  
  // Don't show if not near limit and showOnlyNearLimit is true
  if (showOnlyNearLimit && usagePercentage < 75) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  const getWarningLevel = () => {
    if (usagePercentage >= 100) return 'critical';
    if (usagePercentage >= 90) return 'high';
    if (usagePercentage >= 75) return 'medium';
    return 'low';
  };

  const warningLevel = getWarningLevel();
  
  const warningConfig = {
    critical: {
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-600',
      title: 'Usage Limit Reached',
      message: `You've used all ${limit} of your ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()} for this month.`
    },
    high: {
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      borderColor: 'border-purple-200 dark:border-purple-800',
      textColor: 'text-purple-800 dark:text-purple-200',
      iconColor: 'text-purple-600',
      title: 'Almost at Your Limit',
      message: `You've used ${usageCount} of ${limit} ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()} this month.`
    },
    medium: {
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-600',
      title: 'Approaching Your Limit',
      message: `You've used ${usageCount} of ${limit} ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()} this month.`
    },
    low: {
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-600',
      title: 'Usage Update',
      message: `You've used ${usageCount} of ${limit} ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()} this month.`
    }
  };

  const config = warningConfig[warningLevel];

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${config.textColor}`}>
                {config.title}
              </h3>
              <div className={`mt-2 text-sm ${config.textColor}`}>
                <p>{config.message}</p>
                
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Usage</span>
                    <span>{usageCount} / {limit}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-2 rounded-full ${
                        warningLevel === 'critical' ? 'bg-purple-500' :
                        warningLevel === 'high' ? 'bg-purple-500' :
                        warningLevel === 'medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}
                    />
                  </div>
                </div>

                {warningLevel !== 'low' && (
                  <div className="mt-4">
                    <button
                      onClick={handleUpgrade}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Upgrade to Premium
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setIsVisible(false)}
                  className={`inline-flex rounded-md p-1.5 ${config.textColor} hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-gray-500`}
                >
                  <span className="sr-only">Dismiss</span>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}