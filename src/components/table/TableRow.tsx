import React from 'react';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import type { Column, Row, EditingCell } from './types';
import { TableCell } from './TableCell';

interface TableRowProps {
  row: Row;
  columns: Column[];
  editingCell: EditingCell | null;
  showArchived: boolean;
  darkMode: boolean;
  onUpdateCell: (rowId: string, colId: string, value: string) => void;
  onEditStart: (rowId: string, colId: string) => void;
  onEditEnd: () => void;
  onArchive: (rowId: string) => void;
  onDelete: (rowId: string) => void;
}

export const TableRow: React.FC<TableRowProps> = ({
  row,
  columns,
  editingCell,
  showArchived,
  darkMode,
  onUpdateCell,
  onEditStart,
  onEditEnd,
  onArchive,
  onDelete,
}) => {
  return (
    <tr className={`group transition-all duration-200 h-16 ${darkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-blue-50/30'}`}>
      {columns.map((col) => (
        <td key={`${row.id}-${col.id}`} className="px-6 h-16 first:pl-8">
          <TableCell
            row={row}
            column={col}
            isEditing={editingCell?.rowId === row.id && editingCell?.colId === col.id}
            darkMode={darkMode}
            onUpdate={(val) => onUpdateCell(row.id, col.id, val)}
            onEditStart={() => onEditStart(row.id, col.id)}
            onEditEnd={onEditEnd}
          />
        </td>
      ))}
      
      {/* Row Actions */}
      <td className="px-6 py-3.5 text-center">
        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            onClick={() => onArchive(row.id)}
            className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${showArchived ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
            title={showArchived ? "Restore Entry" : "Archive Entry"}
            aria-label={showArchived ? "Restore Entry" : "Archive Entry"}
          >
            {showArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
          </button>
          <button 
            onClick={() => onDelete(row.id)}
            className="text-zinc-400 hover:text-rose-500 transition-all duration-200 p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer"
            title="Delete Entry"
            aria-label="Delete Entry"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};
