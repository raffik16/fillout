/**
 * Form builder type definitions
 */

export type PageState = 'focused' | 'default' | 'hover';

export interface FormPage {
  id: string;
  title: string;
  type: 'info' | 'details' | 'other' | 'ending';
  isActive?: boolean;
}

export interface SectionDetailProps {
  page: FormPage;
  state: PageState;
  onMenuOpen?: () => void;
}

export interface SectionLegendProps {
  pages: FormPage[];
  activePageId?: string;
  onPageSelect: (pageId: string) => void;
  onPageAdd: (afterPageId?: string) => void;
  onPageReorder: (draggedId: string, targetId: string) => void;
  onPageDelete?: (pageId: string) => void;
}

export interface AddPageButtonProps {
  onClick: () => void;
  isInline?: boolean;
}

export interface PageItemProps {
  page: FormPage;
  isActive: boolean;
  isDragging?: boolean;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}