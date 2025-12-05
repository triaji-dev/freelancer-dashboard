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
  FilterX,
  RefreshCw
} from 'lucide-react';

// --- Type Definitions ---
type ColumnType = 'text' | 'link' | 'date' | 'status' | 'category';

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

type StatusOption = 'Watchlisted' | 'Active' | 'Submitted' | 'Canceled' | 'Bookmarked';
type CategoryOption = 'Project' | 'Contest';

// --- Mock Data / Initial State ---
const INITIAL_COLUMNS: Column[] = [
  { id: 'col_1', title: 'Project Name', type: 'text' },
  { id: 'col_cat', title: 'Category', type: 'category' },
  { id: 'col_2', title: 'Link', type: 'link' },
  { id: 'col_3', title: 'Deadline', type: 'date' },
  { id: 'col_4', title: 'Prize', type: 'text' },
  { id: 'col_converted', title: 'Converted', type: 'text' },
  { id: 'col_5', title: 'Status', type: 'status' },
];

const INITIAL_ROWS: Row[] = [
  { 
    id: 'row_1', 
    col_1: 'E-Commerce Redesign', 
    col_cat: 'Project',
    col_2: 'https://github.com/example/repo', 
    col_3: '2025-11-21', 
    col_4: '$1,500.00', 
    col_converted: 'Rp 24.000.000',
    col_5: 'Active' 
  },
  { 
    id: 'row_2', 
    col_1: 'Logo Design Contest', 
    col_cat: 'Contest',
    col_2: '#', 
    col_3: '2025-11-25', 
    col_4: '$500.00', 
    col_converted: 'Rp 8.000.000',
    col_5: 'Watchlisted' 
  },
];

