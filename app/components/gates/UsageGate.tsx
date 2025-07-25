'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import FeatureGate from './FeatureGate';

interface UsageGateProps {
  feature: string;
  limit: number;
  children: React.ReactNode;
  className?: string;
  warningThreshold?: number; // Show warning at what percentage (default 80%)
  showUsageBar?: boolean;
  warningMessage?: string;
  onUsageWarning?: (usage: UsageData) => void;
  onUsageExceeded?: (usage: UsageData) => void;
}

interface UsageData {
  current: number;
  limit: number;
  resetDate: string;
  percentage: number;
}

export default function UsageGate({
  feature,
  limit,
  children,
  className = '',
  warningThreshold = 80,
  showUsageBar = true,
  warningMessage,
  onUsageWarning,
  onUsageExceeded
}: UsageGateProps) {
  const { user, isLoaded } = useUser();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const fetchUsage = async () => {
      if (!isLoaded || !user) return;

      try {
        const response = await fetch(`/api/billing/usage?feature=${feature}`);
        if (response.ok) {
          const data = await response.json();
          const usage: UsageData = {
            current: data.current || 0,
            limit: data.limit || limit,
            resetDate: data.resetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            percentage: ((data.current || 0) / (data.limit || limit)) * 100
          };
          
          setUsageData(usage);

          // Trigger callbacks
          if (usage.percentage >= 100 && onUsageExceeded) {
            onUsageExceeded(usage);
          } else if (usage.percentage >= warningThreshold && onUsageWarning) {
            onUsageWarning(usage);
          }

          // Show warning state
          setShowWarning(usage.percentage >= warningThreshold && usage.percentage < 100);
        }
      } catch (error) {
        console.error('Error fetching usage data:', error);
      }
    };

    fetchUsage();
  }, [isLoaded, user, feature, limit, warningThreshold, onUsageWarning, onUsageExceeded]);

  const getUsageColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600 dark:text-red-400';
    if (percentage >= warningThreshold) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getUsageBarColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= warningThreshold) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const UsageWarning = () => {
    if (!usageData || !showWarning) return null;

    return (
      <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Usage Warning
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              {warningMessage || 
                `You&apos;re approaching your ${feature} limit. Consider upgrading to avoid interruption.`
              }
            </p>
            
            {showUsageBar && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-yellow-600 dark:text-yellow-400 mb-1">
                  <span>{usageData.current} / {usageData.limit} used</span>
                  <span>{Math.round(usageData.percentage)}%</span>
                </div>
                <div className="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(usageData.percentage)}`}
                    style={{ width: `${Math.min(usageData.percentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-xs text-yellow-600 dark:text-yellow-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Resets: {new Date(usageData.resetDate).toLocaleDateString()}</span>
              </div>
              <button 
                onClick={() => window.location.href = '/pricing'}
                className="text-yellow-700 dark:text-yellow-300 hover:underline font-medium"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const UsageDisplay = () => {
    if (!usageData || !showUsageBar) return null;

    return (
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {feature} Usage
            </span>
          </div>
          <span className={`text-sm font-semibold ${getUsageColor(usageData.percentage)}`}>
            {usageData.current} / {usageData.limit}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(usageData.percentage)}`}
            style={{ width: `${Math.min(usageData.percentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Resets: {new Date(usageData.resetDate).toLocaleDateString()}</span>
          <span>{Math.round(usageData.percentage)}% used</span>
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      <UsageWarning />
      <UsageDisplay />
      
      <FeatureGate
        requiredUsage={{
          feature,
          limit
        }}
        feature={feature}
        showUpgrade={true}
      >
        {children}
      </FeatureGate>
    </div>
  );
}