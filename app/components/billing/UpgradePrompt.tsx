'use client';

import { Crown, Zap, ArrowRight } from 'lucide-react';

interface UpgradePromptProps {
  requiredPlan?: string;
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
  // Since authentication is removed, show a simple message
  return (
    <div className={`bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center ${className}`}>
      <p className="text-purple-800 dark:text-purple-200 text-sm">
        {feature} is available for all users!
      </p>
    </div>
  );
}