'use client';

import FeatureGate from './FeatureGate';

interface UsageGateProps {
  feature: string;
  limit: number;
  children: React.ReactNode;
  className?: string;
  warningThreshold?: number;
  showUsageBar?: boolean;
  warningMessage?: string;
  onUsageWarning?: (usage: any) => void;
  onUsageExceeded?: (usage: any) => void;
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
  // Always allow access since we removed authentication
  return (
    <div className={className}>
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