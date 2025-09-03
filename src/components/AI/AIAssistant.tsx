import React, { useState } from 'react';
import { Bot, Send, Lightbulb, Code, FileText, Bug } from 'lucide-react';
import { useAIStore } from '../../store/ai';
import { claudeCodeCLI } from '../../services/claudeCodeCLI';
import { useWorkspaceStore } from '../../store/workspace';

export const AIAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { currentQuery, setCurrentQuery, setSuggestions } = useAIStore();
  const { editor } = useWorkspaceStore();

  const activeFile = editor.openFiles.find(f => f.id === editor.activeFileId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to conversation
    const newConversation = [
      ...conversation,
      { role: 'user' as const, content: userMessage, timestamp: new Date() }
    ];
    setConversation(newConversation);

    try {
      // Get context from active file if available
      const context = activeFile ? `Current file: ${activeFile.name}\n${activeFile.content}` : '';
      
      const response = await claudeCodeCLI.generateCode(userMessage, context);
      
      // Add AI response to conversation
      setConversation([
        ...newConversation,
        { role: 'assistant', content: response, timestamp: new Date() }
      ]);
    } catch (error) {
      setConversation([
        ...newConversation,
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.', 
          timestamp: new Date() 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (!activeFile) return;

    setIsLoading(true);
    const userMessage = `${action}: ${activeFile.name}`;
    
    const newConversation = [
      ...conversation,
      { role: 'user' as const, content: userMessage, timestamp: new Date() }
    ];
    setConversation(newConversation);

    try {
      let response: string;
      
      switch (action) {
        case 'Explain Code':
          response = await claudeCodeCLI.explainCode(activeFile.content || '');
          break;
        case 'Debug Code':
          response = await claudeCodeCLI.debugCode(activeFile.content || '', 'Please analyze for potential issues');
          break;
        case 'Optimize':
          response = await claudeCodeCLI.optimizeCode(activeFile.content || '');
          break;
        default:
          response = await claudeCodeCLI.askAssistant(`Generate a React component for ${action}`, activeFile.content);
      }

      setConversation([
        ...newConversation,
        { role: 'assistant', content: response, timestamp: new Date() }
      ]);
    } catch (error) {
      setConversation([
        ...newConversation,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      icon: <Code size={16} />,
      label: 'Generate Code',
      action: () => setInput('Generate a React component for '),
    },
    {
      icon: <Bug size={16} />,
      label: 'Debug Code',
      action: () => handleQuickAction('Debug Code'),
      disabled: !activeFile,
    },
    {
      icon: <FileText size={16} />,
      label: 'Explain Code',
      action: () => handleQuickAction('Explain Code'),
      disabled: !activeFile,
    },
    {
      icon: <Lightbulb size={16} />,
      label: 'Optimize',
      action: () => handleQuickAction('Optimize'),
      disabled: !activeFile,
    },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Claude Assistant</h3>
            <p className="text-xs text-gray-400">AI-powered coding help</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              disabled={action.disabled || isLoading}
              className={`flex items-center space-x-2 p-2 rounded-md transition-colors text-sm ${
                action.disabled 
                  ? 'bg-gray-600 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              <div className={`${action.disabled ? 'text-gray-500' : 'text-purple-400'}`}>
                {action.icon}
              </div>
              <span className="text-xs">{action.label}</span>
            </button>
          ))}
        </div>
        
        {/* Context Indicator */}
        {activeFile && (
          <div className="mt-3 text-xs text-gray-400 bg-gray-700 rounded px-2 py-1">
            <span className="text-green-400">●</span> Context: {activeFile.name}
          </div>
        )}
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Bot size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-lg font-medium mb-2">Ready to assist!</p>
            <p className="text-sm">Ask me anything about your code or project.</p>
          </div>
        ) : (
          conversation.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-150"></div>
                <span className="text-sm text-gray-400 ml-2">Claude is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Claude anything..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};