'use client';

import { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  CreditCard,
  
  ExternalLink 
} from 'lucide-react';
import { SubscriptionData } from '@/app/types/billing';
import { formatSubscriptionStatus, getBillingPortalUrl } from '@/lib/billing';

interface SubscriptionStatusProps {
  className?: string;
  showManageButton?: boolean;
}

export default function SubscriptionStatus({ 
  className = '', 
  showManageButton = true 
}: SubscriptionStatusProps) {
  const user = null;
  const isLoaded = true;
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!isLoaded || !user) return;

      try {
        const response = await fetch('/api/billing/subscription');
        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [isLoaded, user]);

  if (!isLoaded || loading) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-20 ${className}`} />
    );
  }

  if (!subscription) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'trialing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'past_due':
      case 'incomplete':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'canceled':
      case 'unpaid':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'trialing':
        return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900';
      case 'past_due':
      case 'incomplete':
        return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900';
      case 'canceled':
      case 'unpaid':
        return 'text-red-700 bg-purple-100 dark:text-red-300 dark:bg-purple-900';
      default:
        return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const handleManageBilling = () => {
    window.open(getBillingPortalUrl(), '_blank');
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {getStatusIcon(subscription.status)}
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {subscription.plan} Plan
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
              {formatSubscriptionStatus(subscription.status)}
            </span>
          </div>
        </div>
        
        {showManageButton && (
          <button
            onClick={handleManageBilling}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage
            <ExternalLink className="w-3 h-3 ml-1" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {subscription.status === 'trialing' && subscription.trialEnd && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Trial ends:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDate(subscription.trialEnd)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {subscription.status === 'canceled' && subscription.cancelAtPeriodEnd 
              ? 'Cancels on:' 
              : 'Next billing:'
            }
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatDate(subscription.currentPeriodEnd)}
          </span>
        </div>

        {subscription.cancelAtPeriodEnd && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <p className="ml-2 text-sm text-yellow-800 dark:text-yellow-200">
                Your subscription will cancel at the end of your current billing period.
              </p>
            </div>
          </div>
        )}

        {(subscription.status === 'past_due' || subscription.status === 'incomplete') && (
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-center">
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <p className="ml-2 text-sm text-red-800 dark:text-red-200">
                Please update your payment method to continue using premium features.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}