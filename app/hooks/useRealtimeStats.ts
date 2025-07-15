'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  getDrinkLikes, 
  getDrinkOrders, 
  getUserLikes, 
  getUserOrders,
  subscribeToLikes,
  subscribeToOrders
} from '@/lib/supabase';
import { getSessionId } from '@/lib/session';
import { RealtimeChannel } from '@supabase/supabase-js';

interface DrinkStats {
  likeCount: number;
  orderCount: number;
  isLiked: boolean;
  hasOrdered: boolean;
  isLoading: boolean;
}

export function useRealtimeStats(drinkId: string): DrinkStats {
  const [stats, setStats] = useState<DrinkStats>({
    likeCount: 0,
    orderCount: 0,
    isLiked: false,
    hasOrdered: false,
    isLoading: true
  });
  
  const [sessionId, setSessionId] = useState<string>('');
  const [channels, setChannels] = useState<{
    likes?: RealtimeChannel;
    orders?: RealtimeChannel;
  }>({});

  // Fetch initial stats
  const fetchStats = useCallback(async (sessionId: string) => {
    try {
      // Fetch likes data (should work)
      const [likesData, userLikes] = await Promise.all([
        getDrinkLikes(drinkId),
        getUserLikes(sessionId)
      ]);

      // Try to fetch orders data (might fail if table doesn't exist)
      let ordersData = { count: 0, ordered: false };
      let userOrders: string[] = [];
      
      try {
        [ordersData, userOrders] = await Promise.all([
          getDrinkOrders(drinkId),
          getUserOrders(sessionId)
        ]);
      } catch (orderError) {
        console.warn('Orders table not yet created:', orderError);
      }

      setStats({
        likeCount: likesData.count,
        orderCount: ordersData.count,
        isLiked: userLikes.includes(drinkId),
        hasOrdered: userOrders.includes(drinkId),
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching drink stats:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  }, [drinkId]);

  // Handle real-time updates
  const handleLikeUpdate = useCallback(async () => {
    const { count } = await getDrinkLikes(drinkId);
    const userLikes = await getUserLikes(sessionId);
    
    setStats(prev => ({
      ...prev,
      likeCount: count,
      isLiked: userLikes.includes(drinkId)
    }));
  }, [drinkId, sessionId]);

  const handleOrderUpdate = useCallback(async () => {
    try {
      const { count } = await getDrinkOrders(drinkId);
      const userOrders = await getUserOrders(sessionId);
      
      setStats(prev => ({
        ...prev,
        orderCount: count,
        hasOrdered: userOrders.includes(drinkId)
      }));
    } catch (error) {
      console.warn('Error updating order stats:', error);
    }
  }, [drinkId, sessionId]);

  useEffect(() => {
    const id = getSessionId();
    setSessionId(id);
    
    // Fetch initial stats
    fetchStats(id);
  }, [drinkId, fetchStats]);

  useEffect(() => {
    if (!sessionId || !drinkId) return;

    // Subscribe to real-time updates
    const likesChannel = subscribeToLikes(drinkId, handleLikeUpdate);
    
    // Only subscribe to orders if the table exists
    let ordersChannel;
    try {
      ordersChannel = subscribeToOrders(drinkId, handleOrderUpdate);
      setChannels({ likes: likesChannel, orders: ordersChannel });
    } catch (error) {
      console.warn('Orders subscription not available:', error);
      setChannels({ likes: likesChannel });
    }

    // Cleanup subscriptions
    return () => {
      likesChannel.unsubscribe();
      ordersChannel?.unsubscribe();
    };
  }, [drinkId, sessionId, handleLikeUpdate, handleOrderUpdate]);

  return stats;
}