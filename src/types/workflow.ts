// Workflow and flowchart types for the Claude Code IDE

import { AgentType, TaskType } from './agents';

export interface FlowchartPosition {
  x: number;
  y: number;
}

export interface FlowchartSize {
  width: number;
  height: number;
}

export interface FlowchartNode {
  id: string;
  type: FlowchartNodeType;
  position: FlowchartPosition;
  size: FlowchartSize;
  data: FlowchartNodeData;
  style?: FlowchartNodeStyle;
  draggable?: boolean;
  selectable?: boolean;
  deletable?: boolean;
}

export type FlowchartNodeType = 
  | 'agent'
  | 'start'
  | 'end'
  | 'decision'
  | 'process'
  | 'input'
  | 'output'
  | 'connector'
  | 'comment'
  | 'group';

export interface FlowchartNodeData {
  label: string;
  description?: string;
  agentType?: AgentType;
  taskType?: TaskType;
  config?: Record<string, any>;
  icon?: string;
  color?: string;
  inputs?: FlowchartPort[];
  outputs?: FlowchartPort[];
  properties?: FlowchartNodeProperty[];
}

export interface FlowchartNodeStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  borderRadius?: number;
  fontSize?: number;
  fontColor?: string;
  fontFamily?: string;
  opacity?: number;
  shadow?: boolean;
  gradient?: {
    from: string;
    to: string;
    direction: 'horizontal' | 'vertical' | 'diagonal';
  };
}

export interface FlowchartPort {
  id: string;
  type: 'input' | 'output';
  label?: string;
  dataType?: string;
  required?: boolean;
  position: 'top' | 'right' | 'bottom' | 'left';
  offset?: number;
}

export interface FlowchartNodeProperty {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json';
  value: any;
  options?: { label: string; value: any }[];
  required?: boolean;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
  };
}

export interface FlowchartEdge {
  id: string;
  source: string;
  target: string;
  sourcePort?: string;
  targetPort?: string;
  type: FlowchartEdgeType;
  data: FlowchartEdgeData;
  style?: FlowchartEdgeStyle;
  animated?: boolean;
  deletable?: boolean;
}

export type FlowchartEdgeType = 
  | 'default'
  | 'straight'
  | 'step'
  | 'smoothstep'
  | 'bezier'
  | 'conditional'
  | 'error'
  | 'success';

export interface FlowchartEdgeData {
  label?: string;
  condition?: FlowchartCondition;
  weight?: number;
  metadata?: Record<string, any>;
}

export interface FlowchartEdgeStyle {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  markerEnd?: string;
  animated?: boolean;
}

export interface FlowchartCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logical?: 'and' | 'or';
  children?: FlowchartCondition[];
}

export interface FlowchartViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface FlowchartSelection {
  nodes: string[];
  edges: string[];
}

export interface FlowchartState {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  viewport: FlowchartViewport;
  selection: FlowchartSelection;
  isDragging: boolean;
  isConnecting: boolean;
  connectionMode: 'loose' | 'strict';
  snapToGrid: boolean;
  gridSize: number;
  showGrid: boolean;
  showMinimap: boolean;
}

export interface FlowchartEvent {
  type: FlowchartEventType;
  data: any;
  timestamp: Date;
}

export type FlowchartEventType = 
  | 'node-add'
  | 'node-remove'
  | 'node-update'
  | 'node-select'
  | 'node-drag'
  | 'edge-add'
  | 'edge-remove'
  | 'edge-update'
  | 'edge-select'
  | 'viewport-change'
  | 'selection-change'
  | 'canvas-click'
  | 'canvas-drag';

export interface FlowchartAction {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
}

export interface FlowchartHistory {
  past: FlowchartAction[];
  present: FlowchartState;
  future: FlowchartAction[];
  maxHistorySize: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowExecutionStatus;
  startTime: Date;
  endTime?: Date;
  currentNode?: string;
  context: Record<string, any>;
  results: Record<string, any>;
  errors: WorkflowError[];
  metrics: WorkflowMetrics;
}

export type WorkflowExecutionStatus = 
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface WorkflowError {
  nodeId: string;
  message: string;
  stack?: string;
  timestamp: Date;
  recoverable: boolean;
}

export interface WorkflowMetrics {
  totalNodes: number;
  completedNodes: number;
  failedNodes: number;
  totalExecutionTime: number;
  nodeExecutionTimes: Record<string, number>;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface FlowchartTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  metadata: Record<string, any>;
  author: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowchartContext {
  state: FlowchartState;
  history: FlowchartHistory;
  
  // Node operations
  addNode: (node: Omit<FlowchartNode, 'id'>) => string;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<FlowchartNode>) => void;
  moveNode: (nodeId: string, position: FlowchartPosition) => void;
  duplicateNode: (nodeId: string) => string;
  
  // Edge operations
  addEdge: (edge: Omit<FlowchartEdge, 'id'>) => string;
  removeEdge: (edgeId: string) => void;
  updateEdge: (edgeId: string, updates: Partial<FlowchartEdge>) => void;
  
  // Selection operations
  selectNodes: (nodeIds: string[]) => void;
  selectEdges: (edgeIds: string[]) => void;
  clearSelection: () => void;
  selectAll: () => void;
  
  // Viewport operations
  setViewport: (viewport: Partial<FlowchartViewport>) => void;
  fitView: (nodeIds?: string[]) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  
  // Layout operations
  autoLayout: (algorithm?: 'dagre' | 'elkjs' | 'hierarchy') => void;
  alignNodes: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeNodes: (direction: 'horizontal' | 'vertical') => void;
  
  // History operations
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Import/Export
  exportToJSON: () => string;
  importFromJSON: (json: string) => void;
  exportToImage: (format: 'png' | 'jpg' | 'svg') => Promise<string>;
  
  // Validation
  validateWorkflow: () => { isValid: boolean; errors: string[] };
  
  // Execution
  executeWorkflow: (input?: Record<string, any>) => Promise<WorkflowExecution>;
  
  // Events
  addEventListener: (type: FlowchartEventType, callback: (event: FlowchartEvent) => void) => () => void;
  removeEventListener: (type: FlowchartEventType, callback: (event: FlowchartEvent) => void) => void;
}