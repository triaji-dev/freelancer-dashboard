import React from 'react';
import type { ConfirmDialogState } from './types';

interface ConfirmDialogProps {
  dialog: ConfirmDialogState;
  onClose: () => void;
  darkMode: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ dialog, onClose, darkMode }) => {
  if (!dialog.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm transition-all duration-300">
      <div className={`max-w-md w-full rounded-2xl shadow-2xl border transform transition-all scale-100 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-2">
          <h3 className={`text-lg font-bold ${darkMode ? 'text-zinc-500' : 'text-zinc-900'}`}>
            {dialog.title}
          </h3>
        </div>
        
        {/* Modal Body */}
        <div className="px-6 py-2">
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {dialog.message}
          </p>
        </div>
        
        {/* Modal Footer */}
        <div className="px-6 py-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 cursor-pointer ${darkMode ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-500' : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'}`}
          >
            Cancel
          </button>
          <button
            onClick={dialog.onConfirm}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-rose-600 text-white hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-600/20 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
