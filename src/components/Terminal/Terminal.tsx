import React, { useEffect, useRef, useState } from 'react';
import { X, Minimize2, Maximize2, RotateCcw } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspace';
import { socketService } from '../../services/socket';

export const Terminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { 
    terminal, 
    toggleTerminal, 
    addTerminalOutput, 
    setCurrentCommand, 
    clearTerminal 
  } = useWorkspaceStore();

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminal.output]);

  useEffect(() => {
    const socket = socketService.connect();
    if (socket) {
      socket.on('command-output', (data) => {
        addTerminalOutput(data.output);
      });

      socket.on('command-error', (data) => {
        addTerminalOutput(`Error: ${data.error}`);
      });
    }

    return () => {
      if (socket) {
        socket.off('command-output');
        socket.off('command-error');
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const command = input.trim();
    addTerminalOutput(`$ ${command}`);
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    setCurrentCommand(command);

    // Execute command via socket
    socketService.emit('execute-command', { command });

    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          setInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-4 text-sm font-medium text-gray-300">Terminal</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={clearTerminal}
            className="p-1.5 rounded-md hover:bg-gray-700 transition-colors"
            title="Clear Terminal"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={toggleTerminal}
            className="p-1.5 rounded-md hover:bg-gray-700 transition-colors"
            title="Close Terminal"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 flex flex-col">
        {/* Output */}
        <div 
          ref={terminalRef}
          className="flex-1 p-4 overflow-y-auto font-mono text-sm bg-gray-900"
        >
          {terminal.output.map((line, index) => (
            <div key={index} className="mb-1">
              <span className="text-green-400">{line}</span>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center p-4 border-t border-gray-700">
          <span className="text-green-400 font-mono text-sm mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent font-mono text-sm text-white outline-none"
            placeholder="Type your command..."
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};