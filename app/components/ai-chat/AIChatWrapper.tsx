'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { AIChatInterface } from './AIChatInterface';
import { ChatToggle } from './ChatToggle';

interface AIChatWrapperProps {
  className?: string;
}

export interface AIChatWrapperRef {
  toggleChat: () => void;
}

export const AIChatWrapper = forwardRef<AIChatWrapperRef, AIChatWrapperProps>(({ className }, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  useImperativeHandle(ref, () => ({
    toggleChat: handleToggle,
  }));

  return (
    <div className={className}>
      <ChatToggle isOpen={isOpen} onClick={handleToggle} />
      <AIChatInterface isOpen={isOpen} onClose={handleClose} />
    </div>
  );
});

AIChatWrapper.displayName = 'AIChatWrapper';