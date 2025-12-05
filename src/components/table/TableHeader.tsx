import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, X, Filter } from 'lucide-react';
import type { Column, SortConfig } from './types';

interface TableHeaderProps {
  columns: Column[];
  filters: Record<string, string>;
  sortConfig: SortConfig | null;
  showFilters: boolean;
  darkMode: boolean;
  onSort: (columnId: string) => void;
  onUpdateHeader: (columnId: string, newTitle: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onFilterChange: (columnId: string, value: string) => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  filters,
  sortConfig,
  showFilters,
  darkMode,
  onSort,
  onUpdateHeader,
  onDeleteColumn,
  onFilterChange,
}) => {
  const [editingHeader, setEditingHeader] = useState<string | null>(null);

  const getWidthClass = (colId: string): string => {
    if (colId === 'col_1') return 'w-[300px]';
    if (colId === 'col_cat') return 'w-[120px]';
    if (colId === 'col_2') return 'w-[80px]';
    if (colId === 'col_3') return 'w-[160px]'; 
    if (colId === 'col_4') return 'w-[120px]'; 
    return 'w-[150px]';
  };

  return (
    <thead>
      <tr className={`h-12 border-b text-xs font-semibold uppercase ${darkMode ? 'border-zinc-700 bg-zinc-900/50 text-zinc-400' : 'border-zinc-100 bg-zinc-50/80 text-zinc-500'}`}>
        {columns.map((col) => (
          <th key={col.id} className={`px-6 py-3 group first:pl-8 ${getWidthClass(col.id)}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                {editingHeader === col.id ? (
                  <div className="flex items-center gap-1 w-full">
                    <input 
                      autoFocus
                      type="text" 
                      defaultValue={col.title}
                      onBlur={(e) => {
                        onUpdateHeader(col.id, e.target.value);
                        setEditingHeader(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateHeader(col.id, e.currentTarget.value);
                          setEditingHeader(null);
                        }
                      }}
                      className={`w-full px-2 py-1 rounded-md border-b-2 outline-none bg-transparent transition-all ${darkMode ? 'border-blue-500 text-zinc-500' : 'border-blue-500 text-zinc-900'}`}
                    />
                  </div>
                ) : (
                  <>
                    <span 
                      onClick={() => setEditingHeader(col.id)}
                      className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {col.title}
                    </span>
                    <button
                      onClick={() => onSort(col.id)}
                      className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Sort column"
                    >
                      {sortConfig?.columnId === col.id ? (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      ) : (
                        <ArrowUpDown size={14} />
                      )}
                    </button>
                  </>
                )}
              </div>
              <button 
                onClick={() => onDeleteColumn(col.id)}
                className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all duration-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </th>
        ))}
        <th className="px-6 py-3 w-[100px] text-center">Actions</th>
      </tr>

      {showFilters && (
        <tr className={`border-b ${darkMode ? 'border-zinc-800 bg-zinc-900/30' : 'border-zinc-100 bg-zinc-50/30'}`}>
          {columns.map((col) => (
            <th key={`filter-${col.id}`} className="px-6 py-2 first:pl-8">
              <div className="flex items-center gap-2">
                <Filter size={12} className="text-zinc-400" />
                <input
                  type="text"
                  placeholder="Filter..."
                  value={filters[col.id] || ''}
                  onChange={(e) => onFilterChange(col.id, e.target.value)}
                  className={`w-full px-2 py-1 text-xs rounded-md bg-transparent outline-none transition-all placeholder-zinc-400 ${darkMode ? 'text-zinc-200' : 'text-zinc-700'}`}
                />
              </div>
            </th>
          ))}
          <th className="px-6 py-2"></th>
        </tr>
      )}
    </thead>
  );
};
