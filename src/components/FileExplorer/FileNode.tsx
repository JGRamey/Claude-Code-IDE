import React, { useState, useRef, useEffect } from 'react';
import { FileNode as FileNodeType } from '../../types';
import { getFileIcon, getFileLanguage } from '../../utils/fileHelpers';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Circle,
  Dot
} from 'lucide-react';

interface FileNodeProps {
  node: FileNodeType;
  depth: number;
  isSelected: boolean;
  isExpanded: boolean;
  isDropTarget: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export function FileNode({
  node,
  depth,
  isSelected,
  isExpanded,
  isDropTarget,
  onSelect,
  onToggle,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop
}: FileNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.name);
  const [isHovered, setIsHovered] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  const fileIcon = getFileIcon(node.name, node.type);
  const language = getFileLanguage(node.name);
  const hasUnsavedChanges = node.modified || false;
  const hasGitChanges = node.gitStatus !== 'unmodified';

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'folder') {
      onToggle();
    } else {
      onSelect();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'file') {
      setIsEditing(true);
    }
  };

  const handleEditSubmit = () => {
    setIsEditing(false);
    // TODO: Implement rename functionality
    if (editValue !== node.name) {
      console.log(`Renaming ${node.name} to ${editValue}`);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(node.name);
    }
  };

  const paddingLeft = depth * 12 + 8;

  return (
    <div
      className={`relative group transition-colors duration-150 ${
        isSelected 
          ? 'bg-blue-600/20 text-blue-300 border-l-2 border-blue-500' 
          : isHovered 
            ? 'bg-gray-700/50' 
            : ''
      } ${isDropTarget ? 'bg-green-600/20 border border-green-500' : ''}`}
      style={{ paddingLeft }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={onContextMenu}
      draggable={!isEditing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex items-center gap-1 py-1 pr-2 min-h-6">
        {/* Expansion Arrow */}
        {node.type === 'folder' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-0.5 hover:bg-gray-600 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        )}

        {/* File/Folder Icon */}
        <div className="flex items-center justify-center w-4 h-4">
          {node.type === 'folder' ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-yellow-500" />
            ) : (
              <Folder className="w-4 h-4 text-yellow-600" />
            )
          ) : (
            <div className="text-base">{fileIcon}</div>
          )}
        </div>

        {/* File/Folder Name */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={editInputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={handleEditKeyDown}
              className="w-full bg-gray-700 border border-blue-500 rounded px-1 py-0 text-sm text-white focus:outline-none"
            />
          ) : (
            <span className={`text-sm truncate block ${
              node.type === 'folder' ? 'font-medium' : ''
            }`}>
              {node.name}
            </span>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-1 ml-1">
          {/* Unsaved Changes */}
          {hasUnsavedChanges && (
            <Circle className="w-2 h-2 fill-yellow-400 text-yellow-400" />
          )}
          
          {/* Git Status */}
          {hasGitChanges && (
            <div className={`w-1.5 h-1.5 rounded-full ${
              node.gitStatus === 'modified' ? 'bg-yellow-400' :
              node.gitStatus === 'added' ? 'bg-green-400' :
              node.gitStatus === 'deleted' ? 'bg-red-400' :
              'bg-gray-400'
            }`} />
          )}
        </div>
      </div>

      {/* Hover Actions */}
      {isHovered && !isEditing && (
        <div className="absolute right-1 top-1 flex items-center gap-0.5 bg-gray-800 rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-0.5 hover:bg-gray-600 rounded"
            title="Rename"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContextMenu(e);
            }}
            className="p-0.5 hover:bg-gray-600 rounded"
            title="More actions"
          >
            ⋯
          </button>
        </div>
      )}
    </div>
  );
}