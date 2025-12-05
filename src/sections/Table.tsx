import React, { useState, useEffect, useRef } from 'react';
import { Layout } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { 
  Column, 
  Row, 
  EditingCell, 
  SortConfig, 
  ConfirmDialogState, 
} from '../components/table/types';
import { TableToolbar } from '../components/table/TableToolbar';
import { QuickFilters } from '../components/table/QuickFilters';
import { TableHeader } from '../components/table/TableHeader';
import { TableRow } from '../components/table/TableRow';
import { ConfirmDialog } from '../components/table/ConfirmDialog';
import heroImage from '../assets/image00.png';

// --- Mock Data / Initial State ---
const INITIAL_COLUMNS: Column[] = [
  { id: 'col_1', title: 'Project Name', type: 'text' },
  { id: 'col_cat', title: 'Cat', type: 'category' },
  { id: 'col_2', title: 'Link', type: 'link' },
  { id: 'col_3', title: 'Deadline', type: 'date' },
  { id: 'col_4', title: 'Prize', type: 'text' },
  { id: 'col_converted', title: 'Converted', type: 'text' },
  { id: 'col_5', title: 'Status', type: 'status' },
];

interface TableProps {
  darkMode: boolean;
}

export default function Table({ darkMode }: TableProps): React.JSX.Element {
  const { user } = useAuth();
  
  // --- State ---
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI States
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  // Sorting & Filtering States
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  
  // Currency Conversion State
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
  const [isRateLoading, setIsRateLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Projects from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const mappedRows: Row[] = data.map(item => ({
            id: item.id,
            col_1: item.name || '',
            col_cat: item.category || 'Project',
            col_2: item.link || '',
            col_3: item.deadline || '',
            col_4: item.prize || '',
            col_5: item.status || 'Watchlisted',
            archived: item.archived,
            // Spread metadata for dynamic columns
            ...(item.metadata || {})
          }));
          
          // Infer dynamic columns from metadata
          const allKeys = new Set<string>();
          data.forEach(item => {
            if (item.metadata) {
              Object.keys(item.metadata).forEach(key => allKeys.add(key));
            }
          });

          const newColumns = [...INITIAL_COLUMNS];
          allKeys.forEach(key => {
            if (!newColumns.find(c => c.id === key)) {
              newColumns.push({
                id: key,
                title: key.replace('col_', 'Column '),
                type: 'text'
              });
            }
          });
          
          setColumns(newColumns);
          setRows(mappedRows);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      setIsRateLoading(true);
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        setExchangeRates(data.rates);
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
      } finally {
        setIsRateLoading(false);
      }
    };

    fetchExchangeRate();
  }, []);

  // --- Helpers: Currency Conversion ---
  const detectCurrency = (value: string): string => {
    const upper = value.toUpperCase();
    if (upper.includes('AUD')) return 'AUD';
    if (upper.includes('INR') || value.includes('₹')) return 'INR';
    if (upper.includes('GBP') || value.includes('£')) return 'GBP';
    if (upper.includes('EUR') || value.includes('€')) return 'EUR';
    if (upper.includes('CAD') || (value.includes('C$') && !upper.includes('USD'))) return 'CAD';
    return 'USD'; // Default
  };

  const calculateConversion = (value: string, rates: Record<string, number> | null): string => {
    if (!rates) return '';
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (isNaN(numericValue)) return '';

    const currency = detectCurrency(value);
    const rateIDR = rates['IDR'];
    const rateSource = rates[currency];

    if (!rateIDR || !rateSource) return '';

    // Convert to USD first (amount / rateSource), then to IDR
    const convertedValue = Math.floor((numericValue / rateSource) * rateIDR);
    return `Rp ${convertedValue.toLocaleString('id-ID')}`;
  };

  // --- Handlers: Rows ---
  const addRow = async (): Promise<void> => {
    if (!user) return;
    
    const newRowData = {
      user_id: user.id,
      name: '',
      category: 'Project',
      status: 'Watchlisted',
      archived: false,
      metadata: {}
    };

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([newRowData])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newRow: Row = {
          id: data.id,
          col_1: data.name || '',
          col_cat: data.category || 'Project',
          col_2: data.link || '',
          col_3: data.deadline || '',
          col_4: data.prize || '',
          col_5: data.status || 'Watchlisted',
          archived: data.archived,
          ...(data.metadata || {})
        };
        
        // Initialize other columns
        columns.forEach(col => {
          if (!newRow[col.id]) newRow[col.id] = '';
        });

        setRows([newRow, ...rows]);
      }
    } catch (error) {
      console.error('Error adding row:', error);
      alert('Failed to add new entry. Please try again.');
    }
  };

  const deleteRow = (rowId: string): void => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Entry',
      message: 'Are you sure you want to delete this entry? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', rowId);

          if (error) throw error;

          setRows(rows.filter(r => r.id !== rowId));
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          console.error('Error deleting row:', error);
          alert('Failed to delete entry. Please try again.');
        }
      }
    });
  };

  const toggleRowArchive = async (rowId: string): Promise<void> => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;

    const newArchivedStatus = !row.archived;

    // Optimistic update
    setRows(rows.map(r => r.id === rowId ? { ...r, archived: newArchivedStatus } : r));

    try {
      const { error } = await supabase
        .from('projects')
        .update({ archived: newArchivedStatus })
        .eq('id', rowId);

      if (error) {
        // Revert on error
        setRows(rows.map(r => r.id === rowId ? { ...r, archived: !newArchivedStatus } : r));
        throw error;
      }
    } catch (error) {
      console.error('Error toggling archive status:', error);
      alert('Failed to update archive status.');
    }
  };

  const updateCell = async (rowId: string, colId: string, value: string): Promise<void> => {
    // 1. Optimistic Update
    const updatedRows = rows.map(row => {
      if (row.id === rowId) {
        const updatedRow = { ...row, [colId]: value };
        
        // Auto-calculate conversion if Prize column is updated
        const prizeCol = columns.find(c => c.title === 'Prize');
        const convertedCol = columns.find(c => c.title === 'Converted');
        
        if (prizeCol && convertedCol && colId === prizeCol.id && exchangeRates) {
          const converted = calculateConversion(value, exchangeRates);
          if (converted) {
            updatedRow[convertedCol.id] = converted;
          }
        }
        
        return updatedRow;
      }
      return row;
    });
    setRows(updatedRows);

    // 2. DB Update
    try {
      const row = rows.find(r => r.id === rowId);
      if (!row) return;

      const updates: any = {};
      
      // Map column ID to DB field
      if (colId === 'col_1') updates.name = value;
      else if (colId === 'col_cat') updates.category = value;
      else if (colId === 'col_2') updates.link = value;
      else if (colId === 'col_3') updates.deadline = value || null; // Handle empty date
      else if (colId === 'col_4') updates.prize = value;
      else if (colId === 'col_5') updates.status = value;
      else if (colId === 'col_converted') {
        // Don't update DB for converted value, it's derived
        return; 
      } else {
        const currentMetadata: any = { ...row };
        delete currentMetadata.id;
        delete currentMetadata.col_1;
        delete currentMetadata.col_cat;
        delete currentMetadata.col_2;
        delete currentMetadata.col_3;
        delete currentMetadata.col_4;
        delete currentMetadata.col_5;
        delete currentMetadata.col_converted;
        delete currentMetadata.archived;
        
        updates.metadata = { ...currentMetadata, [colId]: value };
      }

      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', rowId);

      if (error) throw error;

    } catch (error) {
      console.error('Error updating cell:', error);
    }
  };

  const recalculateConversions = () => {
    if (!exchangeRates) return;
    
    const prizeCol = columns.find(c => c.title === 'Prize');
    const convertedCol = columns.find(c => c.title === 'Converted');
    
    if (!prizeCol || !convertedCol) return;

    const updatedRows = rows.map(row => {
      const prizeValue = String(row[prizeCol.id] || '');
      const converted = calculateConversion(prizeValue, exchangeRates);
      if (converted) {
        return { ...row, [convertedCol.id]: converted };
      }
      return row;
    });

    setRows(updatedRows);
  };

  // Automatically recalculate conversions when data or rate becomes available
  useEffect(() => {
    if (!exchangeRates || rows.length === 0) return;

    const prizeCol = columns.find(c => c.title === 'Prize');
    const convertedCol = columns.find(c => c.title === 'Converted');
    
    if (!prizeCol || !convertedCol) return;

    // Check if we have any rows that have a Prize but are missing Converted value
    const hasMissingConversions = rows.some(row => {
      const prizeStr = String(row[prizeCol.id] || '');
      // Check if prize has content (at least one digit)
      const hasPrize = /[0-9]/.test(prizeStr);
      const isMissingConverted = !row[convertedCol.id];
      return hasPrize && isMissingConverted;
    });

    if (hasMissingConversions) {
      recalculateConversions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangeRates, rows, columns]);

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
    
    // Filter by Archive Status
    filteredRows = filteredRows.filter(row => {
      const isArchived = !!row.archived;
      return showArchived ? isArchived : !isArchived;
    });
    
    // Apply filters
    Object.keys(filters).forEach(columnId => {
      const filterValue = filters[columnId].toLowerCase();
      if (filterValue) {
        filteredRows = filteredRows.filter(row => {
          const cellValue = String(row[columnId] || '').toLowerCase();
          return cellValue.includes(filterValue);
        });
      }
    });
    
    // Apply sorting
    if (sortConfig) {
      const column = columns.find(c => c.id === sortConfig.columnId);
      if (column) {
        filteredRows.sort((a, b) => {
          const aValue = String(a[sortConfig.columnId] || '');
          const bValue = String(b[sortConfig.columnId] || '');
          
          if (column.type === 'date') {
            const aDate = new Date(aValue).getTime();
            const bDate = new Date(bValue).getTime();
            return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
          } else if (column.title === 'Prize' || column.title === 'Converted') {
            // Sort by numerical value of the Converted column (IDR)
            // fallback to 0 if valid number can't be parsed
            const getNumericValue = (item: Row) => {
              // Always try to use the Converted column for sorting value if available
              // This normalizes different currencies (USD, EUR, etc) to IDR
              const convertedVal = String(item['col_converted'] || '');
              const cleanVal = convertedVal.replace(/[^0-9]/g, '');
              return cleanVal ? parseInt(cleanVal, 10) : 0;
            };

            const aNum = getNumericValue(a);
            const bNum = getNumericValue(b);
            
            return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
          } else if (column.type === 'text' && (String(aValue).match(/^\$?[\d,]+\.?\d*$/) || String(bValue).match(/^\$?[\d,]+\.?\d*$/))) {
            const aNum = parseFloat(String(aValue).replace(/[$,Rp\s]/g, '')) || 0;
            const bNum = parseFloat(String(bValue).replace(/[$,Rp\s]/g, '')) || 0;
            return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
          } else {
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

  const handleQuickFilter = (type: 'category' | 'status', value: string): void => {
    const column = columns.find(c => c.type === type);
    if (column) {
      if (filters[column.id] === value) {
        const newFilters = { ...filters };
        delete newFilters[column.id];
        setFilters(newFilters);
      } else {
        handleFilterChange(column.id, value);
      }
    }
  };

  const clearAllFilters = (): void => {
    setFilters({});
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
    event.target.value = '';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-zinc-950 text-zinc-500' : 'bg-zinc-50 text-zinc-900'}`}>
      
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
        

        {/* Table Controls (Toolbar + Filters) with Hero Background */}
        <div className="relative overflow-hidden rounded-3xl mb-8 shadow-xl">
          {/* Background Image & Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage} 
              alt="Dashboard Header" 
              className="w-full h-full object-cover object-[50%_25%] transition-transform duration-700 hover:scale-105"
            />
            <div className={`absolute inset-0 transition-colors duration-300 ${darkMode ? 'bg-zinc-900/70' : 'bg-zinc-900/70'}`} />
          </div>

          <div className="relative z-10 p-6 sm:p-8">
            <TableToolbar 
              showArchived={showArchived}
              showFilters={showFilters}
              darkMode={true}
              exchangeRates={exchangeRates}
              isRateLoading={isRateLoading}
              onToggleArchived={() => setShowArchived(!showArchived)}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onRecalculate={recalculateConversions}
              onDownload={downloadJSON}
              onUpload={uploadJSON}
              onAddColumn={addColumn}
              onAddRow={addRow}
            />

            <QuickFilters 
              columns={columns}
              filters={filters}
              darkMode={true}
              onQuickFilter={handleQuickFilter}
              onClearFilters={clearAllFilters}
            />
          </div>
        </div>

        {/* Table Container */}
        <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${darkMode ? 'border-zinc-800 bg-zinc-900/30 shadow-inner shadow-black/20' : 'border-zinc-200 bg-white shadow-xl shadow-zinc-200/50'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm table-fixed">
              
              <TableHeader 
                columns={columns}
                filters={filters}
                sortConfig={sortConfig}
                showFilters={showFilters}
                darkMode={darkMode}
                onSort={handleSort}
                onUpdateHeader={updateHeader}
                onDeleteColumn={deleteColumn}
                onFilterChange={handleFilterChange}
              />

              {/* Table Body */}
              <tbody className={`divide-y ${darkMode ? 'divide-zinc-800' : 'divide-zinc-100'}`}>
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                          Loading projects...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (() => {
                  const displayRows = getFilteredAndSortedRows();
                  return displayRows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className={`p-4 rounded-full ${darkMode ? 'bg-zinc-900 text-zinc-600' : 'bg-zinc-50 text-zinc-500'}`}>
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
                      <TableRow 
                        key={row.id}
                        row={row}
                        columns={columns}
                        editingCell={editingCell}
                        showArchived={showArchived}
                        darkMode={darkMode}
                        onUpdateCell={updateCell}
                        onEditStart={(rowId, colId) => setEditingCell({ rowId, colId })}
                        onEditEnd={() => setEditingCell(null)}
                        onArchive={toggleRowArchive}
                        onDelete={deleteRow}
                      />
                    ))
                  );
                })()}
              </tbody>
            </table>
          </div>
          
          {/* Footer / Stats */}
          <div className={`px-8 py-4 border-t text-xs flex justify-between items-center ${darkMode ? 'border-zinc-800 bg-zinc-900/30 text-zinc-500' : 'border-zinc-100 bg-zinc-50/50 text-zinc-400'}`}>
            <span className="font-medium">Total Entries: <span className={`ml-1 ${darkMode ? 'text-zinc-500' : 'text-zinc-700'}`}>{rows.length}</span></span>
            <span className={darkMode ? 'text-zinc-600' : 'text-zinc-400'}>Last Updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </main>

      <ConfirmDialog 
        dialog={confirmDialog}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        darkMode={darkMode}
      />
    </div>
  );
}
