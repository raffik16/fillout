'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AllergyType } from '@/app/types/wizard';
import { X } from 'lucide-react';

interface AllergiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAllergies: AllergyType[];
  onUpdate: (allergies: AllergyType[]) => void;
}

const allergyOptions = [
  { value: 'none', label: 'No Allergies', emoji: '✅', description: 'Safe to enjoy all drinks' },
  { value: 'gluten', label: 'Gluten', emoji: '🌾', description: 'Wheat, barley, rye, and malt' },
  { value: 'dairy', label: 'Dairy', emoji: '🥛', description: 'Milk, cream, cheese, and dairy products' },
  { value: 'nuts', label: 'Nuts', emoji: '🥜', description: 'Tree nuts, peanuts, and nut-based ingredients' },
  { value: 'eggs', label: 'Eggs', emoji: '🥚', description: 'Egg whites, yolks, and egg-based products' },
  { value: 'soy', label: 'Soy', emoji: '🫘', description: 'Soy sauce, soy lecithin, and soy-based products' }
];

export default function AllergiesModal({ isOpen, onClose, currentAllergies, onUpdate }: AllergiesModalProps) {
  const [selectedAllergies, setSelectedAllergies] = useState<AllergyType[]>(currentAllergies);
  const [hasChanges, setHasChanges] = useState(false);

  const handleAllergyToggle = (allergyValue: AllergyType) => {
    let newAllergies: AllergyType[];
    
    if (allergyValue === 'none') {
      // If "none" is selected, clear all other allergies
      newAllergies = ['none'];
    } else {
      // Remove 'none' if it exists and toggle the selected allergy
      const filteredAllergies = selectedAllergies.filter(a => a !== 'none');
      
      if (filteredAllergies.includes(allergyValue)) {
        // Remove the allergy if it's already selected
        newAllergies = filteredAllergies.filter(a => a !== allergyValue);
        // If no allergies left, default to 'none'
        if (newAllergies.length === 0) {
          newAllergies = ['none'];
        }
      } else {
        // Add the allergy
        newAllergies = [...filteredAllergies, allergyValue];
      }
    }
    
    setSelectedAllergies(newAllergies);
    
    // Check if there are changes
    const hasChanged = JSON.stringify(newAllergies.sort()) !== JSON.stringify(currentAllergies.sort());
    setHasChanges(hasChanged);
  };

  const handleSave = () => {
    onUpdate(selectedAllergies);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setSelectedAllergies(currentAllergies);
    setHasChanges(false);
    onClose();
  };

  const isSelected = (allergyValue: AllergyType) => {
    return selectedAllergies.includes(allergyValue);
  };

  const getSelectionSummary = () => {
    if (selectedAllergies.length === 0 || (selectedAllergies.length === 1 && selectedAllergies[0] === 'none')) {
      return 'No allergies selected';
    }
    
    const nonNoneAllergies = selectedAllergies.filter(a => a !== 'none');
    if (nonNoneAllergies.length === 1) {
      return `1 allergy selected`;
    }
    return `${nonNoneAllergies.length} allergies selected`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Adjust Allergies</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {getSelectionSummary()}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Select all allergies that apply to you. We'll exclude drinks containing these ingredients to keep you safe.
              </p>

              <div className="space-y-3">
                {allergyOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleAllergyToggle(option.value as AllergyType)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                      isSelected(option.value as AllergyType)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{option.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800">{option.label}</h3>
                          {isSelected(option.value as AllergyType) && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Multiple allergies info */}
              {selectedAllergies.filter(a => a !== 'none').length > 1 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Multiple allergies selected:</strong> We'll exclude drinks containing ANY of your selected allergens.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
                  hasChanges
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {hasChanges ? 'Update Allergies' : 'No Changes'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}