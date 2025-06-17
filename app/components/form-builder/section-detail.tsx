'use client';

/**
 * Section detail component showing individual page states
 */

import React, { useState } from 'react';
import { SectionDetailProps } from '@/app/types/form-builder';
import { getPageIcon, MoreIcon } from './icons';
import styles from './section-detail.module.css';

export const SectionDetail: React.FC<SectionDetailProps> = ({
  page,
  state,
  onMenuOpen,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = getPageIcon(page.type);

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
    onMenuOpen?.();
  };

  const getStateClass = () => {
    switch (state) {
      case 'focused':
        return styles.focused;
      case 'hover':
        return styles.hover;
      default:
        return styles.default;
    }
  };

  return (
    <div className={`${styles.container} ${getStateClass()}`}>
      <div className={styles.content}>
        <Icon className={styles.icon} size={16} />
        <span className={styles.title}>{page.title}</span>
      </div>
      
      <button
        className={styles.menuBtn}
        onClick={handleMenuClick}
        aria-label="Page options"
      >
        <MoreIcon size={16} />
      </button>

      {showMenu && (
        <div className={styles.menu}>
          <div className={styles.menuItem}>
            <span className={styles.menuIcon}>📄</span>
            Set as first page
          </div>
          <div className={styles.menuItem}>
            <span className={styles.menuIcon}>✏️</span>
            Rename
          </div>
          <div className={styles.menuItem}>
            <span className={styles.menuIcon}>📋</span>
            Copy
          </div>
          <div className={styles.menuItem}>
            <span className={styles.menuIcon}>📋</span>
            Duplicate
          </div>
          <div className={`${styles.menuItem} ${styles.danger}`}>
            <span className={styles.menuIcon}>🗑️</span>
            Delete
          </div>
        </div>
      )}
    </div>
  );
};