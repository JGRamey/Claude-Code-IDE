// File System Types
export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  modified?: boolean;
  lastModified?: string;
  created?: string;
  gitStatus?: 'unmodified' | 'modified' | 'added' | 'deleted' | 'renamed';
  language?: string;
  encoding?: string;
  content?: string;
  children?: FileNode[];
  permissions?: {
    read: boolean;
    write: boolean;
    execute: boolean;
  };
}

export interface FileOperation {
  type: 'create' | 'delete' | 'rename' | 'move' | 'modify';
  path: string;
  newPath?: string;
  content?: string;
  timestamp: string;
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'frontend' | 'backend' | 'database' | 'testing' | 'deployment' | 'analysis' | 'security';
  status: 'idle' | 'active' | 'error' | 'disabled';
  capabilities: string[];
  config: Record<string, any>;
  lastActivity?: string;
  performance?: {
    tasksCompleted: number;
    averageResponseTime: number;
    successRate: number;
  };
}

export interface AgentActivity {
  agentId: string;
  agentName: string;
  activity: string;
  status: 'started' | 'in-progress' | 'completed' | 'error';
  timestamp: string;
  metadata?: Record<string, any>;
}

// Workflow Types
export interface WorkflowNode {
  id: string;
  type: 'input' | 'agent' | 'decision' | 'output' | 'parallel' | 'merge';
  position: { x: number; y: number };
  data: {
    label: string;
    agentId?: string;
    condition?: string;
    script?: string;
  };
  style?: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'smoothstep' | 'step' | 'straight';
  animated?: boolean;
  style?: Record<string, any>;
  label?: string;
  condition?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  version: string;
  isActive: boolean;
  created: string;
  modified: string;
}

// Docker Types
export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'error' | 'building';
  ports: { host: number; container: number }[];
  volumes: { host: string; container: string }[];
  environment: Record<string, string>;
  created: string;
  started?: string;
}

export interface DockerMetrics {
  cpuUsage: number;
  memoryUsage: number;
  memoryLimit: number;
  networkRx: number;
  networkTx: number;
  diskRead: number;
  diskWrite: number;
  timestamp: string;
}

export interface DockerConfig {
  image: string;
  ports: { host: number; container: number }[];
  volumes: { host: string; container: string }[];
  environment: Record<string, string>;
  buildArgs?: Record<string, string>;
  dockerfile?: string;
  context?: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  type: 'user' | 'claude' | 'agent' | 'system';
  content: string;
  agentId?: string;
  timestamp: string;
  metadata?: {
    command?: string;
    files?: string[];
    codeBlocks?: {
      language: string;
      code: string;
    }[];
  };
}

export interface ChatSession {
  id: string;
  projectId: string;
  messages: ChatMessage[];
  created: string;
  lastActivity: string;
  context: {
    currentFile?: string;
    openFiles: string[];
    activeAgents: string[];
  };
}

// Claude Code CLI Types
export interface ClaudeCodeCommand {
  id: string;
  instruction: string;
  context: {
    workspacePath: string;
    selectedFile?: FileNode;
    openFiles?: FileNode[];
    projectType?: string;
    framework?: string;
  };
  timestamp: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface ClaudeCodeResponse {
  commandId: string;
  agentId: string;
  result?: string;
  error?: string;
  files?: {
    created?: string[];
    modified?: string[];
    deleted?: string[];
  };
  suggestions?: string[];
  timestamp: string;
}

// Terminal Types
export interface TerminalSession {
  id: string;
  name: string;
  type: 'bash' | 'zsh' | 'cmd' | 'powershell' | 'claude-code';
  cwd: string;
  history: TerminalCommand[];
  isActive: boolean;
  created: string;
}

export interface TerminalCommand {
  id: string;
  command: string;
  output?: string;
  error?: string;
  exitCode?: number;
  timestamp: string;
  duration?: number;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  path: string;
  type: 'react' | 'vue' | 'angular' | 'node' | 'python' | 'custom';
  framework?: string;
  templateId?: string;
  config: {
    agents: string[];
    workflow: string;
    docker: DockerConfig;
    deployment: {
      provider: string;
      config: Record<string, any>;
    };
  };
  created: string;
  lastOpened: string;
  status: 'active' | 'building' | 'error' | 'stopped';
}

// Settings Types
export interface IDESettings {
  theme: 'dark' | 'light' | 'auto';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
  formatOnSave: boolean;
  livePreview: boolean;
  hotReload: boolean;
  agentCollaboration: boolean;
  workflowAutoExecute: boolean;
  dockerAutoStart: boolean;
  terminalShell: string;
  keybindings: Record<string, string>;
}

export interface UserPreferences {
  recentProjects: string[];
  favoriteAgents: string[];
  customWorkflows: string[];
  workspaceLayout: {
    sidebarWidth: number;
    bottomPanelHeight: number;
    rightPanelWidth: number;
    activeTab: string;
  };
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'agent-activity' | 'file-operation' | 'command-response' | 'workflow-update' | 'docker-status' | 'system-notification';
  data: any;
  timestamp: string;
}

// Error Types
export interface IDEError {
  id: string;
  type: 'file-system' | 'docker' | 'claude-code' | 'network' | 'build';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: string;
  timestamp: string;
  resolved?: boolean;
  actions?: {
    label: string;
    action: () => void;
  }[];
}

// Template Types
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'web' | 'mobile' | 'desktop' | 'api' | 'ml' | 'game';
  framework: string;
  features: string[];
  fileStructure: FileNode[];
  config: {
    docker: DockerConfig;
    agents: string[];
    workflow: string;
    dependencies: Record<string, string>;
  };
  thumbnail?: string;
  documentation?: string;
}

