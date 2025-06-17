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
  onPageRename,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [showAddBetween, setShowAddBetween] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [dragOverGap, setDragOverGap] = useState<string | null>(null);
  const dragCounter = useRef(0);
  const editInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (e: React.DragEvent, pageId: string) => {
    setDraggedId(pageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTargetId(null);
    setDragOverGap(null);
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

  const handleDoubleClick = (page: FormPage) => {
    setEditingId(page.id);
    setEditValue(page.title);
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 0);
  };

  const handleRenameSubmit = () => {
    if (editingId && editValue.trim() && onPageRename) {
      onPageRename(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditValue('');
    }
  };

  const handleGapDragEnter = (e: React.DragEvent, gapId: string) => {
    e.preventDefault();
    if (draggedId) {
      setDragOverGap(gapId);
    }
  };

  const handleGapDragLeave = () => {
    setDragOverGap(null);
  };

  const handleGapDrop = (e: React.DragEvent, afterPageId?: string) => {
    e.preventDefault();
    if (draggedId) {
      const draggedIndex = pages.findIndex(p => p.id === draggedId);
      let targetIndex = afterPageId 
        ? pages.findIndex(p => p.id === afterPageId) + 1
        : 0;
      
      if (draggedIndex < targetIndex) {
        targetIndex--;
      }
      
      if (draggedIndex !== targetIndex) {
        const targetId = pages[targetIndex]?.id || pages[pages.length - 1].id;
        onPageReorder(draggedId, targetId);
      }
    }
    handleDragEnd();
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
                className={`${styles.gap} ${dragOverGap === 'start' ? styles.dragOver : ''}`}
                onMouseEnter={() => handleMouseEnterGap('start')}
                onMouseLeave={handleMouseLeaveGap}
                onDragEnter={(e) => handleGapDragEnter(e, 'start')}
                onDragLeave={handleGapDragLeave}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleGapDrop(e)}
              >
                <div className={styles.separator} />
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
              draggable={editingId !== page.id}
              onClick={() => editingId !== page.id && onPageSelect(page.id)}
              onDoubleClick={() => handleDoubleClick(page)}
              onDragStart={(e) => handleDragStart(e, page.id)}
              onDragEnd={handleDragEnd}
              onDragEnter={(e) => handleDragEnter(e, page.id)}
              onDragLeave={handleDragLeave}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, page.id)}
            >
              <Icon className={styles.icon} size={16} />
              {editingId === page.id ? (
                <input
                  ref={editInputRef}
                  className={styles.editInput}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={handleRenameKeyDown}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className={styles.title}>{page.title}</span>
              )}
            </div>

            <div
              className={`${styles.gap} ${dragOverGap === page.id ? styles.dragOver : ''}`}
              onMouseEnter={() => handleMouseEnterGap(page.id)}
              onMouseLeave={handleMouseLeaveGap}
              onDragEnter={(e) => handleGapDragEnter(e, page.id)}
              onDragLeave={handleGapDragLeave}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleGapDrop(e, page.id)}
            >
              <div className={styles.separator} />
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