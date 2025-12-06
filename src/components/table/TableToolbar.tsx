import React, { useState } from 'react';
import { 
  Plus, 
  Download, 
  Upload, 
  Type, 
  Filter,
  FilterX,
  RefreshCw,
  Archive,
  ArchiveRestore,
  MoreVertical,
  X
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const buttonBaseClass = `flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 ${
    darkMode 
      ? 'border-zinc-500 hover:bg-zinc-800 text-zinc-300 bg-zinc-800/50' 
      : 'border-zinc-500 hover:bg-zinc-50 bg-white text-zinc-700'
  }`;

  const iconButtonClass = `flex items-center justify-center p-2.5 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 ${
    darkMode 
      ? 'border-zinc-500 hover:bg-zinc-800 text-zinc-300 bg-zinc-800/50' 
      : 'border-zinc-200 hover:bg-zinc-50 bg-white text-zinc-700'
  }`;

  return (
    <div className="flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
            {showArchived ? 'Archived Projects' : 'Projects'}
          </h2>
          <p className={`text-sm mt-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {showArchived ? 'View and restore previously archived entries' : 'Manage your active watchlists'}
          </p>
          {exchangeRates && exchangeRates['IDR'] && (
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg w-fit">
              <span>1 USD ≈ Rp {exchangeRates['IDR'].toLocaleString('id-ID')}</span>
              <button 
                onClick={onRecalculate}
                className="hover:text-emerald-700 dark:hover:text-emerald-300 p-1 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors cursor-pointer"
                title="Recalculate all conversions"
              >
                <RefreshCw size={12} className={isRateLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className={`md:hidden ${iconButtonClass} ${showMobileMenu ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400' : ''}`}
          title="More actions"
        >
          {showMobileMenu ? <X size={18} /> : <MoreVertical size={18} />}
        </button>
      </div>

      {/* Desktop Actions - Hidden on Mobile */}
      <div className="hidden md:flex flex-wrap items-center gap-2">
        {/* Primary Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleArchived}
            className={`${iconButtonClass} ${
              showArchived 
                ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400' 
                : ''
            }`}
            title={showArchived ? "Show Active Projects" : "Show Archived Projects"}
          >
            {showArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
          </button>
          
          <button 
            onClick={onToggleFilters}
            className={`${buttonBaseClass} joyride-filters`}
            title={showFilters ? "Hide Filters" : "Show Filters"}
          >
            {showFilters ? <FilterX size={16} /> : <Filter size={16} />}
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>

        {/* Separator */}
        <div className={`h-6 w-px ${darkMode ? 'bg-zinc-700' : 'bg-zinc-300'}`}></div>

        {/* File Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onDownload}
            className={iconButtonClass}
            title="Download JSON"
          >
            <Download size={16} />
          </button>
          <button 
            onClick={onUpload}
            className={iconButtonClass}
            title="Upload JSON"
          >
            <Upload size={16} />
          </button>
          <button 
            onClick={onAddColumn}
            className={`${buttonBaseClass} joyride-add-column`}
            title="Add Column"
          >
            <Type size={16} />
            <span>Add Column</span>
          </button>
        </div>

        {/* Separator */}
        <div className={`h-6 w-px ${darkMode ? 'bg-zinc-700' : 'bg-zinc-300'}`}></div>

        {/* Primary CTA */}
        <button 
          onClick={onAddRow}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all duration-200 cursor-pointer joyride-add-entry"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Entry
        </button>
      </div>

      {/* Mobile Menu - Collapsible */}
      {showMobileMenu && (
        <div className="md:hidden flex flex-col gap-3 p-4 rounded-2xl border bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-200">
          {/* Quick Actions Row 1 */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => {
                onToggleArchived();
                setShowMobileMenu(false);
              }}
              className={`${buttonBaseClass} ${
                showArchived 
                  ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400' 
                  : ''
              }`}
            >
              {showArchived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
              <span className="text-xs">{showArchived ? 'Active' : 'Archive'}</span>
            </button>
            
            <button 
              onClick={() => {
                onToggleFilters();
                setShowMobileMenu(false);
              }}
              className={`${buttonBaseClass} ${
                showFilters 
                  ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400' 
                  : ''
              }`}
            >
              {showFilters ? <FilterX size={18} /> : <Filter size={18} />}
              <span className="text-xs">{showFilters ? 'Hide' : 'Show'} Filters</span>
            </button>
          </div>

          {/* Quick Actions Row 2 */}
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => {
                onDownload();
                setShowMobileMenu(false);
              }}
              className={buttonBaseClass}
            >
              <Download size={18} />
              <span className="text-xs">Download</span>
            </button>
            
            <button 
              onClick={() => {
                onUpload();
                setShowMobileMenu(false);
              }}
              className={buttonBaseClass}
            >
              <Upload size={18} />
              <span className="text-xs">Upload</span>
            </button>
            
            <button 
              onClick={() => {
                onAddColumn();
                setShowMobileMenu(false);
              }}
              className={buttonBaseClass}
            >
              <Type size={18} />
              <span className="text-xs">Column</span>
            </button>
          </div>


          {/* Divider */}
          <div className={`h-px ${darkMode ? 'bg-zinc-700' : 'bg-zinc-200'}`}></div>

          {/* Additional Info / Footer of Menu */}
          <div className={`text-xs text-center py-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Select an action above
          </div>
        </div>
      )}

      {/* Mobile Quick Access - Always Visible */}
      <div className="md:hidden flex items-center gap-2">
        <button 
          onClick={onAddRow}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/25 active:scale-95 transition-all duration-200 cursor-pointer joyride-add-entry"
        >
          <Plus size={18} strokeWidth={2.5} />
          New Entry
        </button>
        
        <button 
          onClick={onToggleFilters}
          className={`px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer joyride-filters ${
            darkMode 
              ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300 bg-zinc-800/50' 
              : 'border-zinc-300 hover:bg-zinc-50 bg-white text-zinc-700'
          }`}
          title={showFilters ? "Hide Filters" : "Show Filters"}
        >
          {showFilters ? <FilterX size={20} /> : <Filter size={20} />}
          <span className="sr-only">Toggle Filters</span>
        </button>
      </div>
    </div>
  );
};
