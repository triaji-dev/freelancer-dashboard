import React, { useState, useEffect, useRef } from 'react';
import { 
  Moon, 
  Sun, 
  Plus, 
  Trash2, 
  X, 
  ExternalLink, 
  Layout,
  Type,
  Download,
  Upload,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  FilterX
} from 'lucide-react';

// --- Type Definitions ---
type ColumnType = 'text' | 'link' | 'date' | 'status';

interface Column {
  id: string;
  title: string;
  type: ColumnType;
}

interface Row {
  id: string;
  [key: string]: string;
}

interface EditingCell {
  rowId: string;
  colId: string;
}

interface SortConfig {
  columnId: string;
  direction: 'asc' | 'desc';
}

interface ConfirmDialog {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

type StatusOption = 'Pending' | 'Active' | 'Concluded' | 'Terminated';

// --- Mock Data / Initial State ---
const INITIAL_COLUMNS: Column[] = [
  { id: 'col_1', title: 'Project Name', type: 'text' },
  { id: 'col_2', title: 'Repository/Link', type: 'link' },
  { id: 'col_3', title: 'Deadline', type: 'date' },
  { id: 'col_4', title: 'Prize', type: 'text' },
  { id: 'col_5', title: 'Status', type: 'status' },
];

const INITIAL_ROWS: Row[] = [
  { 
    id: 'row_1', 
    col_1: 'Project 1', 
    col_2: '#', 
    col_3: '2025-11-21', 
    col_4: '$1,000.00', 
    col_5: 'Active' 
  },
  { 
    id: 'row_2', 
    col_1: 'Project 2', 
    col_2: '#', 
    col_3: '2025-11-22', 
    col_4: '$1,000.00', 
    col_5: 'Pending' 
  },
];

const STATUS_OPTIONS: StatusOption[] = ['Pending', 'Active', 'Concluded', 'Terminated'];

export default function App(): React.JSX.Element {
  // --- State ---
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);
  
