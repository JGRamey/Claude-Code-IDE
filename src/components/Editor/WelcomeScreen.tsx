import React from 'react';
import { Folder, File, Bot, Zap, Code, GitBranch } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspace';
import { useAIStore } from '../../store/ai';

export const WelcomeScreen: React.FC = () => {
  const { projectName, addFile } = useWorkspaceStore();
  const { toggleAI } = useAIStore();

  const quickActions = [
    {
      icon: <File size={20} />,
      title: 'Create New File',
      description: 'Start coding with a new file',
      action: () => {
        const name = prompt('File name (with extension):');
        if (name) addFile('/home/project', name, 'file');
      },
    },
    {
      icon: <Folder size={20} />,
      title: 'Create New Folder',
      description: 'Organize your project structure',
      action: () => {
        const name = prompt('Folder name:');
        if (name) addFile('/home/project', name, 'folder');
      },
    },
    {
      icon: <Bot size={20} />,
      title: 'Ask Claude',
      description: 'Get AI assistance with your code',
      action: () => toggleAI(),
    },
    {
      icon: <GitBranch size={20} />,
      title: 'Initialize Git',
      description: 'Set up version control',
      action: () => {
        // Git initialization would go here
        console.log('Git initialization');
      },
    },
  ];

  return (
    <div className="h-full flex items-center justify-center bg-gray-900">
      <div className="max-w-2xl mx-auto text-center p-8">
        {/* Header */}
        <div className="mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Code size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome to Claude-Code IDE
          </h1>
          <h2 className="text-xl text-gray-400 mb-2">{projectName}</h2>
          <p className="text-gray-500">
            Your intelligent development environment powered by Claude AI
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 hover:bg-gray-750 transition-all group text-left"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gray-700 rounded-lg group-hover:bg-blue-600 transition-colors">
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-400">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Recent Projects or Getting Started */}
        <div className="text-gray-500 text-sm">
          <p className="mb-2">💡 <strong>Pro Tips:</strong></p>
          <ul className="text-left space-y-1 inline-block">
            <li>• Use <kbd className="bg-gray-800 px-2 py-1 rounded">Ctrl/Cmd + S</kbd> to save files</li>
            <li>• Press <kbd className="bg-gray-800 px-2 py-1 rounded">Ctrl/Cmd + `</kbd> to toggle terminal</li>
            <li>• Click the AI icon to get code assistance from Claude</li>
            <li>• Use the file explorer to manage your project structure</li>
          </ul>
        </div>
      </div>
    </div>
  );
};