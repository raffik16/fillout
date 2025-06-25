'use client';

import { RefreshCw } from 'lucide-react';

export default function ResetWizard() {
  const handleReset = () => {
    localStorage.removeItem('wizardCompleted');
    localStorage.removeItem('wizardPreferences');
    window.location.reload();
  };

  return (
    <button
      onClick={handleReset}
      className="fixed bottom-4 right-4 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-colors z-50"
      title="Reset wizard and preferences"
    >
      <RefreshCw className="w-6 h-6" />
    </button>
  );
}