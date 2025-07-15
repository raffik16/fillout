'use client';

import { useRealtimeStats } from '@/app/hooks/useRealtimeStats';

interface DrinkStatsDisplayProps {
  drinkId: string;
  className?: string;
}

export default function DrinkStatsDisplay({ drinkId, className = '' }: DrinkStatsDisplayProps) {
  const { likeCount, orderCount, isLiked, hasOrdered } = useRealtimeStats(drinkId);

  return (
    <div className={`flex items-center gap-3 text-xs ${className}`}>
      {/* Like Count */}
      <div className={`flex items-center gap-1 ${isLiked ? 'text-red-600' : 'text-gray-500'}`}>
        <span>❤️</span>
        <span>{likeCount}</span>
      </div>
      
      {/* Order Count */}
      {orderCount > 0 && (
        <div className={`flex items-center gap-1 ${hasOrdered ? 'text-green-600' : 'text-gray-500'}`}>
          <span>🍺</span>
          <span>{orderCount}</span>
        </div>
      )}
    </div>
  );
}