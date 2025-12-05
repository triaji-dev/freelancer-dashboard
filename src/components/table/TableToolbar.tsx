import React from 'react';
import { 
  Plus, 
  Download, 
  Upload, 
  Type, 
  Filter,
  FilterX,
  RefreshCw,
  Archive,
  ArchiveRestore
} from 'lucide-react';

interface TableToolbarProps {
  showArchived: boolean;
  showFilters: boolean;
  darkMode: boolean;
  exchangeRates: Record<string, number> | null;
  isRateLoading: boolean;
  onToggleArchived: () => void;
  onToggleFilters: () => void;
  onRecalculate: () => void;
  onDownload: () => void;
  onUpload: () => void;
  onAddColumn: () => void;
  onAddRow: () => void;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  showArchived,
  showFilters,
  darkMode,
  exchangeRates,
  isRateLoading,
  onToggleArchived,
  onToggleFilters,
  onRecalculate,
  onDownload,
  onUpload,
  onAddColumn,
  onAddRow,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-zinc-300' : 'text-zinc-900'} relative z-10`}>
          {showArchived ? 'Archived Projects' : 'Projects'}
        </h2>
        <p className={`text-sm mt-1 ${darkMode ? 'text-zinc-300' : 'text-zinc-200'} relative z-10`}>
          {showArchived ? 'View and restore previously archived entries' : 'Manage your active contracts and deliverables'}
        </p>
        {exchangeRates && exchangeRates['IDR'] && (
          <div className="mt-2 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit relative z-10">
            <span>1 USD ≈ Rp {exchangeRates['IDR'].toLocaleString('id-ID')}</span>
            <button 
              onClick={onRecalculate}
              className="hover:text-emerald-700 dark:hover:text-emerald-300 ml-1 p-0.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors cursor-pointer"
              title="Recalculate all conversions"
            >
              <RefreshCw size={10} className={isRateLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
         <button 
          onClick={onToggleArchived}
          className={`p-2.5 rounded-full transition-all duration-200 cursor-pointer ${showArchived ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 dark:hover:text-zinc-500'}`}
          title={showArchived ? "Show Active Projects" : "Show Archived Projects"}
        >
          {showArchived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
        </button>
        <button 
          onClick={onToggleFilters}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 cursor-pointer ${darkMode ? 'border-zinc-500 hover:bg-zinc-800 text-zinc-200 bg-zinc-600/50' : 'border-zinc-500 hover:bg-zinc-50 bg-white text-zinc-200'}`}
          title={showFilters ? "Hide Filters" : "Show Filters"}
        >
          {showFilters ? <FilterX size={16} /> : <Filter size={16} />}
          <span className="hidden sm:inline">{showFilters ? 'Hide' : 'Show'} Filters</span>
        </button>
        <div className={`h-6 w-px mx-1 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>
        <button 
          onClick={onDownload}
          className={`p-2 text-sm font-medium rounded-full border transition-all duration-200 cursor-pointer ${darkMode ? 'border-zinc-500 hover:bg-zinc-800 text-zinc-200 bg-zinc-600/50' : 'border-zinc-500 hover:bg-zinc-50 bg-white text-zinc-200'}`}
          title="Download JSON"
        >
          <Download size={18} />
        </button>
        <button 
          onClick={onUpload}
          className={`p-2 text-sm font-medium rounded-full border transition-all duration-200 cursor-pointer ${darkMode ? 'border-zinc-500 hover:bg-zinc-800 text-zinc-200 bg-zinc-600/50' : 'border-zinc-500 hover:bg-zinc-50 bg-white text-zinc-200'}`}
          title="Upload JSON"
        >
          <Upload size={18} />
        </button>
        <button 
          onClick={onAddColumn}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 cursor-pointer ${darkMode ? 'border-zinc-500 hover:bg-zinc-800 text-zinc-200 bg-zinc-600/50' : 'border-zinc-500 hover:bg-zinc-50 bg-white text-zinc-200'}`}
        >
          <Type size={16} />
          <span className="hidden sm:inline">Add Column</span>
        </button>
        <button 
          onClick={onAddRow}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95 transition-all duration-200 cursor-pointer ml-1"
        >
          <Plus size={18} strokeWidth={2.5} />
          New Entry
        </button>
      </div>
    </div>
  );
};
