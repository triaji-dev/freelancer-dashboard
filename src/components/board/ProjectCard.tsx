import React, { useState, useEffect, useRef } from 'react';
import { 
  ExternalLink, 
  Archive, 
  Trash2, 
  Clock
} from 'lucide-react';
import type { Row } from '../table/types';
import { STATUS_OPTIONS } from '../table/types';
import { PortalDropdown } from '../shared/PortalDropdown';
import { DateDurationPicker } from '../shared/DateDurationPicker';

interface ProjectCardProps {
  row: Row;
  darkMode: boolean;
  onUpdate: (rowId: string, colId: string, value: string) => void;
  onArchive: (rowId: string) => void;
  onDelete: (rowId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  row,
  darkMode,
  onUpdate,
  onArchive,
  onDelete
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);

  // Countdown Logic
  useEffect(() => {
    if (!row.col_3) {
      setTimeLeft('No deadline');
      return;
    }

    const calculateTimeLeft = () => {
      const deadline = new Date(String(row.col_3));
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        return 'Expired';
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) return `${days}d ${hours}h left`;
      if (hours > 0) return `${hours}h ${minutes}m left`;
      return `${minutes}m left`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000); // Update every minute

    return () => clearInterval(timer);
  }, [row.col_3]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      case 'submitted': return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'pending': return 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20';
      default: return 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/50';
    }
  };

  return (
    <div className={`group relative rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg ${
      darkMode 
        ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900' 
        : 'bg-white border-zinc-100 hover:border-zinc-200'
    }`}>
      {/* Header: Status & Actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
          <button
            ref={statusButtonRef}
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${getStatusColor(String(row.col_5 || 'Watchlisted'))}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            {row.col_5 || 'Watchlisted'}
          </button>
          
          <PortalDropdown
            anchorRef={statusButtonRef}
            isOpen={isStatusOpen}
            darkMode={darkMode}
            width="w-40"
          >
            <div className="p-1 flex flex-col gap-0.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={`px-3 py-2 text-sm text-left rounded-lg transition-colors w-full cursor-pointer ${
                    String(row.col_5) === opt 
                     ? (darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-700')
                     : (darkMode ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900')
                  }`}
                  onClick={() => {
                    onUpdate(row.id, 'col_5', opt);
                    setIsStatusOpen(false);
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[-1]" onClick={() => setIsStatusOpen(false)} />
          </PortalDropdown>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onArchive(row.id)}
            className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors cursor-pointer"
            title="Archive"
          >
            <Archive size={14} />
          </button>
          <button 
            onClick={() => onDelete(row.id)}
            className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-3">
         <div>
            <div className="text-xs font-medium text-zinc-400 mb-1 flex items-center gap-2">
              {String(row.col_cat || 'Project')}
            </div>
            <h3 className={`font-semibold text-lg leading-tight line-clamp-2 mb-1 ${darkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
              {String(row.col_1 || 'Untitled Project')}
            </h3>
            {row.col_2 && (
              <a 
                href={String(row.col_2)} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 hover:underline"
              >
                View Project <ExternalLink size={10} />
              </a>
            )}
         </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-2 gap-3 pt-2">
            <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-zinc-50 border-zinc-100'}`}>
               <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block mb-1">Prize</span>
               <div className="font-medium text-sm truncate">
                  {String(row.col_4 || '-')}
               </div>
               <div className="text-xs text-zinc-500 mt-0.5 truncate">
                  {String(row.col_converted || '')}
               </div>
            </div>

            <div className={`relative p-2.5 rounded-xl border ${darkMode ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-zinc-50 border-zinc-100'}`}>
               <div className="flex items-center justify-between mb-1">
                 <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Deadline</span>
                 <button 
                    ref={dateButtonRef}
                    onClick={() => setIsDateOpen(!isDateOpen)}
                    className="text-zinc-400 hover:text-blue-500 transition-colors cursor-pointer"
                  >
                    <Clock size={12} />
                 </button>
               </div>
               
               <div className={`font-medium text-sm ${timeLeft === 'Expired' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {timeLeft}
               </div>
               <div className="text-xs text-zinc-500 mt-0.5">
                  {row.col_3 ? new Date(String(row.col_3)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No date'}
               </div>

                <PortalDropdown
                  anchorRef={dateButtonRef}
                  isOpen={isDateOpen}
                  darkMode={darkMode}
                  width="w-72"
                >
                  <DateDurationPicker
                    darkMode={darkMode}
                    onSave={(val) => {
                      onUpdate(row.id, 'col_3', val);
                      setIsDateOpen(false);
                    }}
                    onCancel={() => setIsDateOpen(false)}
                  />
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-[-1]" onClick={() => setIsDateOpen(false)} />
                </PortalDropdown>
            </div>
         </div>
      </div>
    </div>
  );
};
