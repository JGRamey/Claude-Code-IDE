import React from 'react';
import { Agent, AgentMetrics } from '../../types/agents';
import { getAgentStatusIndicator, getAgentIcon, calculatePerformanceScore } from '../../utils/agentHelpers';
import AgentCard from './AgentCard';
import StatusIndicator from './StatusIndicator';

interface AgentStatusProps {
  agents: Agent[];
  metrics: Record<string, AgentMetrics>;
  onAgentSelect?: (agent: Agent) => void;
  onAgentStart?: (agentId: string) => void;
  onAgentStop?: (agentId: string) => void;
  onAgentRestart?: (agentId: string) => void;
  className?: string;
}

const AgentStatus: React.FC<AgentStatusProps> = ({
  agents,
  metrics,
  onAgentSelect,
  onAgentStart,
  onAgentStop,
  onAgentRestart,
  className = '',
}) => {
  const [selectedAgent, setSelectedAgent] = React.useState<Agent | null>(null);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'active' | 'idle' | 'error'>('all');
  const [sortBy, setSortBy] = React.useState<'name' | 'status' | 'performance' | 'activity'>('name');

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    onAgentSelect?.(agent);
  };

  const handleAgentAction = (action: 'start' | 'stop' | 'restart', agentId: string) => {
    switch (action) {
      case 'start':
        onAgentStart?.(agentId);
        break;
      case 'stop':
        onAgentStop?.(agentId);
        break;
      case 'restart':
        onAgentRestart?.(agentId);
        break;
    }
  };

  // Filter agents based on status
  const filteredAgents = agents.filter(agent => {
    if (filterStatus === 'all') return true;
    return agent.status === filterStatus;
  });

  // Sort agents
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'performance':
        const scoreA = metrics[a.id] ? calculatePerformanceScore(metrics[a.id]) : 0;
        const scoreB = metrics[b.id] ? calculatePerformanceScore(metrics[b.id]) : 0;
        return scoreB - scoreA;
      case 'activity':
        const activityA = metrics[a.id]?.lastActiveAt?.getTime() || 0;
        const activityB = metrics[b.id]?.lastActiveAt?.getTime() || 0;
        return activityB - activityA;
      default:
        return 0;
    }
  });

  const getStatusCount = (status: Agent['status']) => {
    return agents.filter(agent => agent.status === status).length;
  };

  return (
    <div className={`agent-status ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Agent Status
          </h2>
          <div className="flex items-center space-x-2">
            <StatusIndicator 
              status="active" 
              count={getStatusCount('active')} 
              label="Active"
            />
            <StatusIndicator 
              status="idle" 
              count={getStatusCount('idle')} 
              label="Idle"
            />
            <StatusIndicator 
              status="busy" 
              count={getStatusCount('busy')} 
              label="Busy"
            />
            <StatusIndicator 
              status="error" 
              count={getStatusCount('error')} 
              label="Error"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              List
            </button>
          </div>

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="idle">Idle</option>
            <option value="busy">Busy</option>
            <option value="error">Error</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="name">Name</option>
            <option value="status">Status</option>
            <option value="performance">Performance</option>
            <option value="activity">Last Activity</option>
          </select>
        </div>
      </div>

      {/* Agent Grid/List */}
      <div className="p-4">
        {sortedAgents.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">🤖</div>
            <p className="text-lg mb-2">No agents found</p>
            <p className="text-sm">
              {filterStatus === 'all' 
                ? 'No agents are currently configured'
                : `No agents with ${filterStatus} status`
              }
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-2'
          }>
            {sortedAgents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                metrics={metrics[agent.id]}
                viewMode={viewMode}
                isSelected={selectedAgent?.id === agent.id}
                onClick={() => handleAgentClick(agent)}
                onAction={(action) => handleAgentAction(action, agent.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Agent Details Panel */}
      {selectedAgent && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getAgentIcon(selectedAgent.type)}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedAgent.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedAgent.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Agent Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="text-gray-900 dark:text-white font-mono">
                      {selectedAgent.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Max Tasks:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedAgent.config.maxConcurrentTasks}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedAgent.config.priority}/10
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Timeout:</span>
                    <span className="text-gray-900 dark:text-white">
                      {Math.round(selectedAgent.config.timeout / 1000)}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              {metrics[selectedAgent.id] && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Success Rate:</span>
                      <span className="text-gray-900 dark:text-white">
                        {metrics[selectedAgent.id].successRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Tasks:</span>
                      <span className="text-gray-900 dark:text-white">
                        {metrics[selectedAgent.id].totalTasks}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Avg Time:</span>
                      <span className="text-gray-900 dark:text-white">
                        {Math.round(metrics[selectedAgent.id].averageExecutionTime / 1000)}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Score:</span>
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {calculatePerformanceScore(metrics[selectedAgent.id])}/100
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Capabilities */}
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Capabilities</h4>
              <div className="flex flex-wrap gap-2">
                {selectedAgent.capabilities.map(capability => (
                  <span
                    key={capability}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
                  >
                    {capability.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Tools */}
            {selectedAgent.config.tools.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tools</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.config.tools.map(tool => (
                    <span
                      key={tool}
                      className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentStatus;