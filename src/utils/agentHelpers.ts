// Agent utility functions for the Claude Code IDE

import {
  Agent,
  AgentType,
  AgentStatus,
  AgentCapability,
  AgentTask,
  TaskStatus,
  TaskPriority,
  WorkflowNode,
  WorkflowEdge,
  AgentWorkflow,
  AgentMetrics
} from '../types/agents';

/**
 * Creates a default agent configuration
 */
export function createDefaultAgent(type: AgentType): Omit<Agent, 'id' | 'createdAt' | 'updatedAt'> {
  const agentConfigs = {
    orchestrator: {
      name: 'Orchestrator',
      description: 'Coordinates and manages the workflow between all other agents',
      capabilities: [
        'workflow-management',
        'architecture-design',
        'code-review',
        'monitoring'
      ] as AgentCapability[],
      config: {
        maxConcurrentTasks: 10,
        timeout: 600000, // 10 minutes
        retryAttempts: 2,
        priority: 10,
        dependencies: [],
        environment: {
          AGENT_TYPE: 'orchestrator',
          LOG_LEVEL: 'info',
        },
        tools: ['claude-code-cli', 'file-system', 'docker', 'git'],
        permissions: [
          { resource: '*', actions: ['read', 'write', 'execute'] }
        ],
      },
    },
    
    'frontend-architect': {
      name: 'Frontend Architect',
      description: 'Specializes in frontend development, UI frameworks, and client-side architecture',
      capabilities: [
        'code-generation',
        'ui-design',
        'optimization',
        'testing'
      ] as AgentCapability[],
      config: {
        maxConcurrentTasks: 5,
        timeout: 300000, // 5 minutes
        retryAttempts: 3,
        priority: 8,
        dependencies: ['orchestrator'],
        environment: {
          AGENT_TYPE: 'frontend-architect',
          PREFERRED_FRAMEWORK: 'react',
          STYLE_FRAMEWORK: 'tailwind',
        },
        tools: ['vite', 'react-dev-tools', 'chrome-devtools'],
        permissions: [
          { resource: 'src/components/**', actions: ['read', 'write'] },
          { resource: 'src/pages/**', actions: ['read', 'write'] },
          { resource: 'src/styles/**', actions: ['read', 'write'] },
          { resource: 'public/**', actions: ['read', 'write'] },
        ],
      },
    },
    
    'backend-architect': {
      name: 'Backend Architect',
      description: 'Handles server-side logic, APIs, and backend architecture',
      capabilities: [
        'code-generation',
        'api-design',
        'database-design',
        'optimization'
      ] as AgentCapability[],
      config: {
        maxConcurrentTasks: 5,
        timeout: 300000,
        retryAttempts: 3,
        priority: 8,
        dependencies: ['orchestrator'],
        environment: {
          AGENT_TYPE: 'backend-architect',
          PREFERRED_LANGUAGE: 'typescript',
          DATABASE_TYPE: 'postgresql',
        },
        tools: ['node', 'npm', 'database-cli'],
        permissions: [
          { resource: 'src/api/**', actions: ['read', 'write'] },
          { resource: 'src/services/**', actions: ['read', 'write'] },
          { resource: 'src/models/**', actions: ['read', 'write'] },
          { resource: 'src/middleware/**', actions: ['read', 'write'] },
        ],
      },
    },
    
    'database-specialist': {
      name: 'Database Specialist',
      description: 'Manages database design, optimization, and data modeling',
      capabilities: [
        'database-design',
        'optimization',
        'monitoring',
        'code-generation'
      ] as AgentCapability[],
      config: {
        maxConcurrentTasks: 3,
        timeout: 300000,
        retryAttempts: 2,
        priority: 7,
        dependencies: ['backend-architect'],
        environment: {
          AGENT_TYPE: 'database-specialist',
          DATABASE_TYPE: 'postgresql',
          ORM: 'prisma',
        },
        tools: ['prisma', 'postgresql', 'redis'],
        permissions: [
          { resource: 'src/database/**', actions: ['read', 'write'] },
          { resource: 'prisma/**', actions: ['read', 'write'] },
          { resource: 'migrations/**', actions: ['read', 'write'] },
        ],
      },
    },
    
    'devops-specialist': {
      name: 'DevOps Specialist',
      description: 'Handles deployment, infrastructure, and CI/CD pipelines',
      capabilities: [
        'deployment',
        'monitoring',
        'optimization',
        'architecture-design'
      ] as AgentCapability[],
      config: {
        maxConcurrentTasks: 3,
        timeout: 600000, // 10 minutes
        retryAttempts: 2,
        priority: 6,
        dependencies: ['orchestrator'],
        environment: {
          AGENT_TYPE: 'devops-specialist',
          CONTAINER_RUNTIME: 'docker',
          ORCHESTRATOR: 'kubernetes',
        },
        tools: ['docker', 'kubectl', 'terraform', 'ansible'],
        permissions: [
          { resource: 'docker/**', actions: ['read', 'write'] },
          { resource: '.github/**', actions: ['read', 'write'] },
          { resource: 'k8s/**', actions: ['read', 'write'] },
          { resource: 'terraform/**', actions: ['read', 'write'] },
        ],
      },
    },
    
    'ui-ux': {
      name: 'UI/UX Designer',
      description: 'Focuses on user interface design, user experience, and accessibility',
      capabilities: [
        'ui-design',
        'code-generation',
        'optimization',
        'testing'
      ] as AgentCapability[],
      config: {
        maxConcurrentTasks: 4,
        timeout: 300000,
        retryAttempts: 3,
        priority: 7,
        dependencies: ['frontend-architect'],
        environment: {
          AGENT_TYPE: 'ui-ux',
          DESIGN_SYSTEM: 'tailwind',
          ACCESSIBILITY_LEVEL: 'WCAG-AA',
        },
        tools: ['figma-api', 'color-palette', 'accessibility-checker'],
        permissions: [
          { resource: 'src/components/**', actions: ['read', 'write'] },
          { resource: 'src/styles/**', actions: ['read', 'write'] },
          { resource: 'src/assets/**', actions: ['read', 'write'] },
        ],
      },
    },
    
    'test-architect': {
      name: 'Test Architect',
      description: 'Creates and manages testing strategies, test suites, and quality assurance',
      capabilities: [
        'testing',
        'code-generation',
        'code-review',
        'monitoring'
      ] as AgentCapability[],
      config: {
        maxConcurrentTasks: 5,
        timeout: 600000,
        retryAttempts: 2,
        priority: 6,
        dependencies: ['frontend-architect', 'backend-architect'],
        environment: {
          AGENT_TYPE: 'test-architect',
          TEST_FRAMEWORK: 'vitest',
          E2E_FRAMEWORK: 'playwright',
        },
        tools: ['vitest', 'playwright', 'jest', 'cypress'],
        permissions: [
          { resource: 'src/**', actions: ['read'] },
          { resource: 'tests/**', actions: ['read', 'write'] },
          { resource: '__tests__/**', actions: ['read', 'write'] },
          { resource: '*.test.*', actions: ['read', 'write'] },
        ],
      },
    },
    
    documentor: {
      name: 'Documentor',
      description: 'Generates and maintains comprehensive documentation',
      capabilities: [
        'documentation',
        'code-review',
        'code-generation'
      ] as AgentCapability[],
      config: {
        maxConcurrentTasks: 3,
        timeout: 300000,
        retryAttempts: 2,
        priority: 5,
        dependencies: [],
        environment: {
          AGENT_TYPE: 'documentor',
          DOC_FORMAT: 'markdown',
          API_DOC_TOOL: 'openapi',
        },
        tools: ['markdown-it', 'mermaid', 'typedoc'],
        permissions: [
          { resource: 'docs/**', actions: ['read', 'write'] },
          { resource: 'README.md', actions: ['read', 'write'] },
          { resource: 'src/**', actions: ['read'] },
        ],
      },
    },
    
    evaluator: {
      name: 'Evaluator',
      description: 'Analyzes code quality, performance, and provides optimization recommendations',
      capabilities: [
        'code-review',
        'optimization',
        'monitoring',
        'debugging'
      ] as AgentCapability[],
      config: {
        maxConcurrentTasks: 4,
        timeout: 300000,
        retryAttempts: 2,
        priority: 6,
        dependencies: [],
        environment: {
          AGENT_TYPE: 'evaluator',
          ANALYSIS_DEPTH: 'comprehensive',
          METRICS_COLLECTION: 'enabled',
        },
        tools: ['eslint', 'sonarqube', 'lighthouse', 'bundleanalyzer'],
        permissions: [
          { resource: 'src/**', actions: ['read'] },
          { resource: 'reports/**', actions: ['read', 'write'] },
        ],
      },
    },
    
    'structure-updater': {
      name: 'Structure Updater',
      description: 'Maintains project structure and refactors code organization',
      capabilities: [
        'code-generation',
        'architecture-design',
        'optimization'
      ] as AgentCapability[],
      config: {
        maxConcurrentTasks: 2,
        timeout: 300000,
        retryAttempts: 1,
        priority: 4,
        dependencies: ['orchestrator'],
        environment: {
          AGENT_TYPE: 'structure-updater',
          REFACTOR_STRATEGY: 'conservative',
        },
        tools: ['ast-parser', 'code-mod', 'file-system'],
        permissions: [
          { resource: 'src/**', actions: ['read', 'write'] },
          { resource: 'package.json', actions: ['read', 'write'] },
          { resource: 'tsconfig.json', actions: ['read', 'write'] },
        ],
      },
    },
  };
  
  const config = agentConfigs[type];
  if (!config) {
    throw new Error(`Unknown agent type: ${type}`);
  }
  
  return {
    name: config.name,
    type,
    description: config.description,
    status: 'idle',
    capabilities: config.capabilities,
    config: config.config,
    metadata: {
      version: '1.0.0',
      author: 'Claude IDE',
      tags: [type, 'claude-code'],
      category: 'development',
      color: getAgentColor(type),
    },
  };
}

