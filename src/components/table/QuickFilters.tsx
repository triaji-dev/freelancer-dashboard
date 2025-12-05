import React from 'react';
import { FilterX } from 'lucide-react';
import type { Column } from './types';
import { STATUS_OPTIONS, CATEGORY_OPTIONS } from './types';

interface QuickFiltersProps {
  columns: Column[];
  filters: Record<string, string>;
  darkMode: boolean;
  onQuickFilter: (type: 'category' | 'status', value: string) => void;
  onClearFilters: () => void;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  columns,
  filters,
  darkMode,
  onQuickFilter,
  onClearFilters,
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <span className={`text-xs font-semibold uppercase tracking-wider mr-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
          Quick Filters:
        </span>
        
        {/* Category Filters */}
        {CATEGORY_OPTIONS.map(cat => {
          const catCol = columns.find(c => c.type === 'category');
          const isActive = catCol && filters[catCol.id] === cat;
          return (
            <button
              key={cat}
              onClick={() => onQuickFilter('category', cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
                isActive 
                  ? 'bg-zinc-900 text-zinc-500 border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100' 
                  : `bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 ${darkMode ? 'border-zinc-400 text-zinc-400' : 'border-zinc-200 text-zinc-600'}`
              }`}
            >
              {cat}
            </button>
          );
        })}

        <div className={`w-px h-4 mx-2 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />

        {/* Status Filters */}
        {STATUS_OPTIONS.map(status => {
          const statusCol = columns.find(c => c.type === 'status');
          const isActive = statusCol && filters[statusCol.id] === status;
          
          let activeStyle = '';
          if (isActive) {
            switch (status.toLowerCase()) {
              case 'active': activeStyle = 'bg-blue-600 text-white border-blue-600'; break;
              case 'submitted': activeStyle = 'bg-emerald-600 text-white border-emerald-600'; break;
              case 'canceled': activeStyle = 'bg-zinc-600 text-white border-zinc-600'; break;
              case 'bookmarked': activeStyle = 'bg-violet-600 text-white border-violet-600'; break;
              case 'watchlisted': activeStyle = 'bg-amber-600 text-white border-amber-600'; break;
              default: activeStyle = 'bg-zinc-900 text-white border-zinc-900';
            }
          }

          return (
            <button
              key={status}
              onClick={() => onQuickFilter('status', status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
                isActive 
                  ? activeStyle
                  : `bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 ${darkMode ? 'border-zinc-400 text-zinc-400' : 'border-zinc-200 text-zinc-600'}`
              }`}
            >
              {status}
            </button>
          );
        })}

        <div className={`w-px h-4 mx-2 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />

        {/* Reset */}
        <button
          onClick={onClearFilters}
          disabled={Object.keys(filters).length === 0}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 flex items-center gap-1.5 ${
            Object.keys(filters).length === 0
              ? `opacity-50 cursor-not-allowed ${darkMode ? 'border-zinc-400 text-zinc-400' : 'border-zinc-100 text-zinc-500'}`
              : `hover:bg-rose-50 dark:hover:bg-rose-900/50 hover:border-rose-200 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 ${darkMode ? 'border-zinc-400 text-zinc-400' : 'border-zinc-200 text-zinc-600'}`
          }`}
        >
          <FilterX size={12} />
          Reset
        </button>
      </div>
    </div>
  );
};
