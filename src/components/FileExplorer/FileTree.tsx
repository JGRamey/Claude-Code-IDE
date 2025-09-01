import React, { useState, useCallback } from 'react';
import { FileNode as FileNodeComponent } from './FileNode';
import { FileNode } from '../../types';

interface FileTreeProps {
  nodes: FileNode[];
  selectedFile: FileNode | null;
  expandedFolders: Set<string>;
  onFileSelect: (node: FileNode) => void;
  onToggleFolder: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
}

export function FileTree({
  nodes,
  selectedFile,
  expandedFolders,
  onFileSelect,
  onToggleFolder,
  onContextMenu
}: FileTreeProps) {
  const [draggedNode, setDraggedNode] = useState<FileNode | null>(null);
  const [dropTarget, setDropTarget] = useState<FileNode | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, node: FileNode) => {
    setDraggedNode(node);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', node.path);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, node: FileNode) => {
    if (node.type === 'folder' && draggedNode && draggedNode.path !== node.path) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDropTarget(node);
    }
  }, [draggedNode]);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetNode: FileNode) => {
    e.preventDefault();
    
    if (draggedNode && targetNode.type === 'folder' && draggedNode.path !== targetNode.path) {
      // Implement file move logic here
      console.log(`Moving ${draggedNode.path} to ${targetNode.path}`);
      // This would call a move function from the file service
    }
    
    setDraggedNode(null);
    setDropTarget(null);
  }, [draggedNode]);

  const renderFileNode = useCallback((node: FileNode, depth: number = 0) => {
    const isSelected = selectedFile?.path === node.path;
    const isExpanded = expandedFolders.has(node.path);
    const isDropTarget = dropTarget?.path === node.path;

    return (
      <div key={node.path}>
        <FileNodeComponent
          node={node}
          depth={depth}
          isSelected={isSelected}
          isExpanded={isExpanded}
          isDropTarget={isDropTarget}
          onSelect={() => onFileSelect(node)}
          onToggle={() => node.type === 'folder' && onToggleFolder(node.path)}
          onContextMenu={(e) => onContextMenu(e, node)}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => handleDragOver(e, node)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node)}
        />
        
        {/* Render children if folder is expanded */}
        {node.type === 'folder' && isExpanded && node.children && (
          <div className="ml-2">
            {node.children
              .sort((a, b) => {
                // Sort folders first, then files alphabetically
                if (a.type !== b.type) {
                  return a.type === 'folder' ? -1 : 1;
                }
                return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
              })
              .map(child => renderFileNode(child, depth + 1))
            }
          </div>
        )}
      </div>
    );
  }, [
    selectedFile,
    expandedFolders,
    dropTarget,
    onFileSelect,
    onToggleFolder,
    onContextMenu,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop
  ]);

  return (
    <div className="file-tree select-none">
      {nodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <FileText className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">No files in workspace</p>
          <button 
            className="mt-2 text-xs text-blue-400 hover:text-blue-300"
            onClick={() => onContextMenu({} as React.MouseEvent, { path: '', type: 'folder' } as FileNode)}
          >
            Create first file
          </button>
        </div>
      ) : (
        <div className="space-y-0.5">
          {nodes.map(node => renderFileNode(node))}
        </div>
      )}

      {/* Drag overlay */}
      {draggedNode && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-2 py-1 rounded text-sm">
            Moving: {draggedNode.name}
          </div>
        </div>
      )}
    </div>
  );
}