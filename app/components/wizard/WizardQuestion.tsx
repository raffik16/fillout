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

      <div className={`grid gap-4 ${question.id === 'category' && question.options.length === 7 ? 'grid-cols-2 md:grid-cols-2' : question.options.length === 6 ? 'grid-cols-2' : question.options.length > 4 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'}`}>
        {question.options.map((option, index) => {
          const isFeatured = option.value === 'featured';
          const isLastItem = question.id === 'category' && index === question.options.length - 1;
          
          return (
            <motion.button
              key={option.value}
              onClick={() => onAnswer(option.value)}
              className={`
                ${isFeatured 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600' 
                  : 'bg-white hover:border-orange-300'
                } 
                rounded-2xl p-6 transition-all transform hover:scale-105 border-2 
                ${isFeatured ? 'border-transparent' : 'border-transparent'}
                ${isLastItem ? 'col-span-2 md:col-span-2' : ''}
              `}
              transition={{ delay: index * 0.175 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`${isLastItem ? 'flex items-center justify-center gap-4' : ''}`}>
                <div className={`${isLastItem ? 'text-4xl' : 'text-5xl mb-3'}`}>{option.emoji}</div>
                <div className={`font-semibold ${isFeatured ? 'text-white' : 'text-gray-800'} ${isLastItem ? 'text-lg' : ''}`}>
                  {option.label}
                </div>
              </div>
              {option.description && (
                <div className={`text-sm ${isFeatured ? 'text-purple-100' : 'text-gray-600'} mt-1`}>
                  {option.description}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}