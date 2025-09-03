import React, { useState, useRef, useEffect } from 'react';

interface ResizablePanelProps {
  direction: 'horizontal' | 'vertical';
  initialSize: number;
  minSize: number;
  maxSize: number;
  children: React.ReactNode;
  className?: string;
  onResize?: (size: number) => void;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  direction,
  initialSize,
  minSize,
  maxSize,
  children,
  className = '',
  onResize
}) => {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return;

      const rect = panelRef.current.getBoundingClientRect();
      let newSize;

      if (direction === 'horizontal') {
        newSize = e.clientX - rect.left;
      } else {
        newSize = e.clientY - rect.top;
      }

      newSize = Math.max(minSize, Math.min(maxSize, newSize));
      setSize(newSize);
      onResize?.(newSize);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, direction, minSize, maxSize, onResize]);

  const style = direction === 'horizontal' 
    ? { width: `${size}px` }
    : { height: `${size}px` };

  return (
    <div
      ref={panelRef}
      className={`relative ${className}`}
      style={style}
    >
      {children}
      
      {/* Resize Handle */}
      <div
        className={`absolute bg-gray-700 hover:bg-blue-500 cursor-${
          direction === 'horizontal' ? 'col' : 'row'
        }-resize transition-colors z-10 ${
          direction === 'horizontal'
            ? 'right-0 top-0 bottom-0 w-1'
            : 'bottom-0 left-0 right-0 h-1'
        }`}
        onMouseDown={() => setIsResizing(true)}
      />
    </div>
  );
};