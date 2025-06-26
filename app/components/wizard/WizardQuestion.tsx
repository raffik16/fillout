'use client';

import { motion } from 'framer-motion';
import { WizardQuestion as WizardQuestionType } from '@/app/types/wizard';

interface WizardQuestionProps {
  question: WizardQuestionType;
  onAnswer: (value: string) => void;
}

export default function WizardQuestion({ question, onAnswer }: WizardQuestionProps) {
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold mb-2 text-gray-800">
        {question.title}
      </h2>
      {question.subtitle && (
        <p className="text-lg text-gray-600 mb-8">{question.subtitle}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {question.options.map((option, index) => (
          <motion.button
            key={option.value}
            onClick={() => onAnswer(option.value)}
            className="bg-white rounded-2xl p-6 transition-all transform hover:scale-105 border-2 border-transparent hover:border-orange-300"
            transition={{ delay: index * 0.175 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-5xl mb-3">{option.emoji}</div>
            <div className="font-semibold text-gray-800">{option.label}</div>
            {option.description && (
              <div className="text-sm text-gray-600 mt-1">{option.description}</div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}