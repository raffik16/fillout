'use client';

interface FeatureGateProps {
  requiredPlan?: string;
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
  // Always allow access since we removed authentication
  return <div className={className}>{children}</div>;
}