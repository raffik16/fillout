'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface ColorSplashAnimationProps {
  onComplete: () => void;
}

export default function ColorSplashAnimation({ onComplete }: ColorSplashAnimationProps) {
  const colors = [
    'bg-red-300',
    'bg-blue-300', 
    'bg-yellow-300',
    'bg-green-300',
    'bg-purple-300'
  ];

  useEffect(() => {
    // Complete animation after all rectangles finish (2 seconds)
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: 'oklch(98% .016 73.684)' }}
    >
      {colors.map((color, index) => (
        <motion.div
          key={index}
          className={`absolute w-full h-screen ${color}`}
          initial={{ y: '-100vh' }}
          animate={{ y: '100vh' }}
          transition={{
            duration: 1.5,
            delay: index * 0.1,
            ease: 'easeInOut'
          }}
          style={{
            zIndex: colors.length - index
          }}
        />
      ))}
    </div>
  );
}