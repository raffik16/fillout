'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface ColorSplashAnimationProps {
  onComplete: () => void;
}

export default function ColorSplashAnimation({ onComplete }: ColorSplashAnimationProps) {
  const drinkColors = [
    '#DC2626', // Red wine
    '#3B82F6', // Blue cocktail 
    '#F59E0B', // Orange juice  
    '#10B981', // Green smoothie
    '#8B5CF6'  // Purple drink
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: 'oklch(98% .016 73.684)', transform: 'scaleY(-1)' }}
    >
      {drinkColors.map((color, index) => (
        <motion.svg
          key={index}
          className="absolute w-full h-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ 
            y: '0%', 
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 1.6,
            delay: index * 0.15,
            ease: "easeOut"
          }}
          style={{ zIndex: drinkColors.length - index }}
        >
          <motion.path
            d={`
              M -200,${400 + index * 30}
              Q ${100 + index * 20},${300 + index * 40} 300,${400 + index * 30}
              T 700,${400 + index * 30}
              T 1100,${400 + index * 30}
              T 1500,${400 + index * 30}
              L 1500,800
              L -200,800
              Z
            `}
            fill={color}
            fillOpacity="0.7"
            initial={{ d: `
              M -200,${400 + index * 30}
              Q ${100 + index * 20},${400 + index * 30} 300,${400 + index * 30}
              T 700,${400 + index * 30}
              T 1100,${400 + index * 30}
              T 1500,${400 + index * 30}
              L 1500,800
              L -200,800
              Z
            ` }}
            animate={{ d: `
              M -200,${400 + index * 30}
              Q ${100 + index * 20},${200 + index * 40} 300,${400 + index * 30}
              T 700,${350 + index * 30}
              T 1100,${450 + index * 30}
              T 1500,${400 + index * 30}
              L 1500,800
              L -200,800
              Z
            ` }}
            transition={{
              duration: 1.2,
              delay: index * 0.15,
              ease: "easeInOut",
              repeat: 1,
              repeatType: "reverse"
            }}
          />
          
          {/* Secondary wave layer for depth */}
          <motion.path
            d={`
              M -200,${420 + index * 30}
              Q ${150 + index * 20},${350 + index * 40} 350,${420 + index * 30}
              T 750,${420 + index * 30}
              T 1150,${420 + index * 30}
              T 1550,${420 + index * 30}
              L 1550,800
              L -200,800
              Z
            `}
            fill={color}
            fillOpacity="0.4"
            initial={{ d: `
              M -200,${420 + index * 30}
              Q ${150 + index * 20},${420 + index * 30} 350,${420 + index * 30}
              T 750,${420 + index * 30}
              T 1150,${420 + index * 30}
              T 1550,${420 + index * 30}
              L 1550,800
              L -200,800
              Z
            ` }}
            animate={{ d: `
              M -200,${420 + index * 30}
              Q ${150 + index * 20},${320 + index * 40} 350,${420 + index * 30}
              T 750,${470 + index * 30}
              T 1150,${370 + index * 30}
              T 1550,${420 + index * 30}
              L 1550,800
              L -200,800
              Z
            ` }}
            transition={{
              duration: 1.4,
              delay: index * 0.15 + 0.2,
              ease: "easeInOut",
              repeat: 1,
              repeatType: "reverse"
            }}
          />
        </motion.svg>
      ))}
    </div>
  );
}