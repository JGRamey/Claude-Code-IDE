import React from 'react';
import { 
  Play, 
  Square, 
  Menu, 
  Settings, 
  Sun, 
  Moon, 
  Bot,
  Terminal as TerminalIcon,
  Folder,
  Search,
  GitBranch,
  Share2
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspace';
import { useAIStore } from '../../store/ai';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { 
    projectName, 
    setProjectName, 
    editor, 
    setTheme, 
    toggleTerminal, 
    terminal 
  } = useWorkspaceStore();
  const { isActive: aiActive, toggleAI } = useAIStore();

  const handleThemeToggle = () => {
    setTheme(editor.theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 z-10">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-gray-700 transition-colors"
          title="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent text-lg font-semibold text-white border-none outline-none focus:bg-gray-700 px-2 py-1 rounded"
            placeholder="Project Name"
          />
        </div>
      </div>

      {/* Center Section - Run Controls */}
      <div className="flex items-center space-x-2">
        <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition-colors">
          <Play size={16} />
          <span className="font-medium">Run</span>
        </button>
        <button className="p-2 rounded-md hover:bg-gray-700 transition-colors">
          <Square size={16} />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {}}
          className="p-2 rounded-md hover:bg-gray-700 transition-colors"
          title="Search"
        >
          <Search size={20} />
        </button>
        
        <button
          onClick={() => {}}
          className="p-2 rounded-md hover:bg-gray-700 transition-colors"
          title="Source Control"
        >
          <GitBranch size={20} />
        </button>

        <button
          onClick={toggleTerminal}
          className={`p-2 rounded-md transition-colors ${
            terminal.isOpen ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
          }`}
          title="Toggle Terminal"
        >
          <TerminalIcon size={20} />
        </button>

        <button
          onClick={toggleAI}
          className={`p-2 rounded-md transition-colors ${
            aiActive ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'
          }`}
          title="Toggle AI Assistant"
        >
          <Bot size={20} />
        </button>

        <button
          onClick={handleThemeToggle}
          className="p-2 rounded-md hover:bg-gray-700 transition-colors"
          title="Toggle Theme"
        >
          {editor.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          className="p-2 rounded-md hover:bg-gray-700 transition-colors"
          title="Share"
        >
          <Share2 size={20} />
        </button>

        <button
          className="p-2 rounded-md hover:bg-gray-700 transition-colors"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};