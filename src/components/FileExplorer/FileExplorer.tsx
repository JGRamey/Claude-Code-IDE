import React, { useState, useCallback, useRef } from 'react';
import { FileTree } from './FileTree';
import { ContextMenu } from './ContextMenu';
import { useFileSystem } from '../../hooks/useFileSystem';
import { useAppStore } from '../../stores';
import { FileNode } from '../../types';
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  FolderPlus, 
  FileText,
  Settings,
  ChevronDown
} from 'lucide-react';

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  node: FileNode | null;
}

export function FileExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showHiddenFiles, setShowHiddenFiles] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    node: null
  });
  
  const explorerRef = useRef<HTMLDivElement>(null);
  const { selectedFile, setSelectedFile } = useAppStore();
  
  const {
    fileTree,
    expandedFolders,
    isLoading,
    error,
    createFile,
    createFolder,
    deleteNode,
    renameNode,
    moveNode,
    refreshTree,
    toggleFolder,
    searchFiles
  } = useFileSystem();

  const handleContextMenu = useCallback((e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      node
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleFileSelect = useCallback((node: FileNode) => {
    if (node.type === 'file') {
      setSelectedFile(node);
    }
  }, [setSelectedFile]);

  const handleCreateFile = useCallback(async (parentPath: string) => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      await createFile(parentPath, fileName);
    }
    closeContextMenu();
  }, [createFile, closeContextMenu]);

  const handleCreateFolder = useCallback(async (parentPath: string) => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      await createFolder(parentPath, folderName);
    }
    closeContextMenu();
  }, [createFolder, closeContextMenu]);

  const handleDelete = useCallback(async (node: FileNode) => {
    if (confirm(`Are you sure you want to delete "${node.name}"?`)) {
      await deleteNode(node.path);
    }
    closeContextMenu();
  }, [deleteNode, closeContextMenu]);

  const handleRename = useCallback(async (node: FileNode) => {
    const newName = prompt('Enter new name:', node.name);
    if (newName && newName !== node.name) {
      await renameNode(node.path, newName);
    }
    closeContextMenu();
  }, [renameNode, closeContextMenu]);

  const filteredFiles = searchTerm 
    ? searchFiles(searchTerm, showHiddenFiles)
    : fileTree;

  return (
    <div 
      ref={explorerRef}
      className="h-full flex flex-col bg-gray-800"
      onClick={closeContextMenu}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-300">Explorer</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleCreateFile('')}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="New File"
            >
              <FileText className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleCreateFolder('')}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="New Folder"
            >
              <FolderPlus className="w-3 h-3" />
            </button>
            <button
              onClick={refreshTree}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
            <button
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Settings"
            >
              <Settings className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Options */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowHiddenFiles(!showHiddenFiles)}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              showHiddenFiles ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Filter className="w-3 h-3" />
            Hidden Files
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-400">Loading files...</span>
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm p-2 bg-red-900/20 rounded">
            Error: {error}
          </div>
        ) : (
          <FileTree
            nodes={filteredFiles}
            selectedFile={selectedFile}
            expandedFolders={expandedFolders}
            onFileSelect={handleFileSelect}
            onToggleFolder={toggleFolder}
            onContextMenu={handleContextMenu}
          />
        )}
      </div>

      {/* Context Menu */}
      {contextMenu.isOpen && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={contextMenu.node!}
          onCreateFile={() => handleCreateFile(contextMenu.node!.path)}
          onCreateFolder={() => handleCreateFolder(contextMenu.node!.path)}
          onDelete={() => handleDelete(contextMenu.node!)}
          onRename={() => handleRename(contextMenu.node!)}
          onClose={closeContextMenu}
        />
      )}

      {/* Git Status (if available) */}
      <div className="border-t border-gray-700 p-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Git: main</span>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓ 3</span>
            <span className="text-yellow-400">● 2</span>
            <span className="text-red-400">✗ 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}