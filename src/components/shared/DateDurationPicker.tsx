import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar, Clock } from 'lucide-react';

export interface DateDurationPickerProps {
  darkMode: boolean;
  onSave: (val: string) => void;
  onCancel: () => void;
}

export const DateDurationPicker: React.FC<DateDurationPickerProps> = ({ darkMode, onSave, onCancel }) => {
  const [days, setDays] = useState<string>('0');
  const [hours, setHours] = useState<string>('0');
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Focus days input on mount inside the portal
    const timer = setTimeout(() => {
      containerRef.current?.querySelector('input')?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const previewTime = useMemo(() => {
    const d = parseInt(days) || 0;
    const h = parseInt(hours) || 0;
    const now = new Date();
    // Use current time as base
    now.setDate(now.getDate() + d);
    now.setHours(now.getHours() + h);
    return now;
  }, [days, hours]);

  const handleSave = () => {
    // Use toISOString() to convert local time to UTC format
    // This ensures Supabase stores the correct timestamp regardless of timezone
    onSave(previewTime.toISOString());
  };

  return (
    <div
      ref={containerRef}
      className={`p-4 flex flex-col gap-4 cursor-default`}
      onClick={(e) => e.stopPropagation()}
      tabIndex={-1}
      onBlur={(e) => {
        // Only cancel if focus moves outside the container
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          onCancel();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Set Deadline</h4>
        <div className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
          ADD TO NOW
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium opacity-70 block">Days</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              onFocus={() => days === '0' && setDays('')}
              className={`w-full pl-8 pr-2 py-1.5 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/20 ${
                darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
              }`}
            />
            <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium opacity-70 block">Hours</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              onFocus={() => hours === '0' && setHours('')}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className={`w-full pl-8 pr-2 py-1.5 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/20 ${
                darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
              }`}
            />
            <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
          </div>
        </div>
      </div>

      <div className={`text-xs p-2 rounded-lg text-center border ${
        darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
      }`}>
        <div className="opacity-60 mb-1">Pass Deadline</div>
        <div className="font-medium text-blue-500 text-sm">
          {previewTime.toLocaleString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/20 cursor-pointer"
      >
        Set Deadline
      </button>
    </div>
  );
};
