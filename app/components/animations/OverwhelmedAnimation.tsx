'use client';

import { motion } from 'framer-motion';

interface OverwhelmedAnimationProps {
  onComplete?: () => void;
}

export default function OverwhelmedAnimation({ onComplete }: OverwhelmedAnimationProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={() => {
        // Wait for the full animation duration (0.75s) plus a small buffer
        setTimeout(() => {
          onComplete?.();
        }, 2000);
      }}
    >
      {/* Main overwhelmed face */}
      <motion.div
        className="text-6xl mb-4"
        initial={{ scale: 1 }}
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, -10, 10, -5, 5, 0]
        }}
        transition={{ 
          duration: .75,
          times: [0, 0.3, 1],
          ease: "easeInOut"
        }}
      >
        😵‍💫
      </motion.div>
      
      {/* Text with typing effect */}
      <motion.div
        className="text-center text-gray-600 max-w-xs"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: .3 }}
      >
        <motion.p
          className="text-lg font-semibold mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: .2 }}
        >
          Feeling overwhelmed? 
        </motion.p>
        <motion.p
          className="text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: .2 }}
        >
          Let me help you decide!
        </motion.p>
      </motion.div>
      
      {/* Pulsing "thinking" dots */}
      <div className="flex gap-1 mt-4">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-purple-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: .6,
              repeat: Infinity,
              delay: index * 0.1
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}