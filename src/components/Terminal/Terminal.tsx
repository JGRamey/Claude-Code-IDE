import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AgentNode } from './AgentNode';
import { ConnectionLine } from './ConnectionLine';
import { WorkflowCanvas } from './WorkflowCanvas';
import { useAppStore } from '../../stores';
import { useClaudeCode } from '../../hooks/useClaudeCode';
import { WorkflowNode, WorkflowEdge, Agent } from '../../types';
import { 
  Plus, 
  Save, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Upload, 
  Trash2,
  Copy,
  Settings,
  Zap,
  GitBranch,
  Share,
  Eye,
  EyeOff
} from 'lucide-react';

export function WorkflowEditor() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<WorkflowEdge | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionPath, setExecutionPath] = useState<string[]>([]);
  const [draggedAgent, setDraggedAgent] = useState<Agent | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [workflowHistory, setWorkflowHistory] = useState<any[]>([]);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const { agents, activeWorkflow, setActiveWorkflow } = useAppStore();
  const { updateWorkflow, sendCommand } = useClaudeCode();

  // Initialize with default workflow
  useEffect(() => {
    if (nodes.length === 0) {
      initializeDefaultWorkflow();
    }
  }, []);

  const initializeDefaultWorkflow = useCallback(() => {
    const defaultNodes: WorkflowNode[] = [
      {
        id: 'start',
        type: 'input',
        position: { x: 100, y: 100 },
        data: { label: 'User Request' }
      },
      {
        id: 'analyzer',
        type: 'agent',
        position: { x: 300, y: 100 },
        data: { 
          label: 'Request Analyzer',
          agentId: 'analyzer',
          script: 'Analyze user request and route to appropriate agents'
        }
      },
      {
        id: 'frontend',
        type: 'agent',
        position: { x: 150, y: 250 },
        data: { 
          label: 'Frontend Agent',
          agentId: 'frontend'
        }
      },
      {
        id: 'backend',
        type: 'agent',
        position: { x: 450, y: 250 },
        data: { 
          label: 'Backend Agent',
          agentId: 'backend'
        }
      },
      {
        id: 'testing',
        type: 'agent',
        position: { x: 300, y: 400 },
        data: { 
          label: 'Testing Agent',
          agentId: 'testing'
        }
      },
      {
        id: 'output',
        type: 'output',
        position: { x: 300, y: 550 },
        data: { label: 'Code Output' }
      }
    ];

    const defaultEdges: WorkflowEdge[] = [
      { id: 'e1', source: 'start', target: 'analyzer' },
      { id: 'e2', source: 'analyzer', target: 'frontend', condition: 'UI_REQUIRED' },
      { id: 'e3', source: 'analyzer', target: 'backend', condition: 'API_REQUIRED' },
      { id: 'e4', source: 'frontend', target: 'testing' },
      { id: 'e5', source: 'backend', target: 'testing' },
      { id: 'e6', source: 'testing', target: 'output' }
    ];

    setNodes(defaultNodes);
    setEdges(defaultEdges);
  }, []);

  const handleNodeDrag = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId ? { ...node, position } : node
      )
    );
  }, []);

  const handleNodeSelect = useCallback((node: WorkflowNode) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const handleEdgeSelect = useCallback((edge: WorkflowEdge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const handleAddNode = useCallback((type: WorkflowNode['type'], agentId?: string) => {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type,
      position: { x: 300, y: 200 },
      data: {
        label: agentId ? `${agentId} Agent` : `New ${type}`,
        agentId
      }
    };

    setNodes(prev => [...prev, newNode]);
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setEdges(prev => prev.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const handleConnectNodes = useCallback((sourceId: string, targetId: string) => {
    const newEdge: WorkflowEdge = {
      id: `edge_${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: 'default',
      animated: true
    };

    setEdges(prev => [...prev, newEdge]);
  }, []);

  const handleDeleteEdge = useCallback((edgeId: string) => {
    setEdges(prev => prev.filter(edge => edge.id !== edgeId));
    
    if (selectedEdge?.id === edgeId) {
      setSelectedEdge(null);
    }
  }, [selectedEdge]);

  const handleExecuteWorkflow = useCallback(async () => {
    if (nodes.length === 0) return;

    setIsExecuting(true);
    setExecutionPath([]);

    try {
      // Find the start node
      const startNode = nodes.find(node => node.type === 'input');
      if (!startNode) {
        throw new Error('No start node found in workflow');
      }

      // Save current workflow
      const workflow = {
        id: activeWorkflow?.id || `workflow_${Date.now()}`,
        name: activeWorkflow?.name || 'Custom Workflow',
        description: 'User-defined agent workflow',
        nodes,
        edges,
        version: '1.0.0',
        isActive: true,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      };

      await updateWorkflow(workflow);
      setActiveWorkflow(workflow);

      // Execute workflow via Claude Code
      await sendCommand('Execute the current workflow', {
        workflow: { nodes, edges },
        executionMode: 'step-by-step'
      });

    } catch (error) {
      console.error('Workflow execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [nodes, edges, activeWorkflow, updateWorkflow, setActiveWorkflow, sendCommand]);

  const handleSaveWorkflow = useCallback(async () => {
    const workflow = {
      id: activeWorkflow?.id || `workflow_${Date.now()}`,
      name: prompt('Workflow name:', activeWorkflow?.name || 'My Workflow') || 'Unnamed Workflow',
      description: prompt('Workflow description:', activeWorkflow?.description || '') || '',
      nodes,
      edges,
      version: '1.0.0',
      isActive: true,
      created: activeWorkflow?.created || new Date().toISOString(),
      modified: new Date().toISOString()
    };

    try {
      await updateWorkflow(workflow);
      setActiveWorkflow(workflow);
      
      // Save to history
      setWorkflowHistory(prev => [workflow, ...prev.slice(0, 9)]); // Keep last 10
      
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  }, [nodes, edges, activeWorkflow, updateWorkflow, setActiveWorkflow]);

  const handleLoadWorkflow = useCallback((workflow: any) => {
    setNodes(workflow.nodes);
    setEdges(workflow.edges);
    setActiveWorkflow(workflow);
  }, [setActiveWorkflow]);

  const handleAgentDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedAgent || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    handleAddNode('agent', draggedAgent.id);
    setDraggedAgent(null);
  }, [draggedAgent, handleAddNode]);

  const exportWorkflow = useCallback(() => {
    const workflow = {
      nodes,
      edges,
      metadata: {
        name: activeWorkflow?.name || 'Exported Workflow',
        created: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    const dataStr = JSON.stringify(workflow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow_${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, [nodes, edges, activeWorkflow]);

  return (
    <div className="h-full bg-gray-50 flex">
      {/* Agent Palette */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Available Agents</h3>
          <div className="space-y-2">
            {agents.map(agent => (
              <div
                key={agent.id}
                draggable
                onDragStart={() => setDraggedAgent(agent)}
                className={`p-3 rounded-lg border-2 border-dashed cursor-move transition-all ${
                  agent.status === 'active' 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    agent.status === 'active' ? 'bg-green-500' :
                    agent.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-800">{agent.name}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{agent.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  {agent.capabilities.slice(0, 3).map(cap => (
                    <span key={cap} className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                      {cap}
                    </span>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <span className="text-xs text-gray-500">+{agent.capabilities.length - 3}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Templates */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Templates</h3>
          <div className="space-y-1">
            <button 
              onClick={() => initializeDefaultWorkflow()}
              className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              📋 Basic Development
            </button>
            <button 
              className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              🐛 Bug Fix Flow
            </button>
            <button 
              className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              🚀 Deployment Pipeline
            </button>
            <button 
              className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              🧪 Testing Workflow
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Workflow Toolbar */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-800">
                {activeWorkflow?.name || 'Untitled Workflow'}
              </span>
            </div>
            
            {isExecuting && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Executing workflow...
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border border-gray-300 rounded">
              <button
                onClick={() => setZoomLevel(prev => Math.max(25, prev - 25))}
                className="p-1 hover:bg-gray-100"
                disabled={zoomLevel <= 25}
              >
                <span className="text-sm">−</span>
              </button>
              <span className="px-2 text-sm text-gray-600 border-x border-gray-300">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(200, prev + 25))}
                className="p-1 hover:bg-gray-100"
                disabled={zoomLevel >= 200}
              >
                <span className="text-sm">+</span>
              </button>
            </div>

            {/* Grid Toggle */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded transition-colors ${
                showGrid ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Toggle Grid"
            >
              <span className="text-sm">#</span>
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 border-l border-gray-300 pl-2">
              <button
                onClick={handleExecuteWorkflow}
                disabled={isExecuting || nodes.length === 0}
                className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors ${
                  isExecuting 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isExecuting ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isExecuting ? 'Running' : 'Execute'}
              </button>
              
              <button
                onClick={handleSaveWorkflow}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Save Workflow"
              >
                <Save className="w-4 h-4" />
              </button>
              
              <button
                onClick={exportWorkflow}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Export Workflow"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button
                className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Import Workflow"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <WorkflowCanvas
            ref={canvasRef}
            nodes={nodes}
            edges={edges}
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            executionPath={executionPath}
            showGrid={showGrid}
            zoomLevel={zoomLevel}
            onNodeDrag={handleNodeDrag}
            onNodeSelect={handleNodeSelect}
            onEdgeSelect={handleEdgeSelect}
            onConnectNodes={handleConnectNodes}
            onDrop={handleAgentDrop}
            onDragOver={(e) => e.preventDefault()}
          />

          {/* Execution Path Visualization */}
          {isExecuting && executionPath.length > 0 && (
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 border max-w-sm">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Execution Path</h4>
              <div className="space-y-1">
                {executionPath.map((nodeId, index) => {
                  const node = nodes.find(n => n.id === nodeId);
                  return (
                    <div key={nodeId} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">{node?.data.label}</span>
                      {index === executionPath.length - 1 && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Node Properties */}
      {(selectedNode || selectedEdge) && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              {selectedNode ? 'Node Properties' : 'Edge Properties'}
            </h3>
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            {selectedNode && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={selectedNode.data.label}
                    onChange={(e) => {
                      const updatedNode = {
                        ...selectedNode,
                        data: { ...selectedNode.data, label: e.target.value }
                      };
                      setSelectedNode(updatedNode);
                      setNodes(prev => prev.map(n => n.id === selectedNode.id ? updatedNode : n));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {selectedNode.type === 'agent' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agent
                    </label>
                    <select
                      value={selectedNode.data.agentId || ''}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: { ...selectedNode.data, agentId: e.target.value }
                        };
                        setSelectedNode(updatedNode);
                        setNodes(prev => prev.map(n => n.id === selectedNode.id ? updatedNode : n));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Agent</option>
                      {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Script/Instructions
                  </label>
                  <textarea
                    value={selectedNode.data.script || ''}
                    onChange={(e) => {
                      const updatedNode = {
                        ...selectedNode,
                        data: { ...selectedNode.data, script: e.target.value }
                      };
                      setSelectedNode(updatedNode);
                      setNodes(prev => prev.map(n => n.id === selectedNode.id ? updatedNode : n));
                    }}
                    placeholder="Enter instructions for this node..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-24 resize-none focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteNode(selectedNode.id)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      const copy = {
                        ...selectedNode,
                        id: `node_${Date.now()}`,
                        position: {
                          x: selectedNode.position.x + 50,
                          y: selectedNode.position.y + 50
                        }
                      };
                      setNodes(prev => [...prev, copy]);
                    }}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    <Copy className="w-4 h-4 inline mr-1" />
                    Copy
                  </button>
                </div>
              </div>
            )}

            {selectedEdge && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition
                  </label>
                  <input
                    type="text"
                    value={selectedEdge.condition || ''}
                    onChange={(e) => {
                      const updatedEdge = { ...selectedEdge, condition: e.target.value };
                      setSelectedEdge(updatedEdge);
                      setEdges(prev => prev.map(e => e.id === selectedEdge.id ? updatedEdge : e));
                    }}
                    placeholder="e.g., UI_REQUIRED, API_NEEDED"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Animation
                  </label>
                  <select
                    value={selectedEdge.animated ? 'true' : 'false'}
                    onChange={(e) => {
                      const updatedEdge = { ...selectedEdge, animated: e.target.value === 'true' };
                      setSelectedEdge(updatedEdge);
                      setEdges(prev => prev.map(e => e.id === selectedEdge.id ? updatedEdge : e));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="false">Static</option>
                    <option value="true">Animated</option>
                  </select>
                </div>

                <button
                  onClick={() => handleDeleteEdge(selectedEdge.id)}
                  className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Delete Connection
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workflow History Sidebar (collapsible) */}
      {workflowHistory.length > 0 && (
        <div className="w-64 bg-gray-50 border-l border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">Recent Workflows</h3>
          </div>
          <div className="p-2">
            {workflowHistory.map((workflow, index) => (
              <div
                key={workflow.id}
                className="p-2 mb-2 bg-white rounded border hover:shadow-sm cursor-pointer transition-all"
                onClick={() => handleLoadWorkflow(workflow)}
              >
                <div className="text-sm font-medium text-gray-800">{workflow.name}</div>
                <div className="text-xs text-gray-500">
                  {new Date(workflow.modified).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {workflow.nodes?.length || 0} nodes, {workflow.edges?.length || 0} connections
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}