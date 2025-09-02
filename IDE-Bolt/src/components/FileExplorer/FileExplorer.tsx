import React, { useState } from 'react';
import { Plus, Search, MoreHorizontal } from 'lucide-react';
import { FileTree } from './FileTree';
import { useWorkspaceStore } from '../../store/workspace';

export const FileExplorer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const { files, addFile } = useWorkspaceStore();

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFile = () => {
    const name = prompt('File name:');
    if (name) {
      addFile('/home/project', name, 'file');
    }
    setShowCreateMenu(false);
  };

  const handleCreateFolder = () => {
    const name = prompt('Folder name:');
    if (name) {
      addFile('/home/project', name, 'folder');
    }
    setShowCreateMenu(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Files
          </h3>
          <div className="relative">
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="p-1.5 rounded-md hover:bg-gray-700 transition-colors"
              title="Create new file or folder"
            >
              <Plus size={16} />
            </button>
            
            {showCreateMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10">
                <button
                  onClick={handleCreateFile}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 transition-colors"
                >
                  New File
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 transition-colors"
                >
                  New Folder
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        <FileTree files={filteredFiles} />
      </div>
    </div>
  );
};