const STATUS_OPTIONS: StatusOption[] = ['Watchlisted', 'Active', 'Submitted', 'Canceled', 'Bookmarked'];
const CATEGORY_OPTIONS: CategoryOption[] = ['Project', 'Contest'];

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
  
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isRateLoading, setIsRateLoading] = useState<boolean>(false);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialLoad = useRef<boolean>(true);

  // --- Effects ---
  // Fetch Exchange Rate
  useEffect(() => {
    const fetchRate = async () => {
      setIsRateLoading(true);
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        if (data && data.rates && data.rates.IDR) {
          setExchangeRate(data.rates.IDR);
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      } finally {
        setIsRateLoading(false);
      }
    };

    fetchRate();
  }, []);
  // Load data from localStorage on mount
  useEffect(() => {
    const savedColumns = localStorage.getItem('freelancer-dashboard-columns');
    const savedRows = localStorage.getItem('freelancer-dashboard-rows');
    
    if (savedColumns) {
      try {
        setColumns(JSON.parse(savedColumns));
      } catch (error) {
        console.error('Error loading columns from localStorage:', error);
      }
    }
    
    if (savedRows) {
      try {
        setRows(JSON.parse(savedRows));
      } catch (error) {
        console.error('Error loading rows from localStorage:', error);
      }
    }
    
    // Mark initial load as complete
    isInitialLoad.current = false;
  }, []);

  // Save columns to localStorage whenever they change (skip initial load)
  useEffect(() => {
    if (!isInitialLoad.current) {
      localStorage.setItem('freelancer-dashboard-columns', JSON.stringify(columns));
    }
  }, [columns]);

  // Save rows to localStorage whenever they change (skip initial load)
  useEffect(() => {
    if (!isInitialLoad.current) {
      localStorage.setItem('freelancer-dashboard-rows', JSON.stringify(rows));
    }
  }, [rows]);

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
    if (statusCol) newRow[statusCol.id] = 'Watchlisted';
    const catCol = columns.find(c => c.type === 'category');
    if (catCol) newRow[catCol.id] = 'Project';
    
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
    let updatedRows = rows.map(r => r.id === rowId ? { ...r, [colId]: value } : r);
    
    // Auto-convert if Prize column is updated
    const prizeCol = columns.find(c => c.title === 'Prize');
    const convertedCol = columns.find(c => c.title === 'Converted');
    
    if (exchangeRate && prizeCol && convertedCol && colId === prizeCol.id) {
      const prizeValue = parseFloat(value.replace(/[^0-9.]/g, ''));
      if (!isNaN(prizeValue)) {
        const convertedValue = Math.floor(prizeValue * exchangeRate);
        const formattedConverted = `Rp ${convertedValue.toLocaleString('id-ID')}`;
        
        updatedRows = updatedRows.map(r => r.id === rowId ? { ...r, [convertedCol.id]: formattedConverted } : r);
      }
    }

    setRows(updatedRows);
    setEditingCell(null);
  };

  const recalculateConversions = (): void => {
    if (!exchangeRate) return;
    
    const prizeCol = columns.find(c => c.title === 'Prize');
    const convertedCol = columns.find(c => c.title === 'Converted');
    
    if (!prizeCol || !convertedCol) return;

    const updatedRows = rows.map(row => {
      const prizeValue = parseFloat((row[prizeCol.id] || '').replace(/[^0-9.]/g, ''));
      if (!isNaN(prizeValue)) {
        const convertedValue = Math.floor(prizeValue * exchangeRate);
        const formattedConverted = `Rp ${convertedValue.toLocaleString('id-ID')}`;
        return { ...row, [convertedCol.id]: formattedConverted };
      }
      return row;
    });

    setRows(updatedRows);
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      
      {/* Navigation / Header */}
      <header className={`sticky top-0 z-20 backdrop-blur-xl border-b transition-colors duration-300 ${darkMode ? 'border-white/5 bg-zinc-950/80' : 'border-black/5 bg-white/80'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <Layout size={20} strokeWidth={2.5} />
            </div>
            <h1 className={`text-lg font-bold tracking-tight ${darkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
              Freelancer<span className="opacity-50 font-normal">Dashboard</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-full transition-all duration-200 cursor-pointer ${darkMode ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'}`}
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
          <div>
            <h2 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
              Projects
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Manage your active contracts and deliverables
            </p>
            {exchangeRate && (
              <div className="mt-2 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
                <span>1 USD ≈ Rp {exchangeRate.toLocaleString('id-ID')}</span>
                <button 
                  onClick={recalculateConversions}
                  className="hover:text-emerald-700 dark:hover:text-emerald-300 ml-1 p-0.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                  title="Recalculate all conversions"
                >
                  <RefreshCw size={10} className={isRateLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 cursor-pointer ${darkMode ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-300 bg-zinc-900/50' : 'border-zinc-200 hover:bg-zinc-50 bg-white text-zinc-600'}`}
              title={showFilters ? "Hide Filters" : "Show Filters"}
            >
              {showFilters ? <FilterX size={16} /> : <Filter size={16} />}
              <span className="hidden sm:inline">{showFilters ? 'Hide' : 'Show'} Filters</span>
            </button>
            <div className={`h-6 w-px mx-1 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>
            <button 
              onClick={downloadJSON}
              className={`p-2 text-sm font-medium rounded-full border transition-all duration-200 cursor-pointer ${darkMode ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-300 bg-zinc-900/50' : 'border-zinc-200 hover:bg-zinc-50 bg-white text-zinc-600'}`}
              title="Download JSON"
            >
              <Download size={18} />
            </button>
            <button 
              onClick={uploadJSON}
              className={`p-2 text-sm font-medium rounded-full border transition-all duration-200 cursor-pointer ${darkMode ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-300 bg-zinc-900/50' : 'border-zinc-200 hover:bg-zinc-50 bg-white text-zinc-600'}`}
              title="Upload JSON"
            >
              <Upload size={18} />
            </button>
            <button 
              onClick={addColumn}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 cursor-pointer ${darkMode ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-300 bg-zinc-900/50' : 'border-zinc-200 hover:bg-zinc-50 bg-white text-zinc-600'}`}
            >
              <Type size={16} />
              <span className="hidden sm:inline">Add Column</span>
            </button>
            <button 
              onClick={addRow}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95 transition-all duration-200 cursor-pointer ml-1"
            >
              <Plus size={18} strokeWidth={2.5} />
              New Entry
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${darkMode ? 'border-zinc-800 bg-zinc-900/30 shadow-inner shadow-black/20' : 'border-zinc-200 bg-white shadow-xl shadow-zinc-200/50'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm table-fixed">
              
              {/* Table Header */}
              <thead>
                {/* Header Row with Titles and Sort */}
                <tr className={`h-12 border-b text-xs font-semibold tracking-wider uppercase ${darkMode ? 'border-zinc-800 bg-zinc-900/50 text-zinc-400' : 'border-zinc-100 bg-zinc-50/80 text-zinc-500'}`}>
                  {columns.map((col) => (
                    <th key={col.id} className="px-6 py-3 group first:pl-8">
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
                                className={`w-full px-2 py-1 rounded-md border-b-2 outline-none bg-transparent transition-all ${darkMode ? 'border-blue-500 text-zinc-100' : 'border-blue-500 text-zinc-900'}`}
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
                          onClick={() => deleteColumn(col.id)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all duration-200 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 w-[100px] text-center">Actions</th>
                </tr>
                
                {/* Filter Row */}
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
                            onChange={(e) => handleFilterChange(col.id, e.target.value)}
                            className={`w-full px-2 py-1 text-xs rounded-md bg-transparent outline-none transition-all placeholder-zinc-400 ${darkMode ? 'text-zinc-200' : 'text-zinc-700'}`}
                          />
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-2"></th>
                  </tr>
                )}
              </thead>

              {/* Table Body */}
              <tbody className={`divide-y ${darkMode ? 'divide-zinc-800' : 'divide-zinc-100'}`}>
                {(() => {
                  const displayRows = getFilteredAndSortedRows();
                  return displayRows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className={`p-4 rounded-full ${darkMode ? 'bg-zinc-900 text-zinc-600' : 'bg-zinc-50 text-zinc-300'}`}>
                            <Layout size={32} strokeWidth={1.5} />
                          </div>
                          <p className={`text-sm font-medium ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                            {rows.length === 0 ? 'No active records found. Initialize a new entry to begin.' : 'No records match the current filters.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayRows.map((row) => (
                    <tr key={row.id} className={`group transition-all duration-200 h-16 ${darkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-blue-50/30'}`}>
                      {columns.map((col) => (
                        <td key={`${row.id}-${col.id}`} className="px-6 h-16 first:pl-8">
                          {/* EDIT MODE */}
                          {editingCell?.rowId === row.id && editingCell?.colId === col.id ? (
                            col.type === 'status' ? (
                              <div className="flex items-center h-full">
                                <select 
                                  autoFocus
                                  defaultValue={row[col.id]}
                                  onChange={(e) => updateCell(row.id, col.id, e.target.value)}
                                  onBlur={(e) => updateCell(row.id, col.id, e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${darkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'}`}
                                >
                                  {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              </div>
                            ) : col.type === 'category' ? (
                              <div className="flex items-center h-full">
                                <select 
                                  autoFocus
                                  defaultValue={row[col.id]}
                                  onChange={(e) => updateCell(row.id, col.id, e.target.value)}
                                  onBlur={(e) => updateCell(row.id, col.id, e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${darkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'}`}
                                >
                                  {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
                                  className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${darkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'}`}
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
                                  className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium text-sm hover:underline underline-offset-4"
                                >
                                  Link <ExternalLink size={12} />
                                </a>
                              ) : col.type === 'status' ? (
                                <span className={getStatusColor(row[col.id])}>
                                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    row[col.id]?.toLowerCase() === 'active' ? 'bg-blue-500' :
                                    row[col.id]?.toLowerCase() === 'submitted' ? 'bg-emerald-500' :
                                    row[col.id]?.toLowerCase() === 'canceled' ? 'bg-zinc-500' :
                                    row[col.id]?.toLowerCase() === 'bookmarked' ? 'bg-violet-500' :
                                    row[col.id]?.toLowerCase() === 'watchlisted' ? 'bg-amber-500' :
                                    'bg-zinc-400'
                                  }`}></span>
                                  {row[col.id] || 'Watchlisted'}
                                </span>
                              ) : col.type === 'category' ? (
                                <span className={getCategoryColor(row[col.id])}>
                                  {row[col.id] || 'Project'}
                                </span>
                              ) : (
                                <span className={!row[col.id] ? 'text-zinc-300 dark:text-zinc-700 text-sm italic' : 'text-zinc-700 dark:text-zinc-300 font-medium'}>
                                  {row[col.id] || 'Empty'}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      ))}
                      
                      {/* Row Actions */}
                      <td className="px-6 py-3.5 text-center">
                        <button 
                          onClick={() => deleteRow(row.id)}
                          className="text-zinc-400 hover:text-rose-500 transition-all duration-200 p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer opacity-0 group-hover:opacity-100"
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
          <div className={`px-8 py-4 border-t text-xs flex justify-between items-center ${darkMode ? 'border-zinc-800 bg-zinc-900/30 text-zinc-500' : 'border-zinc-100 bg-zinc-50/50 text-zinc-400'}`}>
            <span className="font-medium">Total Entries: <span className={`ml-1 ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{rows.length}</span></span>
            <span className={darkMode ? 'text-zinc-600' : 'text-zinc-400'}>Last Updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

      </main>

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm transition-all duration-300">
          <div className={`max-w-md w-full rounded-2xl shadow-2xl border transform transition-all scale-100 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-2">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
                {confirmDialog.title}
              </h3>
            </div>
            
            {/* Modal Body */}
            <div className="px-6 py-2">
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {confirmDialog.message}
              </p>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 cursor-pointer ${darkMode ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300' : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-rose-600 text-white hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-600/20 active:scale-95 transition-all duration-200 cursor-pointer"
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
