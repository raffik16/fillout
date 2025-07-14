'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface DrinkLikeCountProps {
  drinkId: string;
  className?: string;
}

export default function DrinkLikeCount({ drinkId, className = '' }: DrinkLikeCountProps) {
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLikeCount = async () => {
      try {
        const response = await fetch(`/api/likes?drinkId=${drinkId}&sessionId=anonymous`);
        if (response.ok) {
          const data = await response.json();
          setLikeCount(data.likeCount || 0);
        }
      } catch (error) {
        console.error('Error fetching like count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikeCount();
  }, [drinkId]);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1 text-gray-400 ${className}`}>
        <Heart className="w-4 h-4" />
        <span className="text-sm">...</span>
      </div>
    );
  }

  if (likeCount === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 text-gray-500 ${className}`}>
      <Heart className="w-4 h-4" />
      <span className="text-sm font-medium">{likeCount}</span>
    </div>
  );
}