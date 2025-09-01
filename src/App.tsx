import React from 'react';
import { Header } from './components/Layout';
import { FileExplorer } from './components/FileExplorer';
import { CodeEditor } from './components/Editor';
import { PreviewPanel } from './components/Preview';
import { Terminal } from './components/Terminal';
import { WorkflowEditor } from './components/WorkflowEditor';
import { ChatPanel } from './components/ChatPanel';
import { AgentStatus } from './components/AgentStatus';
import { SettingsPanel } from './components/Settings';
import { SplitPanel } from './components/Layout';
import { useAppStore } from './stores';
import { useClaudeCode } from './hooks/useClaudeCode';
import { useDockerStatus } from './hooks/useDockerStatus';
import { useWebSocket } from './hooks/useWebSocket';
import './globals.css';

function App() {
  const { 
    activeTab, 
    showSettings, 
    isRunning, 
    selectedFile,
    setActiveTab,
    setShowSettings,
    toggleRunning
  } = useAppStore();

  // Initialize Claude Code CLI connection
  const { claudeCodeStatus, sendCommand } = useClaudeCode();
  
  // Monitor Docker container status
  const { dockerStatus, containerMetrics } = useDockerStatus();
  
  // WebSocket connection for real-time updates
  const { isConnected, agentActivity } = useWebSocket();

  const renderMainContent = () => {
    switch (activeTab) {
      case 'editor':
        return (
          <SplitPanel
            left={<CodeEditor file={selectedFile} />}
            right={<PreviewPanel />}
            defaultSplit={60}
          />
        );
      case 'preview':
        return <PreviewPanel fullscreen />;
      case 'workflow':
        return <WorkflowEditor />;
      case 'terminal':
        return <Terminal />;
      default:
        return <CodeEditor file={selectedFile} />;
    }
  };

  return (
    <div className="h-screen w-full bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <Header
        isRunning={isRunning}
        dockerStatus={dockerStatus}
        claudeCodeStatus={claudeCodeStatus}
        onToggleRun={toggleRunning}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar - File Explorer */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <FileExplorer />
        </div>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab Bar */}
          <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center">
            {['editor', 'preview', 'workflow', 'terminal'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm border-r border-gray-700 transition-colors capitalize ${
                  activeTab === tab 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-750'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex min-h-0">
            {renderMainContent()}
            
            {/* Settings Overlay */}
            {showSettings && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="w-4/5 h-4/5 max-w-6xl">
                  <SettingsPanel onClose={() => setShowSettings(false)} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Panel - Claude Code Chat */}
      <ChatPanel 
        claudeCodeStatus={claudeCodeStatus}
        onSendCommand={sendCommand}
        agentActivity={agentActivity}
      />

      {/* Agent Status Overlay */}
      {isRunning && (
        <AgentStatus 
          agents={agentActivity}
          containerMetrics={containerMetrics}
          isConnected={isConnected}
        />
      )}
    </div>
  );
}

export default App;