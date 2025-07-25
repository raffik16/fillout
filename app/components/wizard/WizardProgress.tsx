'use client';

import { motion } from 'framer-motion';

interface WizardProgressProps {
  current: number;
  total: number;
}

export default function WizardProgress({ current, total }: WizardProgressProps) {
  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {Array.from({ length: total }).map((_, index) => (
        <motion.div
          key={index}
          className={`h-2 rounded-full transition-all duration-300 ${
            index <= current
              ? 'bg-purple-400 w-8'
              : 'bg-gray-300 w-2'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 }}
        />
      ))}
    </div>
  );
}