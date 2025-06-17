'use client';

/**
 * Form builder components demo page
 */

import React, { useState } from 'react';
import {
  SectionLegend,
  FormPage,
} from '@/app/components/form-builder';
import styles from './page.module.css';

const mockPages: FormPage[] = [
  { id: '1', title: 'Info', type: 'info' },
  { id: '2', title: 'Details', type: 'details' },
  { id: '3', title: 'Other', type: 'other' },
  { id: '4', title: 'Ending', type: 'ending' },
];

export default function FormBuilderDemo() {
  const [pages, setPages] = useState<FormPage[]>(mockPages);
  const [activePageId, setActivePageId] = useState<string>('1');

  const handlePageAdd = (afterPageId?: string) => {
    const newPage: FormPage = {
      id: `page-${Date.now()}`,
      title: 'New Page',
      type: 'other',
    };

    if (afterPageId) {
      const index = pages.findIndex(p => p.id === afterPageId);
      const newPages = [...pages];
      newPages.splice(index + 1, 0, newPage);
      setPages(newPages);
    } else {
      setPages([...pages, newPage]);
    }
  };

  const handlePageReorder = (draggedId: string, targetId: string) => {
    const draggedIndex = pages.findIndex(p => p.id === draggedId);
    const targetIndex = pages.findIndex(p => p.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newPages = [...pages];
    const [draggedPage] = newPages.splice(draggedIndex, 1);
    newPages.splice(targetIndex, 0, draggedPage);
    setPages(newPages);
  };

  const handlePageRename = (pageId: string, newTitle: string) => {
    setPages(pages.map(page => 
      page.id === pageId ? { ...page, title: newTitle } : page
    ));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Form Builder Components</h1>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Form Legend</h2>
        <p className={styles.description}>
          Navigate between pages, drag to reorder, hover between pages to add new ones, double-click to rename
        </p>
        <div className={styles.legendDemo}>
          <SectionLegend
            pages={pages}
            activePageId={activePageId}
            onPageSelect={setActivePageId}
            onPageAdd={handlePageAdd}
            onPageReorder={handlePageReorder}
            onPageRename={handlePageRename}
          />
        </div>
      </section>
    </div>
  );
}