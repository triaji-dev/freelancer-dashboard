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
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
          Quick Filters
        </span>
        {Object.keys(filters).length > 0 && (
          <button
            onClick={onClearFilters}
            className={`text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer px-2 py-1 rounded-lg ${
              darkMode 
                ? 'text-rose-400 hover:bg-rose-900/30' 
                : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <FilterX size={12} />
            Reset All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Helper to check if active */}
        {(() => {
          const categoryCol = columns.find(c => c.type === 'category');
          const statusCol = columns.find(c => c.type === 'status');
          
          return (
            <div className="space-y-6">
              {/* Categories Section */}
              <div className="space-y-2">
                <h3 className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  By Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map(cat => {
                    const isActive = categoryCol && filters[categoryCol.id] === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => onQuickFilter('category', cat)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer ${
                          isActive 
                            ? 'bg-blue-500 text-white border-blue-500 dark:bg-blue-600 dark:border-blue-600 shadow-sm' 
                            : `bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 ${darkMode ? 'border-zinc-700 text-zinc-400 bg-zinc-800/30' : 'border-zinc-200 text-zinc-600 bg-white'}`
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-2">
                <h3 className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  By Status
                </h3>
                <div className="flex flex-wrap gap-2">
                   {STATUS_OPTIONS.map(status => {
                    const isActive = statusCol && filters[statusCol.id] === status;
                    
                    let activeStyle = '';
                    if (isActive) {
                      switch (status.toLowerCase()) {
                        case 'active': activeStyle = 'bg-blue-600 text-white border-blue-600 shadow-sm'; break;
                        case 'submitted': activeStyle = 'bg-emerald-600 text-white border-emerald-600 shadow-sm'; break;
                        case 'canceled': activeStyle = 'bg-red-600 text-white border-red-600 shadow-sm'; break;
                        case 'bookmarked': activeStyle = 'bg-violet-600 text-white border-violet-600 shadow-sm'; break;
                        case 'watchlisted': activeStyle = 'bg-amber-600 text-white border-amber-600 shadow-sm'; break;
                        default: activeStyle = 'bg-zinc-900 text-white border-zinc-900';
                      }
                    } else {
                       activeStyle = `bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 ${darkMode ? 'border-zinc-700 text-zinc-400 bg-zinc-800/30' : 'border-zinc-200 text-zinc-600 bg-white'}`;
                    }
                    
                    // Simple dot indicator for status
                    const getStatusColor = (s: string) => {
                      switch (s.toLowerCase()) {
                        case 'active': return 'bg-blue-500';
                        case 'submitted': return 'bg-emerald-500';
                        case 'canceled': return 'bg-red-500';
                        case 'bookmarked': return 'bg-violet-500';
                        case 'watchlisted': return 'bg-amber-500';
                        default: return 'bg-zinc-500';
                      }
                    };

                    return (
                      <button
                        key={status}
                        onClick={() => onQuickFilter('status', status)}
                        className={`pl-2 pr-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                          isActive ? activeStyle : activeStyle
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(status)} ${isActive ? 'bg-white' : ''}`}></span>
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
