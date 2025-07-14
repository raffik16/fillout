'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface MatchRevealProps {
  onComplete: () => void;
}

export default function MatchReveal({ onComplete }: MatchRevealProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [isVisible, setIsVisible] = useState(true);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Start fade out
          setIsVisible(false);
          // Complete after fade out
          setTimeout(() => {
            onComplete();
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearTimeout(confettiTimer);
      clearInterval(countdownInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-50 to-rose-50 flex flex-col items-center justify-center p-4">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          colors={['#fb923c', '#f97316', '#ea580c', '#fbbf24', '#f59e0b']}
          numberOfPieces={200}
          recycle={false}
        />
      )}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ 
          scale: 1,
          opacity: isVisible ? 1 : 0
        }}
        transition={{
          type: "spring",
          duration: 0.8,
          bounce: 0.4
        }}
        className="text-center will-change-transform"
      >
        <div className="text-6xl sm:text-7xl md:text-8xl mb-6 min-h-[5rem] flex items-center justify-center" aria-label="Celebration">
          🎉
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          It&apos;s a Match!
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-8">
          We found your perfect drinks
        </p>

        {/* Countdown Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center justify-center gap-4">
            <motion.div
              key={countdown}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold"
            >
              {countdown}
            </motion.div>
            <p className="text-sm text-gray-500">
              Showing results in {countdown} second{countdown !== 1 ? 's' : ''}
            </p>
          </div>
        </motion.div>

        <motion.button
          onClick={onComplete}
          className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          See My Matches Now
        </motion.button>
      </motion.div>
    </div>
  );
}