  // UI States
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editingHeader, setEditingHeader] = useState<string | null>(null);
  
  // Sorting & Filtering States
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  
  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  // Detect system color scheme preference on mount
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Toggle Body Class for Tailwind Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- Handlers: Rows ---
  const addRow = (): void => {
    const newId = `row_${Date.now()}`;
    const newRow: Row = { id: newId };
    columns.forEach(col => newRow[col.id] = "");
    // Set default status if exists
    const statusCol = columns.find(c => c.type === 'status');
    if (statusCol) newRow[statusCol.id] = 'Pending';
    
    setRows([...rows, newRow]);
  };

  const deleteRow = (rowId: string): void => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Row',
      message: 'Are you sure you want to delete this row? This action cannot be undone.',
      onConfirm: () => {
        setRows(rows.filter(r => r.id !== rowId));
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const updateCell = (rowId: string, colId: string, value: string): void => {
    setRows(rows.map(r => r.id === rowId ? { ...r, [colId]: value } : r));
    setEditingCell(null);
  };

  // --- Handlers: Columns ---
  const addColumn = (): void => {
    const newId = `col_${Date.now()}`;
    const newCol: Column = { id: newId, title: 'New Variable', type: 'text' };
    setColumns([...columns, newCol]);
    setRows(rows.map(r => ({ ...r, [newId]: '' })));
  };

  const deleteColumn = (colId: string): void => {
    const column = columns.find(c => c.id === colId);
    const columnName = column?.title || 'this column';
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Column',
      message: `Are you sure you want to delete "${columnName}"? All data in this column will be lost. This action cannot be undone.`,
      onConfirm: () => {
        setColumns(columns.filter(c => c.id !== colId));
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const updateHeader = (colId: string, newTitle: string): void => {
    setColumns(columns.map(c => c.id === colId ? { ...c, title: newTitle } : c));
    setEditingHeader(null);
  };

  // --- Handlers: Sorting & Filtering ---
  const handleSort = (columnId: string): void => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.columnId === columnId) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ columnId, direction });
  };

  const handleFilterChange = (columnId: string, value: string): void => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value
    }));
  };

  const getFilteredAndSortedRows = (): Row[] => {
    let filteredRows = [...rows];
    
    // Apply filters
    Object.keys(filters).forEach(columnId => {
      const filterValue = filters[columnId].toLowerCase();
      if (filterValue) {
        filteredRows = filteredRows.filter(row => {
          const cellValue = (row[columnId] || '').toLowerCase();
          return cellValue.includes(filterValue);
        });
      }
    });
    
    // Apply sorting
    if (sortConfig) {
      const column = columns.find(c => c.id === sortConfig.columnId);
      if (column) {
        filteredRows.sort((a, b) => {
          const aValue = a[sortConfig.columnId] || '';
          const bValue = b[sortConfig.columnId] || '';
          
          // Sort based on column type
          if (column.type === 'date') {
            const aDate = new Date(aValue).getTime();
            const bDate = new Date(bValue).getTime();
            return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
          } else if (column.type === 'text' && (aValue.match(/^\$?[\d,]+\.?\d*$/) || bValue.match(/^\$?[\d,]+\.?\d*$/))) {
            // Handle numeric values (including currency)
            const aNum = parseFloat(aValue.replace(/[$,]/g, '')) || 0;
            const bNum = parseFloat(bValue.replace(/[$,]/g, '')) || 0;
            return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
          } else {
            // Text sorting
            return sortConfig.direction === 'asc' 
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }
        });
      }
    }
    
    return filteredRows;
  };

  // --- Handlers: JSON Export/Import ---
  const downloadJSON = (): void => {
    const data = {
      columns,
      rows,
      exportDate: new Date().toISOString(),
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `freelancer-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const uploadJSON = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.columns && data.rows) {
          setColumns(data.columns);
          setRows(data.rows);
        } else {
          alert('Invalid JSON format. Please upload a valid dashboard export file.');
        }
      } catch (error) {
        alert('Error reading file. Please ensure it is a valid JSON file.');
        console.error('Upload error:', error);
      }
    };
    
    reader.readAsText(file);
    // Reset input value to allow uploading the same file again
    event.target.value = '';
  };

  // --- Render Helpers ---
  const getStatusColor = (status?: string): string => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-blue-600 text-blue-100 dark:bg-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      case 'concluded': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
      case 'terminated': return 'bg-red-50 text-red-700 dark:bg-red-500 dark:text-red-300 border border-red-200 dark:border-red-800';
      default: return 'bg-slate-50 text-slate-900 dark:bg-slate-500 dark:text-slate-100 border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Navigation / Header */}
      <header className={`sticky top-0 z-20 border-b backdrop-blur-sm transition-colors duration-200 ${darkMode ? 'border-slate-800/50 bg-slate-950/95' : 'border-slate-200/80 bg-white/95'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Layout size={16} />
            </div>
            <h1 className={`text-lg font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              Freelancer Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${darkMode ? 'hover:bg-slate-800 text-blue-500' : 'hover:bg-slate-100 text-blue-600'}`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Hidden file input for upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        {/* Toolbar */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Project Ledger & Active Contracts
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border transition-all duration-200 cursor-pointer ${darkMode ? 'border-slate-600 hover:bg-slate-800 text-slate-200 bg-slate-900' : 'border-slate-200 hover:bg-slate-50 bg-white text-slate-700'}`}
              title={showFilters ? "Hide Filters" : "Show Filters"}
            >
              {showFilters ? <FilterX size={16} /> : <Filter size={16} />}
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
            <button 
              onClick={downloadJSON}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border transition-all duration-200 cursor-pointer ${darkMode ? 'border-slate-600 hover:bg-slate-800 text-slate-200 bg-slate-900' : 'border-slate-200 hover:bg-slate-50 bg-white text-slate-700'}`}
              title="Download JSON"
            >
              <Download size={16} />
              Download
            </button>
            <button 
              onClick={uploadJSON}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border transition-all duration-200 cursor-pointer ${darkMode ? 'border-slate-600 hover:bg-slate-800 text-slate-200 bg-slate-900' : 'border-slate-200 hover:bg-slate-50 bg-white text-slate-700'}`}
              title="Upload JSON"
            >
              <Upload size={16} />
              Upload
            </button>
            <button 
              onClick={addColumn}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border transition-all duration-200 cursor-pointer ${darkMode ? 'border-slate-600 hover:bg-slate-800 text-slate-200 bg-slate-900' : 'border-slate-200 hover:bg-slate-50 bg-white text-slate-700'}`}
            >
              <Type size={16} />
              Add Column
            </button>
            <button 
              onClick={addRow}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all duration-200 cursor-pointer"
            >
              <Plus size={16} />
              New Entry
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className={`rounded-xl border overflow-hidden ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white shadow-sm'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm table-fixed">
              
              {/* Table Header */}
              <thead>
                {/* Header Row with Titles and Sort */}
                <tr className={`h-14 border-b text-xs font-semibold tracking-wide uppercase ${darkMode ? 'border-slate-700 bg-slate-800/50 text-slate-100' : 'border-slate-200 bg-slate-50/50 text-slate-900'}`}>
                  {columns.map((col) => (
                    <th key={col.id} className="px-5 py-2 group">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          {editingHeader === col.id ? (
                            <div className="flex items-center gap-1 w-full">
                              <input 
                                autoFocus
                                type="text" 
                                defaultValue={col.title}
                                onBlur={(e) => updateHeader(col.id, e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && updateHeader(col.id, e.currentTarget.value)}
                                className={`w-full px-2.5 py-1.5 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${darkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
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
                                onClick={() => handleSort(col.id)}
                                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
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
                          onClick={() => deleteColumn(col.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all duration-200 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-2 w-[80px] text-center">Actions</th>
                </tr>
                
                {/* Filter Row */}
                {showFilters && (
                  <tr className={`border-b ${darkMode ? 'border-slate-700 bg-slate-900/30' : 'border-slate-200 bg-slate-50/30'}`}>
                    {columns.map((col) => (
                      <th key={`filter-${col.id}`} className="px-5 py-2">
                        <div className="flex items-center gap-1">
                          <Filter size={12} className="text-slate-400" />
                          <input
                            type="text"
                            placeholder="Filter..."
                            value={filters[col.id] || ''}
                            onChange={(e) => handleFilterChange(col.id, e.target.value)}
                            className={`w-full px-2 py-1 text-xs rounded border outline-none focus:ring-1 focus:ring-blue-500/20 transition-all ${darkMode ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
                          />
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-2"></th>
                  </tr>
                )}
              </thead>

              {/* Table Body */}
              <tbody className={`divide-y ${darkMode ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
                {(() => {
                  const displayRows = getFilteredAndSortedRows();
                  return displayRows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                        {rows.length === 0 ? 'No active records found. Initialize a new entry to begin.' : 'No records match the current filters.'}
                      </td>
                    </tr>
                  ) : (
                    displayRows.map((row) => (
                    <tr key={row.id} className={`group transition-colors duration-150 h-14 ${darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50'}`}>
                      {columns.map((col) => (
                        <td key={`${row.id}-${col.id}`} className="px-5 h-14">
                          {/* EDIT MODE */}
                          {editingCell?.rowId === row.id && editingCell?.colId === col.id ? (
                            col.type === 'status' ? (
                              <div className="flex items-center h-full">
                                <select 
                                  autoFocus
                                  defaultValue={row[col.id]}
                                  onChange={(e) => updateCell(row.id, col.id, e.target.value)}
                                  onBlur={(e) => updateCell(row.id, col.id, e.target.value)}
                                  className={`w-full px-2.5 py-1.5 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${darkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                >
                                  {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              </div>
                            ) : (
                              <div className="flex items-center h-full">
                                <input 
                                  autoFocus
                                  type={col.type === 'date' ? 'date' : 'text'} 
                                  defaultValue={row[col.id]}
                                  onBlur={(e) => updateCell(row.id, col.id, e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && updateCell(row.id, col.id, e.currentTarget.value)}
                                  className={`w-full px-2.5 py-1.5 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${darkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                />
                              </div>
                            )
                          ) : (
                            /* VIEW MODE */
                            <div 
                              onClick={() => setEditingCell({ rowId: row.id, colId: col.id })}
                              className="cursor-pointer h-full flex items-center"
                            >
                              {col.type === 'link' && row[col.id] ? (
                                <a 
                                  href={row[col.id]} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()} 
                                  className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                                >
                                  Go to Project <ExternalLink size={14} />
                                </a>
                              ) : col.type === 'status' ? (
                                <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(row[col.id])}`}>
                                  {row[col.id] || 'Pending'}
                                </span>
                              ) : (
                                <span className={!row[col.id] ? 'text-slate-400 dark:text-slate-100 text-sm' : 'text-slate-700 dark:text-slate-500'}>
                                  {row[col.id] || '—'}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      ))}
                      
                      {/* Row Actions */}
                      <td className="px-4 py-3.5 text-center">
                        <button 
                          onClick={() => deleteRow(row.id)}
                          className="text-red-500 dark:text-slate-500 hover:text-red-500 transition-all duration-200 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                          title="Delete Entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                    ))
                  );
                })()}
              </tbody>
            </table>
          </div>
          
          {/* Footer / Stats */}
          <div className={`px-5 py-3 border-t text-xs flex justify-between items-center ${darkMode ? 'border-slate-700 bg-slate-800/30 text-slate-400' : 'border-slate-200 bg-slate-50/50 text-slate-500'}`}>
            <span className="font-medium">Total Entries: <span className="text-slate-700 dark:text-slate-200">{rows.length}</span></span>
            <span className="text-slate-400 dark:text-slate-500">Last Updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

      </main>

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`max-w-md w-full rounded-xl shadow-2xl border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                {confirmDialog.title}
              </h3>
            </div>
            
            {/* Modal Body */}
            <div className="px-6 py-4">
              <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {confirmDialog.message}
              </p>
            </div>
            
            {/* Modal Footer */}
            <div className={`px-6 py-4 border-t flex justify-end gap-3 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <button
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${darkMode ? 'border-slate-600 hover:bg-slate-800 text-slate-200 bg-slate-900' : 'border-slate-300 hover:bg-slate-50 bg-white text-slate-700'}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
