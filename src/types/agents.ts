// Agent system types for the Claude Code IDE

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  status: AgentStatus;
  capabilities: AgentCapability[];
  config: AgentConfig;
  metadata: AgentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export type AgentType = 
  | 'orchestrator'
  | 'frontend-architect'
  | 'backend-architect'
  | 'database-specialist'
  | 'devops-specialist'
  | 'ui-ux'
  | 'test-architect'
  | 'documentor'
  | 'evaluator'
  | 'structure-updater';

export type AgentStatus = 
  | 'idle'
  | 'active'
  | 'busy'
  | 'error'
  | 'offline'
  | 'paused';

export type AgentCapability = 
  | 'code-generation'
  | 'code-review'
  | 'testing'
  | 'documentation'
  | 'deployment'
  | 'monitoring'
  | 'optimization'
  | 'debugging'
  | 'architecture-design'
  | 'ui-design'
  | 'database-design'
  | 'api-design'
  | 'workflow-management';

export interface AgentConfig {
  maxConcurrentTasks: number;
  timeout: number;
  retryAttempts: number;
  priority: number;
  dependencies: string[];
  environment: Record<string, string>;
  tools: string[];
  permissions: AgentPermission[];
}

export interface AgentMetadata {
  version: string;
  author: string;
  tags: string[];
  icon?: string;
  color?: string;
  category: string;
}

export interface AgentPermission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface AgentTask {
  id: string;
  agentId: string;
  type: TaskType;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  input: TaskInput;
  output?: TaskOutput;
  progress: number;
  estimatedDuration?: number;
  actualDuration?: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  parentTaskId?: string;
  childTaskIds: string[];
  dependencies: string[];
  metadata: Record<string, any>;
}

export type TaskType = 
  | 'code-generation'
  | 'code-review'
  | 'testing'
  | 'documentation'
  | 'deployment'
  | 'analysis'
  | 'optimization'
  | 'debugging'
  | 'refactoring';

export type TaskStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskInput {
  prompt?: string;
  files?: string[];
  context?: Record<string, any>;
  parameters?: Record<string, any>;
}

export interface TaskOutput {
  files?: {
    path: string;
    content: string;
    action: 'create' | 'update' | 'delete';
  }[];
  summary: string;
  recommendations?: string[];
  metrics?: Record<string, number>;
  artifacts?: {
    type: string;
    content: any;
    metadata: Record<string, any>;
  }[];
}

export interface AgentWorkflow {
  id: string;
  name: string;
  description: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  triggers: WorkflowTrigger[];
  variables: Record<string, any>;
  metadata: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowNode {
  id: string;
  type: 'agent' | 'condition' | 'merge' | 'split' | 'delay';
  position: { x: number; y: number };
  data: {
    agentId?: string;
    agentType?: AgentType;
    taskType?: TaskType;
    config?: Record<string, any>;
    label: string;
    description?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'conditional' | 'error';
  condition?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  };
  label?: string;
}

export interface WorkflowTrigger {
  id: string;
  type: 'manual' | 'file_change' | 'schedule' | 'event';
  config: {
    schedule?: string; // cron expression
    filePatterns?: string[];
    eventTypes?: string[];
    conditions?: Record<string, any>;
  };
  isEnabled: boolean;
}

export interface AgentMessage {
  id: string;
  agentId: string;
  taskId?: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'debug';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AgentMetrics {
  agentId: string;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageExecutionTime: number;
  successRate: number;
  uptime: number;
  lastActiveAt: Date;
  performanceScore: number;
}

export interface AgentContext {
  agents: Agent[];
  tasks: AgentTask[];
  workflows: AgentWorkflow[];
  messages: AgentMessage[];
  metrics: Record<string, AgentMetrics>;
  
  // Agent management
  createAgent: (config: Partial<Agent>) => Promise<Agent>;
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<Agent>;
  deleteAgent: (id: string) => Promise<void>;
  startAgent: (id: string) => Promise<void>;
  stopAgent: (id: string) => Promise<void>;
  
  // Task management
  createTask: (task: Partial<AgentTask>) => Promise<AgentTask>;
  cancelTask: (taskId: string) => Promise<void>;
  pauseTask: (taskId: string) => Promise<void>;
  resumeTask: (taskId: string) => Promise<void>;
  
  // Workflow management
  createWorkflow: (workflow: Partial<AgentWorkflow>) => Promise<AgentWorkflow>;
  updateWorkflow: (id: string, updates: Partial<AgentWorkflow>) => Promise<AgentWorkflow>;
  executeWorkflow: (id: string, input?: Record<string, any>) => Promise<string>;
  stopWorkflow: (executionId: string) => Promise<void>;
  
  // Communication
  sendMessage: (agentId: string, message: string, type?: AgentMessage['type']) => Promise<void>;
  subscribeToMessages: (callback: (message: AgentMessage) => void) => () => void;
  
  // Monitoring
  getMetrics: (agentId?: string) => Promise<AgentMetrics | Record<string, AgentMetrics>>;
  subscribeToMetrics: (callback: (metrics: Record<string, AgentMetrics>) => void) => () => void;
}