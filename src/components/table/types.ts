export type ColumnType = 'text' | 'link' | 'date' | 'status' | 'category';

export interface Column {
  id: string;
  title: string;
  type: ColumnType;
}

export interface Row {
  id: string;
  archived?: boolean;
  [key: string]: string | boolean | undefined;
}

export interface EditingCell {
  rowId: string;
  colId: string;
}

export interface SortConfig {
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export type StatusOption = 'Watchlisted' | 'Active' | 'Submitted' | 'Canceled' | 'Bookmarked';
export type CategoryOption = 'Project' | 'Contest';

export const STATUS_OPTIONS: StatusOption[] = ['Watchlisted', 'Active', 'Submitted', 'Canceled', 'Bookmarked'];
export const CATEGORY_OPTIONS: CategoryOption[] = ['Project', 'Contest'];
