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
  const { width, height } = useWindowSize();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

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
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
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

        <motion.button
          onClick={onComplete}
          className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          See My Matches
        </motion.button>
      </motion.div>
    </div>
  );
}