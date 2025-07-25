'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { SubscriptionPlan } from '@/app/types/billing';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

interface FeatureGateProps {
  requiredPlan?: SubscriptionPlan;
  requiredUsage?: {
    feature: string;
    limit: number;
  };
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
  className?: string;
  onBlocked?: () => void;
}

interface AccessCheckResult {
  hasAccess: boolean;
  currentPlan: SubscriptionPlan;
  usage?: {
    current: number;
    limit: number;
    resetDate: string;
  };
  reason?: string;
}

export default function FeatureGate({
  requiredPlan,
  requiredUsage,
  feature,
  children,
  fallback,
  showUpgrade = true,
  className = '',
  onBlocked
}: FeatureGateProps) {
  const { user, isLoaded } = useUser();
  const [accessResult, setAccessResult] = useState<AccessCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!isLoaded) return;

      try {
        setLoading(true);
        setError(null);

        // If no user and plan is required, deny access
        if (!user && requiredPlan && requiredPlan !== 'free') {
          setAccessResult({
            hasAccess: false,
            currentPlan: 'free',
            reason: 'authentication_required'
          });
          setLoading(false);
          return;
        }

        // Build request payload
        const payload: any = {
          feature,
          requiredPlan,
          requiredUsage
        };

        const response = await fetch('/api/billing/check-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Access check failed: ${response.status}`);
        }

        const result: AccessCheckResult = await response.json();
        setAccessResult(result);

        // Call onBlocked callback if access is denied
        if (!result.hasAccess && onBlocked) {
          onBlocked();
        }

      } catch (error) {
        console.error('Error checking feature access:', error);
        setError('Failed to verify access permissions');
        // Default to denying access on error
        setAccessResult({
          hasAccess: false,
          currentPlan: 'free',
          reason: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [isLoaded, user, requiredPlan, requiredUsage, feature, onBlocked]);

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
        <p className="text-red-800 dark:text-red-200 text-sm">
          {error}
        </p>
      </div>
    );
  }

  // Access granted
  if (accessResult?.hasAccess) {
    return <div className={className}>{children}</div>;
  }

  // Access denied - show fallback if provided
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  // Access denied - show nothing if upgrade prompts are disabled
  if (!showUpgrade) {
    return null;
  }

  // Access denied - show default blocked message
  return (
    <div className={`bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center ${className}`}>
      <div className="text-gray-600 dark:text-gray-300">
        <h3 className="font-semibold text-lg mb-2">Feature Not Available</h3>
        <p className="text-sm mb-4">
          {accessResult?.reason === 'authentication_required' 
            ? 'Please sign in to access this feature.'
            : accessResult?.reason === 'usage_limit_exceeded'
            ? `You've reached your ${feature} limit. Upgrade to continue.`
            : `This feature requires a ${requiredPlan} plan or higher.`
          }
        </p>
        
        {accessResult?.usage && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Usage: {accessResult.usage.current} / {accessResult.usage.limit}
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
              Resets: {new Date(accessResult.usage.resetDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {accessResult?.reason === 'authentication_required' ? (
          <button 
            onClick={() => window.location.href = '/sign-in'}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Sign In
          </button>
        ) : (
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Upgrade Plan
          </button>
        )}
      </div>
    </div>
  );
}