'use client';

/**
 * Form builder components demo page
 */

import React, { useState } from 'react';
import {
  SectionLegend,
  FormPage,
  SettingsPosition,
  SectionSettings,
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
  const [activePageId, setActivePageId] = useState<string | undefined>(undefined);
  const [settingsPageId, setSettingsPageId] = useState<string | null>(null);
  const [settingsPosition, setSettingsPosition] = useState<SettingsPosition>({ x: 0, y: 0 });
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

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

  const handlePageSetFirst = (pageId: string) => {
    const pageIndex = pages.findIndex(p => p.id === pageId);
    if (pageIndex > 0) {
      const newPages = [...pages];
      const [page] = newPages.splice(pageIndex, 1);
      newPages.unshift(page);
      setPages(newPages);
    }
  };

  const handleSettingsClick = (pageId: string | null, position?: SettingsPosition) => {
    setSettingsPageId(pageId);
    if (position) {
      setSettingsPosition(position);
    }
  };

  const handleRenameStart = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      setRenamingPageId(pageId);
      setRenameValue(page.title);
      setSettingsPageId(null);
    }
  };

  const handleRenameSubmit = () => {
    if (renamingPageId && renameValue.trim()) {
      setPages(pages.map(page => 
        page.id === renamingPageId ? { ...page, title: renameValue.trim() } : page
      ));
    }
    setRenamingPageId(null);
    setRenameValue('');
  };

  const handleRenameCancel = () => {
    setRenamingPageId(null);
    setRenameValue('');
  };

  const handlePageCopy = (pageId: string) => {
    console.log('Copy page:', pageId);
  };

  const handlePageDuplicate = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      const newPage: FormPage = {
        ...page,
        id: `page-${Date.now()}`,
        title: `${page.title} (Copy)`,
      };
      const pageIndex = pages.findIndex(p => p.id === pageId);
      const newPages = [...pages];
      newPages.splice(pageIndex + 1, 0, newPage);
      setPages(newPages);
    }
  };

  const handlePageDelete = (pageId: string) => {
    setPages(pages.filter(p => p.id !== pageId));
    if (activePageId === pageId) {
      setActivePageId(undefined);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fillout</h1>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Form Legend</h2>
        <p className={styles.description}>
          Click pages to navigate, drag to reorder, hover gaps to add pages, click page to reveal settings menu
        </p>
        <div className={styles.legendDemo}>
          <SectionLegend
            pages={pages}
            activePageId={activePageId}
            settingsPageId={settingsPageId}
            renamingPageId={renamingPageId}
            renameValue={renameValue}
            onPageSelect={setActivePageId}
            onPageAdd={handlePageAdd}
            onPageReorder={handlePageReorder}
            onSettingsClick={handleSettingsClick}
            onRenameChange={setRenameValue}
            onRenameSubmit={handleRenameSubmit}
            onRenameCancel={handleRenameCancel}
          />
          
          {settingsPageId && (
            <div 
              className={styles.settingsPortal}
              style={{
                position: 'fixed',
                left: settingsPosition.x,
                top: settingsPosition.y,
                zIndex: 1000
              }}
            >
              <SectionSettings
                pageId={settingsPageId}
                onClose={() => setSettingsPageId(null)}
                onSetFirst={() => {
                  handlePageSetFirst(settingsPageId);
                  setSettingsPageId(null);
                }}
                onRename={() => handleRenameStart(settingsPageId)}
                onCopy={() => {
                  handlePageCopy(settingsPageId);
                  setSettingsPageId(null);
                }}
                onDuplicate={() => {
                  handlePageDuplicate(settingsPageId);
                  setSettingsPageId(null);
                }}
                onDelete={() => {
                  handlePageDelete(settingsPageId);
                  setSettingsPageId(null);
                }}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}