'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface ChatToggleProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export const ChatToggle: React.FC<ChatToggleProps> = ({ isOpen, onClick, className }) => {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg hover:shadow-xl transition-shadow',
        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
        className
      )}
      whileHover={{ 
        scale: 1.05,
        transition: { type: "spring", stiffness: 300, damping: 15 }
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { type: "spring", stiffness: 400, damping: 20 }
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 25 }}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiX className="w-6 h-6" />
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiMessageCircle className="w-6 h-6" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Pulsing ring animation when closed */}
      {!isOpen && (
        <motion.div
          className="absolute inset-0 rounded-full bg-purple-500/30"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{
            scale: [1, 1.5, 1], // Scale from 1 to 1.5 and back
            opacity: [0.5, 0.2, 0.5], // Fade from 0.5 to 0.2 and back
          }}
          transition={{
            duration: 2, // Duration of one cycle
            repeat: Infinity, // Repeat indefinitely
            repeatType: 'loop', // Seamless looping
            ease: 'easeInOut', // Smooth easing
          }}
        />
      )}
    </motion.button>
  );
};