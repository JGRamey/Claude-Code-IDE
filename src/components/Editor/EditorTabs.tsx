import React from 'react';
import { X, Circle } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspace';

export const EditorTabs: React.FC = () => {
  const { editor, closeFile, setActiveFile } = useWorkspaceStore();

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const colors = {
      tsx: 'text-cyan-400',
      jsx: 'text-cyan-400',
      ts: 'text-blue-400',
      js: 'text-yellow-400',
      css: 'text-pink-400',
      html: 'text-orange-400',
      json: 'text-green-400',
      md: 'text-blue-300',
    };
    
    return (
      <Circle 
        size={8} 
        className={colors[ext as keyof typeof colors] || 'text-gray-400'} 
        fill="currentColor"
      />
    );
  };

  return (
    <div className="flex items-center bg-gray-800 overflow-x-auto">
      {editor.openFiles.map((file) => (
        <div
          key={file.id}
          className={`flex items-center space-x-2 px-4 py-3 border-r border-gray-700 cursor-pointer group transition-colors ${
            editor.activeFileId === file.id
              ? 'bg-gray-900 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          onClick={() => setActiveFile(file.id)}
        >
          {getFileIcon(file.name)}
          <span className="text-sm whitespace-nowrap">{file.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeFile(file.id);
            }}
            className="p-0.5 rounded hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};