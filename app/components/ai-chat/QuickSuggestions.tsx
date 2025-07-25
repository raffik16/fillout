'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuickSuggestionsProps {
  onSelect: (suggestion: string) => void;
  className?: string;
}

const suggestions = [
  {
    text: "I like smoky cocktails",
    icon: "🥃",
  },
  {
    text: "Surprise me with something unique",
    icon: "✨",
  },
  {
    text: "What's good for a celebration?",
    icon: "🎉",
  },
  {
    text: "I prefer non-alcoholic drinks",
    icon: "🍹",
  },
  {
    text: "Show me something with whiskey",
    icon: "🥃",
  },
  {
    text: "What pairs well with dinner?",
    icon: "🍽️",
  },
];

export const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({ onSelect, className }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('p-4', className)}
    >
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
        Try asking me:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            variants={itemVariants}
            onClick={() => onSelect(suggestion.text)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm text-left',
              'bg-white dark:bg-gray-800 rounded-lg',
              'border border-gray-200 dark:border-gray-700',
              'hover:bg-gray-50 dark:hover:bg-gray-750',
              'hover:border-purple-300 dark:hover:border-purple-600',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
              'dark:focus:ring-offset-gray-900'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-lg" role="img" aria-label={suggestion.text}>
              {suggestion.icon}
            </span>
            <span className="text-gray-700 dark:text-gray-300">{suggestion.text}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};