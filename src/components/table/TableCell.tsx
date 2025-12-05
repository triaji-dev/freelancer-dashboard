import React, {  useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Column, Row } from './types';
import { STATUS_OPTIONS, CATEGORY_OPTIONS } from './types';

interface TableCellProps {
  row: Row;
  column: Column;
  isEditing: boolean;
  darkMode: boolean;
  onUpdate: (value: string) => void;
  onEditStart: () => void;
  onEditEnd: () => void;
}

export const TableCell: React.FC<TableCellProps> = ({
  row,
  column,
  isEditing,
  darkMode,
  onUpdate,
  onEditStart,
  onEditEnd,
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const getStatusColor = (status?: string): string => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";
    switch (status?.toLowerCase()) {
      case 'active': return `${base} bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20`;
      case 'submitted': return `${base} bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20`;
      case 'canceled': return `${base} bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/50`;
      case 'bookmarked': return `${base} bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20`;
      case 'watchlisted': return `${base} bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20`;
      default: return `${base} bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/50`;
    }
  };

  const getCategoryColor = (category?: string): string => {
    const base = "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium";
    switch (category?.toLowerCase()) {
      case 'project': return `${base} bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400`;
      case 'contest': return `${base} bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400`;
      default: return `${base} bg-zinc-50 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400`;
    }
  };

  const commonInputClasses = `w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${darkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-white border-zinc-200 text-zinc-900'}`;

  if (isEditing) {
    if (column.type === 'status') {
      return (
        <div className="flex items-center h-full">
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            defaultValue={String(row[column.id] || '')}
            onChange={(e) => {
              onUpdate(e.target.value);
              onEditEnd();
            }}
            onBlur={(e) => {
              onUpdate(e.target.value);
              onEditEnd();
            }}
            className={commonInputClasses}
          >
            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      );
    }
    
    if (column.type === 'category') {
      return (
        <div className="flex items-center h-full">
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            defaultValue={String(row[column.id] || '')}
            onChange={(e) => {
              onUpdate(e.target.value);
              onEditEnd();
            }}
            onBlur={(e) => {
              onUpdate(e.target.value);
              onEditEnd();
            }}
            className={commonInputClasses}
          >
            {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      );
    }

    return (
      <div className="flex items-center h-full">
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={column.type === 'date' ? 'date' : 'text'}
          defaultValue={String(row[column.id] || '')}
          onBlur={(e) => {
            onUpdate(e.target.value);
            onEditEnd();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onUpdate(e.currentTarget.value);
              onEditEnd();
            }
          }}
          className={commonInputClasses}
        />
      </div>
    );
  }

  // View Mode
  return (
    <div 
      onClick={onEditStart}
      className="cursor-pointer h-full flex items-center"
    >
      {column.type === 'link' && row[column.id] ? (
        <a 
          href={String(row[column.id] || '#')} 
          target="_blank" 
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()} 
          className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium text-sm hover:underline underline-offset-4"
        >
          Link <ExternalLink size={12} />
        </a>
      ) : column.type === 'status' ? (
        <span className={getStatusColor(String(row[column.id] || ''))}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            String(row[column.id] || '')?.toLowerCase() === 'active' ? 'bg-blue-500' :
            String(row[column.id] || '')?.toLowerCase() === 'submitted' ? 'bg-emerald-500' :
            String(row[column.id] || '')?.toLowerCase() === 'canceled' ? 'bg-zinc-500' :
            String(row[column.id] || '')?.toLowerCase() === 'bookmarked' ? 'bg-violet-500' :
            String(row[column.id] || '')?.toLowerCase() === 'watchlisted' ? 'bg-amber-500' :
            'bg-zinc-400'
          }`}></span>
          {row[column.id] || 'Watchlisted'}
        </span>
      ) : column.type === 'category' ? (
        <span className={getCategoryColor(String(row[column.id] || ''))}>
          {row[column.id] || 'Project'}
        </span>
      ) : (
        <span className={!row[column.id] ? 'text-zinc-500 dark:text-zinc-700 text-sm italic' : 'text-zinc-700 dark:text-zinc-500 font-medium'}>
          {row[column.id] || 'Empty'}
        </span>
      )}
    </div>
  );
};
