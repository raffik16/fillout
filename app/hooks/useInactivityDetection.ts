'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface UseInactivityDetectionOptions {
  timeout?: number; // in milliseconds
  onInactive?: () => void;
  onActive?: () => void;
}

export function useInactivityDetection({
  timeout = 10000, // 10 seconds default
  onInactive,
  onActive
}: UseInactivityDetectionOptions = {}) {
  const [isInactive, setIsInactive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isInactiveRef = useRef(false);

  const resetTimer = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If was inactive, mark as active
    if (isInactiveRef.current) {
      isInactiveRef.current = false;
      setIsInactive(false);
      onActive?.();
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      isInactiveRef.current = true;
      setIsInactive(true);
      onInactive?.();
    }, timeout);
  }, [timeout, onInactive, onActive]);

  useEffect(() => {
    // Events to track for activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'wheel'
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Start the timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer]);

  return {
    isInactive,
    resetTimer
  };
}