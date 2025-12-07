import React from 'react';
import type { Row } from '../table/types';
import { ProjectCard } from './ProjectCard';

interface ActiveProjectsGridProps {
  rows: Row[];
  darkMode: boolean;
  onUpdate: (rowId: string, colId: string, value: string) => void;
  onArchive: (rowId: string) => void;
  onDelete: (rowId: string) => void;
}

export const ActiveProjectsGrid: React.FC<ActiveProjectsGridProps> = ({
  rows,
  darkMode,
  onUpdate,
  onArchive,
  onDelete
}) => {
  const activeProjects = rows.filter(row => String(row.col_5 || '').toLowerCase() === 'active');

  if (activeProjects.length === 0) return null;

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-2 mb-4">
        <h3 className={`text-lg font-semibold tracking-tight ${darkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
          Active Projects
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${darkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-600'}`}>
          {activeProjects.length}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeProjects.map(row => (
          <ProjectCard
            key={row.id}
            row={row}
            darkMode={darkMode}
            onUpdate={onUpdate}
            onArchive={onArchive}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
