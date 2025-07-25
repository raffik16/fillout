'use client';

import { motion } from 'framer-motion';

export default function LoadingMatch() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-rose-50 flex flex-col items-center justify-center">
      <motion.div
        animate={{
          rotate: [0, 10, -10, 10, 0],
          scale: [1, 1.1, 1, 1.1, 1]
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-6xl mb-8"
      >
        🍹
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-gray-800 mb-4"
      >
        Mixing your perfect match...
      </motion.h2>
      
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-purple-400 rounded-full"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
}