import React, { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Column, Row } from './types';
import { STATUS_OPTIONS, CATEGORY_OPTIONS } from './types';
import { PortalDropdown } from '../shared/PortalDropdown';
import { DateDurationPicker } from '../shared/DateDurationPicker';

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
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>(null);
  const dateAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  


  // Close when clicking outside of both input and portal content
  useEffect(() => {
      if (!isEditing) return;
      const handleClickOutside = (e: MouseEvent) => {
         // If click is in inputRef (the trigger), ignore (it might be toggling, let onClick handle)
         if (inputRef.current && inputRef.current.contains(e.target as Node)) {
             return;
         }
         // If click is in the portal... but wait, the portal DOM node is at body level. 
         // We need to check if the target is contained within our specific portal instance.
         // However, we don't have a direct ref to the portal DOM node unless we pass it or query it.
         // Easier: use a backdrop or check specifically against `portalContentRef` which we will assume is inside the portal.
         // But PortalDropdown renders Children. We can wrap children in a div with ref.
         
         // Actually, simpler approach for this "Table Cell Edit Mode":
         // We typically want to close edit mode if user clicks anywhere else in the table.
         // `onEditEnd` should be called.
         
         // Check if click target is NOT in inputRef and NOT in portal.
         // Since Portal is not in this component's DOM tree, `inputRef.current.contains` won't work for it.
         // We need a ref to the content inside the portal.
         
         // Let's assume we pass a generic 'click outside' handler to the document.
         const target = e.target as Node;
         
         // We need to know if the click was inside the portal.
         // Since the portal renders `children`, we can wrap children in a div with `portalContentRef`.
         // But `PortalDropdown` is generic. Let's make `PortalDropdown` handle the ref check if possible?
         // No, let's just assume we need a ref in the content we pass to PortalDropdown.
          
         // FIX: Use a data attribute or class to identify our dropdowns or just perform the check on the known elements.
         // The simplest way is to check if `e.target` is connected to the document (it might be removed if we just clicked an option).
         if (!document.body.contains(target)) return;
         
         // We can use the fact that events bubble. But this is a window listener.
         // Let's try to trust the `onBlur` of the input/button first, but Portals confuse onBlur.
         // The focus stays on the button or moves to the portal content.
         
         // If we are using a Portal, `onBlur` from the button will trigger when we click the portal (since it's outside button).
         // So we need to prevent `onEditEnd` if the new focus is in the portal.
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing]);



  const getStatusColor = (status?: string): string => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";
    switch (status?.toLowerCase()) {
      case 'active': return `${base} bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20`;
      case 'submitted': return `${base} bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20`;
      case 'canceled': return `${base} bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/50`;
      case 'bookmarked': return `${base} bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20`;
      case 'watchlisted': return `${base} bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30`;
      case 'pending': return `${base} bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20`;
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

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const commonInputClasses = `w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${darkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-white border-zinc-200 text-zinc-900'}`;

  if (isEditing) {
    if (column.type === 'status' || column.type === 'category') {
      const options = column.type === 'status' ? STATUS_OPTIONS : CATEGORY_OPTIONS;
      
      return (
        <div className="relative h-full flex items-center">
            {/* 
              We use a transparent overlay or rely on the container's onBlur to close.
              Using tabindex to allow the div to receive focus/blur events.
            */}
            <button
              ref={inputRef as React.RefObject<HTMLButtonElement>}
              autoFocus
              className={commonInputClasses + " text-left cursor-default flex items-center justify-between"}
              onBlur={() => {
                  // For Portals: checking relatedTarget is tricky because the portal is outside the React tree in DOM structure?
                  // Actually `createPortal` preserves React Event bubbling, so `onBlur` on the button *might* catch focus moving to the portal children
                  // IF the portal children are considered part of the tree.
                  // BUT for `e.relatedTarget` (DOM node), it will be the div in <body>.
                  // So `e.currentTarget.contains` (the button) will respond false.
                  
                  // We need to check if the relatedTarget is part of our Portal.
                  // Since we don't have an easy ref to the portal root DOM here, we can use a class or ID check
                  // OR we can rely on the fact that if we are clicking "Status Options", we handle the click explicitly.
                  // If we click outside, we want to close.
                  
                  // A common hack: delay the close slightly. If a reusable option is clicked, it will fire BEFORE the timeout closes it.
                  // setTimeout(() => onEditEnd(), 100);
                  
                  // Better: Don't close on blur immediately. Let the global click handler or specific interactions close it.
                  // But we need to support Tabbing out.
              }}
            >
              {String(row[column.id] || (column.type === 'status' ? 'Watchlisted' : 'Project'))}
            </button>
            
            <PortalDropdown
              anchorRef={inputRef as React.RefObject<HTMLElement>}
              isOpen={true} // Always open when isEditing
              darkMode={darkMode}
              width="w-48"
            >
              <div className="flex flex-col gap-0.5 p-1">
                {options.map((opt) => (
                  <button
                    key={opt}
                    // Prevent default on mousedown to stop focus from leaving the trigger button completely?
                    // Actually we want focus to move here if we key down.
                    className={`px-3 py-2 text-sm text-left rounded-lg transition-colors ${
                       String(row[column.id]) === opt 
                        ? (darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-700')
                        : (darkMode ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900')
                    }`}
                    onClick={() => {
                        onUpdate(opt);
                        onEditEnd();
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </PortalDropdown>
            
            {/* Overlay to handle clicking outside if we want to be strict, but the PortalDropdown doesn't block interactions. 
                We rely on the "Clicking an option closes it" and "Clicking outside (handled by a listener?)"
                Actually, the easiest way to handle "Click outside closes" with a Portal 
                is to have an invisible fixed backdrop.
            */}
            <div className="fixed inset-0 z-[9998]" onClick={onEditEnd} />
        </div>
      );
    }

    if (column.type === 'date') {
      return (
        <div ref={dateAnchorRef} className="relative h-full flex items-center bg-blue">
          {/* Use a div as the anchor ref holder, or we can attach ref to the container div above? 
              The container div has 'h-full flex items-center', but passing that ref is fine. 
          */}
          <PortalDropdown
             anchorRef={dateAnchorRef}
             isOpen={true}
             darkMode={darkMode}
             width="w-72"
             // Custom class for the picker which has specific styling
             className=""
          >
             <DateDurationPicker
                darkMode={darkMode}
                onSave={(val) => {
                  onUpdate(val);
                  onEditEnd();
                }}
                onCancel={onEditEnd}
              />
          </PortalDropdown>
           {/* Invisible backdrop for clicking outside */}
           <div className="fixed inset-0 z-[9998]" onClick={onEditEnd} />
        </div>
      );
    }

    return (
      <div className="flex items-center h-full">
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
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
      className={`${column.title === 'Converted' ? 'cursor-default' : 'cursor-pointer'} h-full flex items-center`}
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
            String(row[column.id] || '')?.toLowerCase() === 'pending' ? 'bg-orange-500' :
            'bg-zinc-400'
          }`}></span>
          {row[column.id] || 'Watchlisted'}
        </span>
      ) : column.type === 'category' ? (
        <span className={getCategoryColor(String(row[column.id] || ''))}>
          {row[column.id] || 'Project'}
        </span>
      ) : column.type === 'date' ? (
        <span className={!row[column.id] ? 'text-zinc-500 dark:text-zinc-700 text-sm italic' : 'text-zinc-800 dark:text-zinc-400'}>
          {row[column.id] ? formatDate(String(row[column.id])) : 'Empty'}
        </span>
      ) : (
        <span className={!row[column.id] ? 'text-zinc-500 dark:text-zinc-700 text-sm italic' : 'text-zinc-800 dark:text-zinc-400'}>
          {row[column.id] || 'Empty'}
        </span>
      )}
    </div>
  );
};
