import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { AppState, AppActions, FileNode, Agent, AgentActivity, Workflow, DockerMetrics, ChatMessage, IDESettings, UserPreferences, IDEError } from '../types';

// Default settings
const defaultSettings: IDESettings = {
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
  tabSize: 2,
  wordWrap: true,
  minimap: true,
  lineNumbers: true,
  autoSave: true,
  autoSaveDelay: 1000,
  formatOnSave: true,
  livePreview: true,
  hotReload: true,
  agentCollaboration: true,
  workflowAutoExecute: false,
  dockerAutoStart: true,
  terminalShell: 'bash',
  keybindings: {
    'cmd+s': 'save',
    'cmd+o': 'open',
    'cmd+p': 'command-palette',
    'cmd+shift+p': 'agent-command',
    'cmd+`': 'toggle-terminal',
    'cmd+b': 'toggle-sidebar',
    'cmd+shift+e': 'focus-explorer'
  }
};

const defaultPreferences: UserPreferences = {
  recentProjects: [],
  favoriteAgents: ['frontend', 'backend'],
  customWorkflows: [],
  workspaceLayout: {
    sidebarWidth: 256,
    bottomPanelHeight: 256,
    rightPanelWidth: 384,
    activeTab: 'editor'
  }
};

// Mock initial data
const mockFileTree: FileNode[] = [
  {
    id: 'root',
    name: 'my-app',
    path: '/my-app',
    type: 'folder',
    children: [
      {
        id: 'src',
        name: 'src',
        path: '/my-app/src',
        type: 'folder',
        children: [
          {
            id: 'app-tsx',
            name: 'App.tsx',
            path: '/my-app/src/App.tsx',
            type: 'file',
            language: 'typescript',
            content: 'import React from "react";\n\nfunction App() {\n  return (\n    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">\n      <h1 className="text-4xl font-bold text-white p-8">Hello Claude Code!</h1>\n    </div>\n  );\n}\n\nexport default App;',
            gitStatus: 'unmodified'
          },
          {
            id: 'index-tsx',
            name: 'index.tsx',
            path: '/my-app/src/index.tsx',
            type: 'file',
            language: 'typescript',
            content: 'import React from "react";\nimport ReactDOM from "react-dom";\nimport App from "./App";\n\nReactDOM.render(<App />, document.getElementById("root"));',
            gitStatus: 'unmodified'
          }
        ]
      },
      {
        id: 'public',
        name: 'public',
        path: '/my-app/public',
        type: 'folder',
        children: [
          {
            id: 'index-html',
            name: 'index.html',
            path: '/my-app/public/index.html',
            type: 'file',
            language: 'html',
            content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>',
            gitStatus: 'unmodified'
          }
        ]
      },
      {
        id: 'package-json',
        name: 'package.json',
        path: '/my-app/package.json',
        type: 'file',
        language: 'json',
        content: '{\n  "name": "my-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0",\n    "react-dom": "^18.0.0"\n  }\n}',
        gitStatus: 'unmodified'
      }
    ]
  }
];

const mockAgents: Agent[] = [
  {
    id: 'frontend',
    name: 'Frontend Agent',
    description: 'Handles React components, UI logic, and styling',
    type: 'frontend',
    status: 'idle',
    capabilities: ['react', 'typescript', 'css', 'tailwind', 'component-design'],
    config: { autoFormat: true, livePreview: true },
    performance: { tasksCompleted: 42, averageResponseTime: 2.3, successRate: 0.96 }
  },
  {
    id: 'backend',
    name: 'Backend Agent',
    description: 'Manages API endpoints, server logic, and database operations',
    type: 'backend',
    status: 'idle',
    capabilities: ['node.js', 'express', 'database', 'api-design', 'authentication'],
    config: { autoTest: true, documentation: true },
    performance: { tasksCompleted: 28, averageResponseTime: 3.1, successRate: 0.94 }
  },
  {
    id: 'testing',
    name: 'Testing Agent',
    description: 'Writes and maintains comprehensive test suites',
    type: 'testing',
    status: 'idle',
    capabilities: ['jest', 'cypress', 'unit-testing', 'e2e-testing', 'test-automation'],
    config: { coverage: 80, autoRun: false },
    performance: { tasksCompleted: 15, averageResponseTime: 4.2, successRate: 0.98 }
  }
];

