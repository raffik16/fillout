'use client';

/**
 * Section settings dropdown menu component
 */

import React, { useEffect, useRef } from 'react';
import { SectionSettingsProps } from '@/app/types/form-builder';
import styles from './section-settings.module.css';

export const SectionSettings: React.FC<SectionSettingsProps> = ({
  onClose,
  onSetFirst,
  onRename,
  onCopy,
  onDuplicate,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAction = (action: (() => void) | undefined) => {
    if (action) {
      action();
      onClose();
    }
  };

  return (
    <div ref={menuRef} className={styles.menu}>
      <button 
        className={styles.menuItem} 
        onClick={() => handleAction(onSetFirst)}
      >
        <span className={styles.icon}>📄</span>
        <span>Set as first page</span>
      </button>
      
      <button 
        className={styles.menuItem} 
        onClick={() => handleAction(onRename)}
      >
        <span className={styles.icon}>✏️</span>
        <span>Rename</span>
      </button>
      
      <button 
        className={styles.menuItem} 
        onClick={() => handleAction(onCopy)}
      >
        <span className={styles.icon}>📋</span>
        <span>Copy</span>
      </button>
      
      <button 
        className={styles.menuItem} 
        onClick={() => handleAction(onDuplicate)}
      >
        <span className={styles.icon}>📋</span>
        <span>Duplicate</span>
      </button>
      
      <button 
        className={`${styles.menuItem} ${styles.danger}`} 
        onClick={() => handleAction(onDelete)}
      >
        <span className={styles.icon}>🗑️</span>
        <span>Delete</span>
      </button>
    </div>
  );
};