/**
 * Gets the color associated with an agent type
 */
export function getAgentColor(type: AgentType): string {
  const colors = {
    orchestrator: '#8b5cf6',
    'frontend-architect': '#06b6d4',
    'backend-architect': '#10b981',
    'database-specialist': '#f59e0b',
    'devops-specialist': '#ef4444',
    'ui-ux': '#ec4899',
    'test-architect': '#84cc16',
    documentor: '#6366f1',
    evaluator: '#f97316',
    'structure-updater': '#64748b',
  };
  
  return colors[type] || '#6b7280';
}

/**
 * Gets the icon associated with an agent type
 */
export function getAgentIcon(type: AgentType): string {
  const icons = {
    orchestrator: '🎼',
    'frontend-architect': '🎨',
    'backend-architect': '⚙️',
    'database-specialist': '🗃️',
    'devops-specialist': '🚀',
    'ui-ux': '✨',
    'test-architect': '🧪',
    documentor: '📚',
    evaluator: '📊',
    'structure-updater': '🔧',
  };
  
  return icons[type] || '🤖';
}

/**
 * Calculates agent performance score based on metrics
 */
export function calculatePerformanceScore(metrics: AgentMetrics): number {
  const {
    successRate,
    averageExecutionTime,
    totalTasks,
    uptime
  } = metrics;
  
  // Base score from success rate (0-40 points)
  let score = successRate * 0.4;
  
  // Performance bonus/penalty based on execution time (0-20 points)
  const executionTimeScore = Math.max(0, 20 - (averageExecutionTime / 1000) * 0.1);
  score += executionTimeScore;
  
  // Volume bonus based on tasks completed (0-20 points)
  const volumeScore = Math.min(20, Math.log(totalTasks + 1) * 3);
  score += volumeScore;
  
  // Reliability bonus based on uptime (0-20 points)
  const uptimeScore = Math.min(20, uptime * 0.02);
  score += uptimeScore;
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Determines agent priority based on task type and current workload
 */
export function calculateAgentPriority(
  agent: Agent,
  taskType: string,
  currentTasks: AgentTask[]
): number {
  let priority = agent.config.priority;
  
  // Adjust based on current workload
  const activeTasks = currentTasks.filter(task => 
    task.agentId === agent.id && 
    ['pending', 'running'].includes(task.status)
  ).length;
  
  // Reduce priority if overloaded
  if (activeTasks >= agent.config.maxConcurrentTasks) {
    priority -= 5;
  } else if (activeTasks >= agent.config.maxConcurrentTasks * 0.8) {
    priority -= 2;
  }
  
  // Boost priority for specialized tasks
  const taskCapabilityMap: Record<string, AgentCapability> = {
    'ui-design': 'ui-design',
    'api-design': 'api-design',
    'database-design': 'database-design',
    'testing': 'testing',
    'documentation': 'documentation',
    'deployment': 'deployment',
    'optimization': 'optimization',
    'debugging': 'debugging',
  };
  
  const requiredCapability = taskCapabilityMap[taskType];
  if (requiredCapability && agent.capabilities.includes(requiredCapability)) {
    priority += 3;
  }
  
  return Math.max(1, Math.min(10, priority));
}

/**
 * Finds the best agent for a specific task
 */
export function findBestAgentForTask(
  agents: Agent[],
  taskType: string,
  currentTasks: AgentTask[]
): Agent | null {
  const availableAgents = agents.filter(agent => 
    agent.status === 'idle' || agent.status === 'active'
  );
  
  if (availableAgents.length === 0) return null;
  
  // Calculate scores for each agent
  const agentScores = availableAgents.map(agent => ({
    agent,
    score: calculateAgentPriority(agent, taskType, currentTasks),
  }));
  
  // Sort by score (highest first)
  agentScores.sort((a, b) => b.score - a.score);
  
  return agentScores[0]?.agent || null;
}

/**
 * Creates a task for an agent
 */
export function createAgentTask(
  agentId: string,
  type: string,
  title: string,
  description: string,
  input: any,
  priority: TaskPriority = 'medium'
): Omit<AgentTask, 'id' | 'createdAt'> {
  return {
    agentId,
    type: type as any,
    title,
    description,
    status: 'pending',
    priority,
    input,
    progress: 0,
    childTaskIds: [],
    dependencies: [],
    metadata: {
      createdBy: 'user',
      environment: 'claude-ide',
      version: '1.0.0',
    },
  };
}

/**
 * Validates task dependencies
 */
export function validateTaskDependencies(
  task: AgentTask,
  allTasks: AgentTask[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if dependency tasks exist
  task.dependencies.forEach(depId => {
    const depTask = allTasks.find(t => t.id === depId);
    if (!depTask) {
      errors.push(`Dependency task not found: ${depId}`);
    } else if (depTask.status !== 'completed') {
      errors.push(`Dependency task not completed: ${depId} (status: ${depTask.status})`);
    }
  });
  
  // Check for circular dependencies
  const visited = new Set<string>();
  const visiting = new Set<string>();
  
  const checkCircular = (taskId: string): boolean => {
    if (visiting.has(taskId)) return true;
    if (visited.has(taskId)) return false;
    
    visiting.add(taskId);
    
    const currentTask = allTasks.find(t => t.id === taskId);
    if (currentTask) {
      for (const depId of currentTask.dependencies) {
        if (checkCircular(depId)) {
          errors.push(`Circular dependency detected: ${taskId} -> ${depId}`);
          return true;
        }
      }
    }
    
    visiting.delete(taskId);
    visited.add(taskId);
    return false;
  };
  
  checkCircular(task.id);
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a workflow from a task dependency graph
 */
export function createWorkflowFromTasks(
  tasks: AgentTask[],
  name: string,
  description: string
): AgentWorkflow {
  const nodes: WorkflowNode[] = [];
  const edges: WorkflowEdge[] = [];
  
  // Create nodes for each task
  tasks.forEach((task, index) => {
    const agent = null; // Would need to look up agent by task.agentId
    
    nodes.push({
      id: task.id,
      type: 'agent',
      position: { x: 200 * (index % 4), y: 150 * Math.floor(index / 4) },
      data: {
        agentId: task.agentId,
        taskType: task.type,
        label: task.title,
        description: task.description,
        config: task.metadata,
      },
    });
  });
  
  // Create edges for dependencies
  tasks.forEach(task => {
    task.dependencies.forEach(depId => {
      edges.push({
        id: `${depId}-${task.id}`,
        source: depId,
        target: task.id,
        type: 'default',
      });
    });
  });
  
  return {
    id: crypto.randomUUID(),
    name,
    description,
    version: '1.0.0',
    nodes,
    edges,
    triggers: [],
    variables: {},
    metadata: {
      createdBy: 'user',
      taskCount: tasks.length,
      estimatedDuration: tasks.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0),
    },
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Estimates task duration based on type and complexity
 */
export function estimateTaskDuration(
  taskType: string,
  input: any,
  agentType: AgentType
): number {
  const baseDurations = {
    'code-generation': 120000, // 2 minutes
    'code-review': 60000,      // 1 minute
    'testing': 180000,         // 3 minutes
    'documentation': 90000,    // 1.5 minutes
    'deployment': 300000,      // 5 minutes
    'analysis': 120000,        // 2 minutes
    'optimization': 240000,    // 4 minutes
    'debugging': 180000,       // 3 minutes
    'refactoring': 300000,     // 5 minutes
  };
  
  let baseDuration = baseDurations[taskType as keyof typeof baseDurations] || 120000;
  
  // Adjust based on input complexity
  if (input) {
    const inputStr = JSON.stringify(input);
    const complexity = Math.min(3, Math.max(0.5, inputStr.length / 1000));
    baseDuration *= complexity;
  }
  
  // Adjust based on agent type efficiency
  const agentEfficiency = {
    orchestrator: 1.2,
    'frontend-architect': 1.0,
    'backend-architect': 1.0,
    'database-specialist': 0.9,
    'devops-specialist': 1.1,
    'ui-ux': 1.1,
    'test-architect': 0.8,
    documentor: 0.9,
    evaluator: 0.7,
    'structure-updater': 1.3,
  };
  
  baseDuration *= agentEfficiency[agentType] || 1.0;
  
  return Math.round(baseDuration);
}

/**
 * Formats task status for display
 */
export function formatTaskStatus(status: TaskStatus): { label: string; color: string; icon: string } {
  const statusConfig = {
    pending: { label: 'Pending', color: '#6b7280', icon: '⏳' },
    running: { label: 'Running', color: '#3b82f6', icon: '⚡' },
    completed: { label: 'Completed', color: '#10b981', icon: '✅' },
    failed: { label: 'Failed', color: '#ef4444', icon: '❌' },
    cancelled: { label: 'Cancelled', color: '#f59e0b', icon: '🚫' },
    paused: { label: 'Paused', color: '#8b5cf6', icon: '⏸️' },
  };
  
  return statusConfig[status] || statusConfig.pending;
}

/**
 * Creates agent status indicator
 */
export function getAgentStatusIndicator(status: AgentStatus): { color: string; icon: string; pulse: boolean } {
  const indicators = {
    idle: { color: '#6b7280', icon: '💤', pulse: false },
    active: { color: '#10b981', icon: '🟢', pulse: true },
    busy: { color: '#f59e0b', icon: '🟡', pulse: true },
    error: { color: '#ef4444', icon: '🔴', pulse: false },
    offline: { color: '#374151', icon: '⚫', pulse: false },
    paused: { color: '#8b5cf6', icon: '⏸️', pulse: false },
  };
  
  return indicators[status] || indicators.idle;
}

/**
 * Generates agent configuration based on project requirements
 */
export function generateAgentConfig(
  projectType: 'web' | 'api' | 'fullstack' | 'mobile' | 'desktop',
  requirements: string[]
): AgentType[] {
  const configs = {
    web: ['orchestrator', 'frontend-architect', 'ui-ux', 'test-architect', 'documentor'],
    api: ['orchestrator', 'backend-architect', 'database-specialist', 'test-architect', 'documentor'],
    fullstack: [
      'orchestrator', 
      'frontend-architect', 
      'backend-architect', 
      'database-specialist', 
      'ui-ux', 
      'test-architect', 
      'devops-specialist', 
      'documentor',
      'evaluator'
    ],
    mobile: ['orchestrator', 'frontend-architect', 'ui-ux', 'test-architect', 'documentor'],
    desktop: ['orchestrator', 'frontend-architect', 'ui-ux', 'test-architect', 'documentor'],
  };
  
  let baseAgents = configs[projectType] as AgentType[];
  
  // Add specialized agents based on requirements
  requirements.forEach(req => {
    const lowerReq = req.toLowerCase();
    
    if (lowerReq.includes('deploy') || lowerReq.includes('ci/cd') || lowerReq.includes('docker')) {
      if (!baseAgents.includes('devops-specialist')) {
        baseAgents.push('devops-specialist');
      }
    }
    
    if (lowerReq.includes('database') || lowerReq.includes('sql') || lowerReq.includes('data')) {
      if (!baseAgents.includes('database-specialist')) {
        baseAgents.push('database-specialist');
      }
    }
    
    if (lowerReq.includes('performance') || lowerReq.includes('optimization') || lowerReq.includes('analysis')) {
      if (!baseAgents.includes('evaluator')) {
        baseAgents.push('evaluator');
      }
    }
    
    if (lowerReq.includes('refactor') || lowerReq.includes('structure') || lowerReq.includes('architecture')) {
      if (!baseAgents.includes('structure-updater')) {
        baseAgents.push('structure-updater');
      }
    }
  });
  
  return baseAgents;
}

/**
 * Creates a dependency graph visualization data
 */
export function createDependencyGraph(agents: Agent[], tasks: AgentTask[]): {
  nodes: Array<{ id: string; label: string; type: 'agent' | 'task'; color: string }>;
  edges: Array<{ from: string; to: string; type: 'dependency' | 'assignment' }>;
} {
  const nodes = [];
  const edges = [];
  
  // Add agent nodes
  agents.forEach(agent => {
    nodes.push({
      id: agent.id,
      label: agent.name,
      type: 'agent' as const,
      color: getAgentColor(agent.type),
    });
  });
  
  // Add task nodes
  tasks.forEach(task => {
    nodes.push({
      id: task.id,
      label: task.title,
      type: 'task' as const,
      color: '#e5e7eb',
    });
    
    // Add assignment edge (agent -> task)
    edges.push({
      from: task.agentId,
      to: task.id,
      type: 'assignment',
    });
    
    // Add dependency edges (dependency task -> current task)
    task.dependencies.forEach(depId => {
      edges.push({
        from: depId,
        to: task.id,
        type: 'dependency',
      });
    });
  });
  
  return { nodes, edges };
}

/**
 * Validates agent workflow configuration
 */
export function validateWorkflow(workflow: AgentWorkflow): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for at least one node
  if (workflow.nodes.length === 0) {
    errors.push('Workflow must have at least one node');
  }
  
  // Validate node references in edges
  const nodeIds = new Set(workflow.nodes.map(n => n.id));
  workflow.edges.forEach(edge => {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge references unknown source node: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge references unknown target node: ${edge.target}`);
    }
  });
  
  // Check for unreachable nodes
  const reachableNodes = new Set<string>();
  const startNodes = workflow.nodes.filter(node => 
    !workflow.edges.some(edge => edge.target === node.id)
  );
  
  if (startNodes.length === 0) {
    errors.push('Workflow has no start nodes (nodes with no incoming edges)');
  }
  
  // BFS to find all reachable nodes
  const queue = [...startNodes.map(n => n.id)];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (reachableNodes.has(nodeId)) continue;
    
    reachableNodes.add(nodeId);
    
    // Add connected nodes to queue
    workflow.edges
      .filter(edge => edge.source === nodeId)
      .forEach(edge => queue.push(edge.target));
  }
  
  // Check for unreachable nodes
  workflow.nodes.forEach(node => {
    if (!reachableNodes.has(node.id)) {
      errors.push(`Node is unreachable: ${node.id}`);
    }
  });
  
  // Check for cycles (simplified check)
  const visited = new Set<string>();
  const visiting = new Set<string>();
  
  const checkCycle = (nodeId: string): boolean => {
    if (visiting.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    
    visiting.add(nodeId);
    
    const outgoingEdges = workflow.edges.filter(edge => edge.source === nodeId);
    for (const edge of outgoingEdges) {
      if (checkCycle(edge.target)) {
        errors.push(`Cycle detected at node: ${nodeId}`);
        return true;
      }
    }
    
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  };
  
  startNodes.forEach(node => checkCycle(node.id));
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Auto-layouts workflow nodes using a simple hierarchical layout
 */
export function autoLayoutWorkflow(workflow: AgentWorkflow): AgentWorkflow {
  const nodeSpacing = { x: 250, y: 150 };
  const startX = 100;
  const startY = 100;
  
  // Build adjacency list
  const adjacencyList: Record<string, string[]> = {};
  workflow.nodes.forEach(node => {
    adjacencyList[node.id] = [];
  });
  
  workflow.edges.forEach(edge => {
    adjacencyList[edge.source].push(edge.target);
  });
  
  // Find start nodes (no incoming edges)
  const startNodes = workflow.nodes.filter(node =>
    !workflow.edges.some(edge => edge.target === node.id)
  );
  
  // Level-based positioning
  const levels: string[][] = [];
  const visited = new Set<string>();
  const nodeToLevel: Record<string, number> = {};
  
  // BFS to assign levels
  const queue: Array<{ nodeId: string; level: number }> = startNodes.map(node => ({
    nodeId: node.id,
    level: 0,
  }));
  
  while (queue.length > 0) {
    const { nodeId, level } = queue.shift()!;
    
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    
    nodeToLevel[nodeId] = level;
    
    if (!levels[level]) levels[level] = [];
    levels[level].push(nodeId);
    
    // Add children to queue
    adjacencyList[nodeId].forEach(childId => {
      if (!visited.has(childId)) {
        queue.push({ nodeId: childId, level: level + 1 });
      }
    });
  }
  
  // Position nodes
  const updatedNodes = workflow.nodes.map(node => {
    const level = nodeToLevel[node.id] || 0;
    const indexInLevel = levels[level]?.indexOf(node.id) || 0;
    const nodesInLevel = levels[level]?.length || 1;
    
    // Center nodes in their level
    const levelWidth = (nodesInLevel - 1) * nodeSpacing.x;
    const startXForLevel = startX - levelWidth / 2;
    
    return {
      ...node,
      position: {
        x: startXForLevel + indexInLevel * nodeSpacing.x,
        y: startY + level * nodeSpacing.y,
      },
    };
  });
  
  return {
    ...workflow,
    nodes: updatedNodes,
  };
}

/**
 * Serializes agent configuration for export
 */
export function serializeAgentConfig(agent: Agent): string {
  return JSON.stringify({
    name: agent.name,
    type: agent.type,
    description: agent.description,
    capabilities: agent.capabilities,
    config: agent.config,
    metadata: agent.metadata,
  }, null, 2);
}

/**
 * Deserializes agent configuration from import
 */
export function deserializeAgentConfig(configJson: string): Omit<Agent, 'id' | 'status' | 'createdAt' | 'updatedAt'> {
  try {
    const config = JSON.parse(configJson);
    
    // Validate required fields
    if (!config.name || !config.type || !config.description) {
      throw new Error('Missing required fields: name, type, or description');
    }
    
    return {
      name: config.name,
      type: config.type,
      description: config.description,
      capabilities: config.capabilities || [],
      config: {
        maxConcurrentTasks: 5,
        timeout: 300000,
        retryAttempts: 3,
        priority: 5,
        dependencies: [],
        environment: {},
        tools: [],
        permissions: [],
        ...config.config,
      },
      metadata: {
        version: '1.0.0',
        author: 'Claude IDE',
        tags: [],
        category: 'development',
        ...config.metadata,
      },
    };
  } catch (error) {
    throw new Error(`Failed to deserialize agent config: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a performance report for an agent
 */
export function generateAgentPerformanceReport(
  agent: Agent,
  metrics: AgentMetrics,
  tasks: AgentTask[]
): {
  summary: string;
  details: Record<string, any>;
  recommendations: string[];
} {
  const agentTasks = tasks.filter(task => task.agentId === agent.id);
  const recentTasks = agentTasks.filter(task => 
    task.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
  );
  
  const performanceScore = calculatePerformanceScore(metrics);
  
  const summary = `Agent "${agent.name}" has a performance score of ${performanceScore}% with ${metrics.successRate}% success rate over ${metrics.totalTasks} tasks.`;
  
  const details = {
    performanceScore,
    successRate: metrics.successRate,
    averageExecutionTime: metrics.averageExecutionTime,
    totalTasks: metrics.totalTasks,
    completedTasks: metrics.completedTasks,
    failedTasks: metrics.failedTasks,
    uptime: metrics.uptime,
    recentActivity: recentTasks.length,
    tasksByType: agentTasks.reduce((acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
  
  const recommendations: string[] = [];
  
  if (metrics.successRate < 80) {
    recommendations.push('Consider reviewing agent configuration or reducing task complexity');
  }
  
  if (metrics.averageExecutionTime > 300000) {
    recommendations.push('Tasks are taking longer than expected. Consider optimizing or splitting complex tasks');
  }
  
  if (metrics.uptime < 90) {
    recommendations.push('Agent has low uptime. Check for configuration or resource issues');
  }
  
  if (recentTasks.length === 0) {
    recommendations.push('Agent has been inactive recently. Consider adjusting task assignment logic');
  }
  
  return {
    summary,
    details,
    recommendations,
  };
}

/**
 * Creates a simple task scheduler for agents
 */
export function createTaskScheduler(agents: Agent[], onTaskComplete: (taskId: string, result: any) => void) {
  const taskQueue: AgentTask[] = [];
  const runningTasks: Map<string, AgentTask> = new Map();
  
  const scheduleTask = (task: AgentTask) => {
    taskQueue.push(task);
    processQueue();
  };
  
  const processQueue = () => {
    // Find available agents
    const availableAgents = agents.filter(agent => {
      const agentRunningTasks = Array.from(runningTasks.values()).filter(t => t.agentId === agent.id);
      return agentRunningTasks.length < agent.config.maxConcurrentTasks;
    });
    
    // Assign tasks to available agents
    for (let i = taskQueue.length - 1; i >= 0; i--) {
      const task = taskQueue[i];
      const bestAgent = findBestAgentForTask(availableAgents, task.type, Array.from(runningTasks.values()));
      
      if (bestAgent) {
        // Remove from queue and start execution
        taskQueue.splice(i, 1);
        runningTasks.set(task.id, task);
        
        // Simulate task execution
        setTimeout(() => {
          runningTasks.delete(task.id);
          onTaskComplete(task.id, { success: true, duration: task.estimatedDuration });
          processQueue(); // Check for more tasks
        }, task.estimatedDuration || 30000);
      }
    }
  };
  
  return {
    scheduleTask,
    getQueueStatus: () => ({
      queued: taskQueue.length,
      running: runningTasks.size,
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        status: agent.status,
        runningTasks: Array.from(runningTasks.values()).filter(t => t.agentId === agent.id).length,
      })),
    }),
  };
}

/**
 * Validates agent permissions for a specific resource
 */
export function checkAgentPermission(
  agent: Agent,
  resource: string,
  action: string
): boolean {
  return agent.config.permissions.some(permission => {
    // Simple wildcard matching
    const resourcePattern = permission.resource.replace(/\*/g, '.*');
    const resourceRegex = new RegExp(`^${resourcePattern}$`);
    
    return resourceRegex.test(resource) && permission.actions.includes(action);
  });
}

/**
 * Creates agent telemetry data
 */
export function createAgentTelemetry(
  agent: Agent,
  event: string,
  data: any
): {
  agentId: string;
  agentType: AgentType;
  event: string;
  data: any;
  timestamp: Date;
  sessionId: string;
} {
  return {
    agentId: agent.id,
    agentType: agent.type,
    event,
    data,
    timestamp: new Date(),
    sessionId: crypto.randomUUID(),
  };
}