export const useAppStore = create<AppState & AppActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    activeTab: 'editor',
    showSettings: false,
    isRunning: false,
    sidebarCollapsed: false,
    
    selectedFile: mockFileTree[0].children![0].children![0], // App.tsx
    openFiles: [mockFileTree[0].children![0].children![0]], // App.tsx
    fileTree: mockFileTree,
    expandedFolders: new Set(['/my-app', '/my-app/src']),
    
    agents: mockAgents,
    agentActivity: [],
    activeWorkflow: null,
    
    dockerStatus: 'running',
    containerMetrics: null,
    
    chatMessages: [
      {
        id: 'welcome',
        type: 'claude',
        content: "Welcome to Claude Code IDE! I'm ready to help you build amazing applications. Just tell me what you'd like to create and I'll coordinate with my specialized agents to make it happen.",
        timestamp: new Date().toISOString()
      }
    ],
    activeChatSession: null,
    
    settings: defaultSettings,
    preferences: defaultPreferences,
    errors: [],

    // UI Actions
    setActiveTab: (tab) => set({ activeTab: tab }),
    setShowSettings: (show) => set({ showSettings: show }),
    toggleRunning: () => set(state => ({ isRunning: !state.isRunning })),
    toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

    // File Actions
    setSelectedFile: (file) => set({ selectedFile: file }),
    addOpenFile: (file) => set(state => {
      const isAlreadyOpen = state.openFiles.some(f => f.path === file.path);
      if (!isAlreadyOpen) {
        return { openFiles: [...state.openFiles, file] };
      }
      return state;
    }),
    removeOpenFile: (path) => set(state => ({
      openFiles: state.openFiles.filter(f => f.path !== path)
    })),
    updateFileContent: (path, content) => set(state => {
      const updateNodeContent = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.path === path) {
            return { ...node, content, modified: true };
          }
          if (node.children) {
            return { ...node, children: updateNodeContent(node.children) };
          }
          return node;
        });
      };
      
      return {
        fileTree: updateNodeContent(state.fileTree),
        openFiles: state.openFiles.map(f => 
          f.path === path ? { ...f, content, modified: true } : f
        )
      };
    }),
    setFileTree: (tree) => set({ fileTree: tree }),
    toggleFolder: (path) => set(state => {
      const newExpanded = new Set(state.expandedFolders);
      if (newExpanded.has(path)) {
        newExpanded.delete(path);
      } else {
        newExpanded.add(path);
      }
      return { expandedFolders: newExpanded };
    }),

    // Agent Actions
    setAgents: (agents) => set({ agents }),
    updateAgentStatus: (agentId, status) => set(state => ({
      agents: state.agents.map(agent => 
        agent.id === agentId ? { ...agent, status, lastActivity: new Date().toISOString() } : agent
      )
    })),
    addAgentActivity: (activity) => set(state => ({
      agentActivity: [activity, ...state.agentActivity].slice(0, 100) // Keep last 100 activities
    })),
    setActiveWorkflow: (workflow) => set({ activeWorkflow: workflow }),

    // Docker Actions
    setDockerStatus: (status) => set({ dockerStatus: status }),
    setContainerMetrics: (metrics) => set({ containerMetrics: metrics }),

    // Chat Actions
    addChatMessage: (message) => set(state => ({
      chatMessages: [...state.chatMessages, message]
    })),
    setChatMessages: (messages) => set({ chatMessages: messages }),
    setActiveChatSession: (sessionId) => set({ activeChatSession: sessionId }),

    // Settings Actions
    updateSettings: (newSettings) => set(state => ({
      settings: { ...state.settings, ...newSettings }
    })),
    updatePreferences: (newPreferences) => set(state => ({
      preferences: { ...state.preferences, ...newPreferences }
    })),

    // Error Actions
    addError: (error) => set(state => ({
      errors: [error, ...state.errors]
    })),
    removeError: (errorId) => set(state => ({
      errors: state.errors.filter(e => e.id !== errorId)
    })),
    clearErrors: () => set({ errors: [] })
  }))
);

// Selectors for optimized subscriptions
export const selectFileState = (state: AppState) => ({
  selectedFile: state.selectedFile,
  openFiles: state.openFiles,
  fileTree: state.fileTree,
  expandedFolders: state.expandedFolders
});

export const selectAgentState = (state: AppState) => ({
  agents: state.agents,
  agentActivity: state.agentActivity,
  activeWorkflow: state.activeWorkflow
});

export const selectDockerState = (state: AppState) => ({
  dockerStatus: state.dockerStatus,
  containerMetrics: state.containerMetrics
});

export const selectChatState = (state: AppState) => ({
  chatMessages: state.chatMessages,
  activeChatSession: state.activeChatSession
});

export const selectUIState = (state: AppState) => ({
  activeTab: state.activeTab,
  showSettings: state.showSettings,
  isRunning: state.isRunning,
  sidebarCollapsed: state.sidebarCollapsed
});