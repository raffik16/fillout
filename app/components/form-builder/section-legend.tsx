'use client';

/**
 * Section legend component - Form page navigation with drag/drop
 */

import React, { useState, useRef } from 'react';
import { SectionLegendProps, FormPage } from '@/app/types/form-builder';
import { getPageIcon, PlusIcon } from './icons';
import styles from './section-legend.module.css';

export const SectionLegend: React.FC<SectionLegendProps> = ({
  pages,
  activePageId,
  onPageSelect,
  onPageAdd,
  onPageReorder,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [showAddBetween, setShowAddBetween] = useState<string | null>(null);
  const dragCounter = useRef(0);

  const handleDragStart = (e: React.DragEvent, pageId: string) => {
    setDraggedId(pageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTargetId(null);
    dragCounter.current = 0;
  };

  const handleDragEnter = (e: React.DragEvent, pageId: string) => {
    e.preventDefault();
    dragCounter.current++;
    if (draggedId && draggedId !== pageId) {
      setDropTargetId(pageId);
    }
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDropTargetId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== targetId) {
      onPageReorder(draggedId, targetId);
    }
    handleDragEnd();
  };

  const handleMouseEnterGap = (pageId: string) => {
    if (!draggedId) {
      setShowAddBetween(pageId);
    }
  };

  const handleMouseLeaveGap = () => {
    setShowAddBetween(null);
  };

  return (
    <div className={styles.container}>
      {pages.map((page, index) => {
        const Icon = getPageIcon(page.type);
        const isActive = page.id === activePageId;
        const isDragging = page.id === draggedId;
        const isDropTarget = page.id === dropTargetId;

        return (
          <React.Fragment key={page.id}>
            {index === 0 && (
              <div
                className={styles.gap}
                onMouseEnter={() => handleMouseEnterGap('start')}
                onMouseLeave={handleMouseLeaveGap}
              >
                {showAddBetween === 'start' && (
                  <button
                    className={styles.addBetween}
                    onClick={() => onPageAdd()}
                    aria-label="Add page here"
                  >
                    <PlusIcon size={16} />
                  </button>
                )}
              </div>
            )}

            <div
              className={`
                ${styles.page}
                ${isActive ? styles.active : ''}
                ${isDragging ? styles.dragging : ''}
                ${isDropTarget ? styles.dropTarget : ''}
              `}
              draggable
              onClick={() => onPageSelect(page.id)}
              onDragStart={(e) => handleDragStart(e, page.id)}
              onDragEnd={handleDragEnd}
              onDragEnter={(e) => handleDragEnter(e, page.id)}
              onDragLeave={handleDragLeave}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, page.id)}
            >
              <Icon className={styles.icon} size={16} />
              <span className={styles.title}>{page.title}</span>
            </div>

            <div
              className={styles.gap}
              onMouseEnter={() => handleMouseEnterGap(page.id)}
              onMouseLeave={handleMouseLeaveGap}
            >
              {showAddBetween === page.id && (
                <button
                  className={styles.addBetween}
                  onClick={() => onPageAdd(page.id)}
                  aria-label="Add page here"
                >
                  <PlusIcon size={16} />
                </button>
              )}
            </div>
          </React.Fragment>
        );
      })}

      <button
        className={styles.addPage}
        onClick={() => onPageAdd()}
        aria-label="Add new page"
      >
        <PlusIcon size={16} />
        <span>Add page</span>
      </button>
    </div>
  );
};