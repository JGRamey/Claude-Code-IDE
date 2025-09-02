import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  MoreHorizontal,
  Edit2,
  Trash2,
  Copy
} from 'lucide-react';
import { FileNode } from '../../types';
import { useWorkspaceStore } from '../../store/workspace';
import { FileTree } from './FileTree';

interface FileTreeItemProps {
  file: FileNode;
  level: number;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({ file, level }) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);

  const { 
    openFile, 
    toggleFolder, 
    deleteFile, 
    renameFile, 
    updateFileContent 
  } = useWorkspaceStore();

  const handleClick = async () => {
    if (file.type === 'folder') {
      toggleFolder(file.path);
    } else {
      // Load file content if not already loaded
      if (file.content === undefined) {
        const { fileSystemService } = await import('../../services/fileSystem');
        const content = await fileSystemService.readFile(file.path);
        updateFileContent(file.path, content);
        openFile({ ...file, content });
      } else {
        openFile(file);
      }
    }
  };

  const handleRename = () => {
    if (newName && newName !== file.name) {
      renameFile(file.path, newName);
    }
    setIsRenaming(false);
    setShowContextMenu(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${file.name}?`)) {
      deleteFile(file.path);
    }
    setShowContextMenu(false);
  };

  const getFileIcon = () => {
    if (file.type === 'folder') {
      return file.isOpen ? <FolderOpen size={16} /> : <Folder size={16} />;
    }
    return <File size={16} />;
  };

  const getFileColor = () => {
    if (file.type === 'folder') return 'text-blue-400';
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'jsx': return 'text-cyan-400';
      case 'ts':
      case 'js': return 'text-yellow-400';
      case 'css': return 'text-pink-400';
      case 'html': return 'text-orange-400';
      case 'json': return 'text-green-400';
      case 'md': return 'text-blue-300';
      default: return 'text-gray-300';
    }
  };

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer group relative transition-colors`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowContextMenu(true);
        }}
      >
        {/* Expand/Collapse Icon */}
        {file.type === 'folder' && (
          <div className="w-4 h-4 flex items-center justify-center mr-1">
            {file.isOpen ? (
              <ChevronDown size={12} className="text-gray-400" />
            ) : (
              <ChevronRight size={12} className="text-gray-400" />
            )}
          </div>
        )}

        {/* File/Folder Icon */}
        <div className={`mr-2 ${getFileColor()}`}>
          {getFileIcon()}
        </div>

        {/* File/Folder Name */}
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setIsRenaming(false);
                setNewName(file.name);
              }
            }}
            className="bg-gray-600 text-white px-1 py-0.5 text-sm rounded outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <span className="text-sm truncate flex-1">{file.name}</span>
        )}

        {/* Context Menu Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowContextMenu(!showContextMenu);
          }}
          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-600 transition-all ml-auto"
        >
          <MoreHorizontal size={14} />
        </button>

        {/* Context Menu */}
        {showContextMenu && (
          <div className="absolute right-0 top-full mt-1 w-32 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
                setShowContextMenu(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <Edit2 size={12} />
              <span>Rename</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Copy functionality would go here
                setShowContextMenu(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <Copy size={12} />
              <span>Copy</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 transition-colors flex items-center space-x-2 text-red-400"
            >
              <Trash2 size={12} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {file.type === 'folder' && file.isOpen && file.children && (
        <FileTree files={file.children} level={level + 1} />
      )}

      {/* Backdrop to close context menu */}
      {showContextMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowContextMenu(false)}
        />
      )}
    </div>
  );
};