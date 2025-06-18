'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FiChevronDown } from 'react-icons/fi';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: SelectOption) => {
    setSelectedValue(option.value);
    onChange?.(option.value);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === selectedValue);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between rounded-xl border bg-white dark:bg-gray-900 px-4 py-3 text-left transition-all duration-200',
          'border-gray-300 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-400',
          'focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-400/20',
          isOpen && 'border-amber-500 dark:border-amber-400'
        )}
      >
        <span className={cn(
          selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
        )}>
          {selectedOption?.label || placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl"
          >
            <div className="max-h-60 overflow-auto py-1">
              {options.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  whileHover={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'w-full px-4 py-2 text-left transition-colors',
                    'hover:text-amber-600 dark:hover:text-amber-400',
                    selectedValue === option.value && 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                  )}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};