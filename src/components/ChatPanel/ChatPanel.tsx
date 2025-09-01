import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { AgentIndicator } from './AgentIndicator';
import { useAppStore } from '../../stores';
import { ChatMessage, AgentActivity } from '../../types';
import { 
  Zap, 
  MessageSquare, 
  Settings, 
  Download, 
  Trash2, 
  Copy,
  Send,
  Paperclip,
  Smile,
  History,
  Brain,
  Users,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ChatPanelProps {
  claudeCodeStatus: string;
  onSendCommand: (instruction: string, context?: any) => Promise<string>;
  agentActivity: AgentActivity[];
}

export function ChatPanel({ 
  claudeCodeStatus, 
  onSendCommand, 
  agentActivity 
}: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [chatMode, setChatMode] = useState<'chat' | 'command' | 'collaboration'>('chat');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    chatMessages,
    selectedFile,
    openFiles,
    agents,
    addChatMessage,
    isRunning
  } = useAppStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus input when panel is opened
  useEffect(() => {
    if (inputRef.current && !isMaximized) {
      inputRef.current.focus();
    }
  }, [isMaximized]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
      metadata: {
        files: attachedFiles,
        codeBlocks: extractCodeBlocks(message)
      }
    };

    addChatMessage(userMessage);
    setMessage('');
    setIsTyping(true);
    setAttachedFiles([]);

    try {
      // Prepare context for Claude Code
      const context = {
        selectedFile,
        openFiles,
        attachedFiles,
        chatMode,
        projectStructure: generateProjectStructure(),
        activeAgents: agents.filter(agent => agent.status === 'active').map(a => a.id)
      };

      // Send command to Claude Code
      const response = await onSendCommand(message.trim(), context);

      // Add Claude's response
      const claudeResponse: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'claude',
        content: response,
        timestamp: new Date().toISOString(),
        metadata: {
          command: message.trim(),
          context: Object.keys(context)
        }
      };

      addChatMessage(claudeResponse);

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'system',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };

      addChatMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  }, [
    message, 
    isTyping, 
    attachedFiles, 
    selectedFile, 
    openFiles, 
    chatMode, 
    agents, 
    addChatMessage, 
    onSendCommand
  ]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'ArrowUp' && message === '') {
      // TODO: Navigate through message history
    }
  }, [message, handleSendMessage]);

  const handleFileAttach = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const filePaths = files.map(file => file.name);
    setAttachedFiles(prev => [...prev, ...filePaths]);
  }, []);

  const suggestedCommands = [
    'Create a new React component',
    'Add authentication to the app',
    'Set up a database connection',
    'Write tests for the current file',
    'Optimize the app performance',
    'Add error handling',
    'Create an API endpoint',
    'Style this component with Tailwind'
  ];

  const extractCodeBlocks = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2]
      });
    }
    
    return blocks;
  };

  const generateProjectStructure = () => {
    // Generate a simplified project structure for context
    return {
      files: openFiles.map(f => ({ name: f.name, path: f.path, language: f.language })),
      selectedFile: selectedFile ? { name: selectedFile.name, path: selectedFile.path } : null,
      activeAgents: agents.filter(a => a.status === 'active').map(a => a.id)
    };
  };

  return (
    <div className={`bg-gray-800 border-t border-gray-700 flex flex-col ${
      isMaximized ? 'fixed inset-0 z-50' : 'h-64'
    }`}>
      {/* Chat Header */}
      <div className="h-10 bg-gray-750 border-b border-gray-600 flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Claude Code Assistant</span>
          </div>
          
          {/* Chat Mode Selector */}
          <div className="flex items-center gap-1 border border-gray-600 rounded">
            <button
              onClick={() => setChatMode('chat')}
              className={`px-2 py-1 text-xs rounded-l transition-colors ${
                chatMode === 'chat' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3 h-3 inline mr-1" />
              Chat
            </button>
            <button
              onClick={() => setChatMode('command')}
              className={`px-2 py-1 text-xs transition-colors ${
                chatMode === 'command' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Brain className="w-3 h-3 inline mr-1" />
              Command
            </button>
            <button
              onClick={() => setChatMode('collaboration')}
              className={`px-2 py-1 text-xs rounded-r transition-colors ${
                chatMode === 'collaboration' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3 h-3 inline mr-1" />
              Collab
            </button>
          </div>

          {/* Claude Code Status */}
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
            claudeCodeStatus === 'connected' 
              ? 'bg-green-900/50 text-green-400' 
              : 'bg-red-900/50 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              claudeCodeStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            {claudeCodeStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Actions */}
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={`p-1.5 rounded transition-colors ${
              showSuggestions ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="Show Suggestions"
          >
            <History className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => {
              const chatText = chatMessages.map(msg => 
                `[${msg.type.toUpperCase()}] ${msg.content}`
              ).join('\n\n');
              navigator.clipboard.writeText(chatText);
            }}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Copy Chat History"
          >
            <Copy className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => {
              if (confirm('Clear all chat messages?')) {
                useAppStore.getState().setChatMessages([]);
              }
            }}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title={isMaximized ? 'Minimize' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Suggestions Panel */}
      {showSuggestions && (
        <div className="h-20 bg-gray-750 border-b border-gray-600 p-3 overflow-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-400">Quick Commands:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {suggestedCommands.map((command, index) => (
              <button
                key={index}
                onClick={() => setMessage(command)}
                className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded hover:bg-gray-500 transition-colors"
              >
                {command}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              {chatMessages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    C
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="ml-2 text-gray-400 text-sm">Claude is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700">
            {/* Attached Files */}
            {attachedFiles.length > 0 && (
              <div className="p-2 bg-gray-750 border-b border-gray-600">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400">Attached:</span>
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-1 bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs">
                      <span>{file}</span>
                      <button
                        onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div className="flex items-end gap-2 p-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    chatMode === 'chat' 
                      ? 'Ask Claude Code anything...'
                      : chatMode === 'command'
                        ? 'Enter a specific command...'
                        : 'Start a collaboration session...'
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 min-h-10 max-h-32"
                  rows={1}
                  style={{ 
                    height: 'auto',
                    minHeight: '40px',
                    maxHeight: '128px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />

                {/* Input Actions */}
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <button
                    onClick={handleFileAttach}
                    className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                    title="Attach Files"
                  >
                    <Paperclip className="w-3 h-3" />
                  </button>
                  
                  <button
                    className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                    title="Emojis"
                  >
                    <Smile className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping || claudeCodeStatus !== 'connected'}
                className={`p-2.5 rounded-lg transition-colors ${
                  message.trim() && !isTyping && claudeCodeStatus === 'connected'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Agent Activity Sidebar */}
        <div className="w-64 border-l border-gray-700 bg-gray-750">
          <div className="p-3 border-b border-gray-600">
            <h4 className="text-sm font-medium text-gray-300">Agent Activity</h4>
          </div>
          
          <div className="p-3 space-y-3 overflow-auto max-h-40">
            {agentActivity.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No active agents</p>
              </div>
            ) : (
              agentActivity.slice(0, 10).map((activity) => (
                <AgentIndicator key={activity.agentId + activity.timestamp} activity={activity} />
              ))
            )}
          </div>

          {/* Active Agents Summary */}
          <div className="border-t border-gray-600 p-3">
            <h5 className="text-xs font-medium text-gray-400 mb-2">Active Agents</h5>
            <div className="space-y-1">
              {agents
                .filter(agent => agent.status === 'active')
                .map(agent => (
                  <div key={agent.id} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">{agent.name}</span>
                  </div>
                ))
              }
              {agents.filter(a => a.status === 'active').length === 0 && (
                <p className="text-xs text-gray-500">No agents currently active</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* File Input for Attachments */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Status Indicator */}
      {!isRunning && (
        <div className="absolute top-2 right-2 bg-yellow-900/80 text-yellow-300 px-2 py-1 rounded text-xs">
          Development server not running
        </div>
      )}
    </div>
  );
}