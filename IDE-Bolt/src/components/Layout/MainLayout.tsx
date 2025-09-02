import React, { useEffect, useState } from 'react';
import { Resizable } from 'react-resizable';
import { Header } from './Header';
import { FileExplorer } from '../FileExplorer/FileExplorer';
import { EditorPanel } from '../Editor/EditorPanel';
import { Terminal } from '../Terminal/Terminal';
import { AIAssistant } from '../AI/AIAssistant';
import { useWorkspaceStore } from '../../store/workspace';
import { useAIStore } from '../../store/ai';
import { socketService } from '../../services/socket';
import { fileSystemService } from '../../services/fileSystem';

export const MainLayout: React.FC = () => {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [aiPanelWidth, setAIPanelWidth] = useState(320);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { files, terminal, initializeWorkspace, addTerminalOutput } = useWorkspaceStore();
  const { isActive: aiActive } = useAIStore();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Initialize WebSocket connection
    const socket = socketService.connect();
    
    if (socket) {
      socket.on('file-changed', (data) => {
        addTerminalOutput(`File changed: ${data.path}`);
      });

      socket.on('terminal-output', (data) => {
        addTerminalOutput(data.output);
      });
    }

    // Load initial file structure
    loadFiles();

    return () => {
      socketService.disconnect();
    };
  }, []);

  const loadFiles = async () => {
    const rootFiles = await fileSystemService.readDirectory('/home/project');
    initializeWorkspace(rootFiles);
  };

  const effectiveSidebarWidth = sidebarCollapsed ? 0 : sidebarWidth;
  const effectiveAIPanelWidth = aiActive ? aiPanelWidth : 0;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      <Header 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - File Explorer */}
        {!sidebarCollapsed && (
          <Resizable
            width={sidebarWidth}
            height={0}
            onResize={(_, { size }) => setSidebarWidth(size.width)}
            axis="x"
            minConstraints={[200, 0]}
            maxConstraints={[500, 0]}
            resizeHandles={['e']}
            handle={
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors" />
            }
          >
            <div 
              className="h-full bg-gray-800 border-r border-gray-700 flex flex-col"
              style={{ width: sidebarWidth }}
            >
              <FileExplorer />
            </div>
          </Resizable>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor */}
          <Resizable
            width={0}
            height={window.innerHeight - 64 - (terminal.isOpen ? terminalHeight : 0)}
            onResize={(_, { size }) => setTerminalHeight(window.innerHeight - 64 - size.height)}
            axis="y"
            minConstraints={[0, 300]}
            maxConstraints={[0, window.innerHeight - 200]}
            resizeHandles={terminal.isOpen ? ['s'] : []}
            handle={
              terminal.isOpen ? (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 hover:bg-blue-500 cursor-row-resize transition-colors" />
              ) : undefined
            }
          >
            <div className="h-full flex">
              <div className="flex-1">
                <EditorPanel />
              </div>
            </div>
          </Resizable>

          {/* Terminal */}
          {terminal.isOpen && (
            <div 
              className="bg-gray-900 border-t border-gray-700"
              style={{ height: terminalHeight }}
            >
              <Terminal />
            </div>
          )}
        </div>

        {/* AI Assistant Panel */}
        {aiActive && (
          <Resizable
            width={aiPanelWidth}
            height={0}
            onResize={(_, { size }) => setAIPanelWidth(size.width)}
            axis="x"
            minConstraints={[280, 0]}
            maxConstraints={[600, 0]}
            resizeHandles={['w']}
            handle={
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors" />
            }
          >
            <div 
              className="h-full bg-gray-800 border-l border-gray-700"
              style={{ width: aiPanelWidth }}
            >
              <AIAssistant />
            </div>
          </Resizable>
        )}
      </div>
    </div>
  );
};