// Event Types
export type IDEEvent = 
  | { type: 'file-selected'; payload: FileNode }
  | { type: 'file-modified'; payload: { path: string; content: string } }
  | { type: 'agent-activated'; payload: Agent }
  | { type: 'command-sent'; payload: ClaudeCodeCommand }
  | { type: 'workflow-executed'; payload: Workflow }
  | { type: 'docker-started'; payload: DockerContainer }
  | { type: 'error-occurred'; payload: IDEError };

// Store Types (for Zustand)
export interface AppState {
  // UI State
  activeTab: string;
  showSettings: boolean;
  isRunning: boolean;
  sidebarCollapsed: boolean;
  
  // File State
  selectedFile: FileNode | null;
  openFiles: FileNode[];
  fileTree: FileNode[];
  expandedFolders: Set<string>;
  
  // Agent State
  agents: Agent[];
  agentActivity: AgentActivity[];
  activeWorkflow: Workflow | null;
  
  // Docker State
  dockerStatus: string;
  containerMetrics: DockerMetrics | null;
  
  // Chat State
  chatMessages: ChatMessage[];
  activeChatSession: string | null;
  
  // Settings
  settings: IDESettings;
  preferences: UserPreferences;
  
  // Error State
  errors: IDEError[];
}

export interface AppActions {
  // UI Actions
  setActiveTab: (tab: string) => void;
  setShowSettings: (show: boolean) => void;
  toggleRunning: () => void;
  toggleSidebar: () => void;
  
  // File Actions
  setSelectedFile: (file: FileNode | null) => void;
  addOpenFile: (file: FileNode) => void;
  removeOpenFile: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
  setFileTree: (tree: FileNode[]) => void;
  toggleFolder: (path: string) => void;
  
  // Agent Actions
  setAgents: (agents: Agent[]) => void;
  updateAgentStatus: (agentId: string, status: Agent['status']) => void;
  addAgentActivity: (activity: AgentActivity) => void;
  setActiveWorkflow: (workflow: Workflow | null) => void;
  
  // Docker Actions
  setDockerStatus: (status: string) => void;
  setContainerMetrics: (metrics: DockerMetrics) => void;
  
  // Chat Actions
  addChatMessage: (message: ChatMessage) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  setActiveChatSession: (sessionId: string | null) => void;
  
  // Settings Actions
  updateSettings: (settings: Partial<IDESettings>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  
  // Error Actions
  addError: (error: IDEError) => void;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
}

// Utility Types
export type TabType = 'editor' | 'preview' | 'workflow' | 'terminal' | 'settings';
export type PanelLayout = 'horizontal' | 'vertical' | 'grid';
export type ThemeMode = 'dark' | 'light' | 'auto';

// Event Handler Types
export type FileSelectHandler = (file: FileNode) => void;
export type CommandHandler = (instruction: string, context?: any) => Promise<string>;
export type AgentActivityHandler = (activity: AgentActivity) => void;
export type ErrorHandler = (error: IDEError) => void;