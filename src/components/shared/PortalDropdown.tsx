import React, { useState, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

export interface PortalDropdownProps {
  children: React.ReactNode;
  anchorRef: React.RefObject<HTMLElement>;
  isOpen: boolean;
  darkMode: boolean;
  width?: string;
  className?: string;
}

export const PortalDropdown: React.FC<PortalDropdownProps> = ({ 
  children, 
  anchorRef, 
  isOpen, 
  darkMode,
  width = 'w-48',
  className = ''
}) => {
  const [position, setPosition] = useState<{ top: number; left: number; placement: 'bottom' | 'top' } | null>(null);

  useLayoutEffect(() => {
    if (isOpen && anchorRef.current) {
      const updatePosition = () => {
        if (!anchorRef.current) return;
        const rect = anchorRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 300; // Estimated max height

        const dropdownWidth = width === 'w-48' ? 192 : width === 'w-72' ? 288 : width === 'w-40' ? 160 : 200; // Estimate width based on class
        const windowWidth = window.innerWidth;
        
        let top = rect.bottom + 2; // Reduced gap from 4 to 2
        let placement: 'bottom' | 'top' = 'bottom';

        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
           // Place above
           top = rect.top - 2; 
           placement = 'top';
        }

        let left = rect.left;
        
        if (left + dropdownWidth > windowWidth - 16) {
           const potentialLeft = rect.right - dropdownWidth;
           left = Math.max(16, potentialLeft);
        }

        setPosition({
          top,
          left,
          placement
        });
      };

      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, anchorRef]);

  // Handle click outside
  useEffect(() => {
    return () => {};
  }, [isOpen, anchorRef]);


  if (!isOpen || !position) return null;

  return createPortal(
    <div 
        className={`fixed z-[9999] ${width} ${className} shadow-xl border rounded-xl overflow-hidden duration-150 ${darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-900'}`}
        style={{  
            top: position.top, 
            left: position.left,
            transform: position.placement === 'top' ? 'translateY(-100%)' : 'none'
        }}
    >
      {children}
    </div>,
    document.body
  );
};
