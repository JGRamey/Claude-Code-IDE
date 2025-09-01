import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { Agent, AgentActivity, ClaudeCodeCommand, ClaudeCodeResponse } from '../types';

export class ClaudeCodeCLI extends EventEmitter {
  private process: ChildProcess | null = null;
  private websocket: WebSocket | null = null;
  private isInitialized = false;
  private workspacePath: string;
  private agents: Map<string, Agent> = new Map();
  private activeCommands: Map<string, ClaudeCodeCommand> = new Map();

  constructor(workspacePath: string) {
    super();
    this.workspacePath = workspacePath;
  }

  /**
   * Initialize Claude Code CLI with the workspace
   */
  async initialize(): Promise<void> {
    try {
      // Initialize Claude Code in the workspace
      const initProcess = spawn('claude-code', ['init', '--workspace', this.workspacePath], {
        stdio: 'pipe',
        cwd: this.workspacePath
      });

      await new Promise((resolve, reject) => {
        initProcess.on('close', (code) => {
          if (code === 0) {
            resolve(void 0);
          } else {
            reject(new Error(`Claude Code init failed with code ${code}`));
          }
        });
      });

      // Start Claude Code in watch mode
      await this.startWatchMode();
      
      // Establish WebSocket connection for real-time communication
      await this.connectWebSocket();
      
      this.isInitialized = true;
      this.emit('initialized');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Start Claude Code in watch mode
   */
  private async startWatchMode(): Promise<void> {
    this.process = spawn('claude-code', [
      'dev',
      '--watch',
      '--docker',
      '--port', '3001',  // WebSocket port
      '--workspace', this.workspacePath
    ], {
      stdio: 'pipe',
      cwd: this.workspacePath
    });

    this.process.stdout?.on('data', (data) => {
      const output = data.toString();
      this.parseClaudeCodeOutput(output);
      this.emit('stdout', output);
    });

    this.process.stderr?.on('data', (data) => {
      const error = data.toString();
      this.emit('stderr', error);
    });

    this.process.on('close', (code) => {
      this.emit('process-closed', code);
      this.process = null;
    });
  }

  /**
   * Connect to Claude Code's WebSocket server for real-time communication
   */
  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.websocket = new WebSocket('ws://localhost:3001/claude-code');

      this.websocket.on('open', () => {
        this.emit('websocket-connected');
        resolve();
      });

      this.websocket.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });

      this.websocket.on('error', (error) => {
        this.emit('websocket-error', error);
        reject(error);
      });

      this.websocket.on('close', () => {
        this.emit('websocket-disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(() => this.connectWebSocket(), 3000);
      });
    });
  }

  /**
   * Send a command to Claude Code
   */
  async sendCommand(instruction: string, context?: any): Promise<string> {
    if (!this.isInitialized || !this.websocket) {
      throw new Error('Claude Code CLI not initialized');
    }

    const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const command: ClaudeCodeCommand = {
      id: commandId,
      instruction,
      context: {
        workspacePath: this.workspacePath,
        selectedFile: context?.selectedFile,
        openFiles: context?.openFiles,
        ...context
      },
      timestamp: new Date().toISOString()
    };

    this.activeCommands.set(commandId, command);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.activeCommands.delete(commandId);
        reject(new Error('Command timeout'));
      }, 30000);

      const handleResponse = (response: ClaudeCodeResponse) => {
        if (response.commandId === commandId) {
          clearTimeout(timeout);
          this.activeCommands.delete(commandId);
          this.off('response', handleResponse);
          
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.result || 'Command completed');
          }
        }
      };

      this.on('response', handleResponse);
      
      // Send command via WebSocket
      this.websocket!.send(JSON.stringify(command));
    });
  }

  /**
   * Parse Claude Code output to extract agent activity and status
   */
  private parseClaudeCodeOutput(output: string): void {
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Parse agent activation messages
      if (line.includes('Agent activated:')) {
        const agentName = line.split('Agent activated:')[1].trim();
        this.updateAgentStatus(agentName, 'active');
      }
      
      // Parse agent completion messages
      if (line.includes('Agent completed:')) {
        const agentName = line.split('Agent completed:')[1].trim();
        this.updateAgentStatus(agentName, 'idle');
      }
      
      // Parse error messages
      if (line.includes('Error:') || line.includes('ERROR:')) {
        this.emit('agent-error', line);
      }
      
      // Parse file change notifications
      if (line.includes('File changed:')) {
        const filePath = line.split('File changed:')[1].trim();
        this.emit('file-changed', filePath);
      }
    }
  }

  /**
   * Handle WebSocket messages from Claude Code
   */
  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'agent-activity':
        this.emit('agent-activity', message.data);
        break;
      case 'file-operation':
        this.emit('file-operation', message.data);
        break;
      case 'command-response':
        this.emit('response', message.data);
        break;
      case 'workflow-update':
        this.emit('workflow-update', message.data);
        break;
      case 'docker-status':
        this.emit('docker-status', message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  /**
   * Update agent status and emit activity event
   */
  private updateAgentStatus(agentName: string, status: 'idle' | 'active' | 'error'): void {
    const agent = this.agents.get(agentName);
    if (agent) {
      agent.status = status;
      agent.lastActivity = new Date().toISOString();
      this.emit('agent-status-changed', agent);
    }
  }

  /**
   * Get current agent statuses
   */
  getAgentStatuses(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Configure agents
   */
  async configureAgents(agentConfig: { [key: string]: any }): Promise<void> {
    if (!this.websocket) {
      throw new Error('WebSocket not connected');
    }

    const command = {
      type: 'configure-agents',
      data: agentConfig
    };

    this.websocket.send(JSON.stringify(command));
  }

  /**
   * Update workflow configuration
   */
  async updateWorkflow(workflowConfig: any): Promise<void> {
    if (!this.websocket) {
      throw new Error('WebSocket not connected');
    }

    const command = {
      type: 'update-workflow',
      data: workflowConfig
    };

    this.websocket.send(JSON.stringify(command));
  }

  /**
   * Get current project status
   */
  async getProjectStatus(): Promise<any> {
    if (!this.websocket) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve) => {
      const handler = (data: any) => {
        if (data.type === 'project-status') {
          this.off('message', handler);
          resolve(data.data);
        }
      };

      this.on('message', handler);
      
      this.websocket!.send(JSON.stringify({
        type: 'get-project-status'
      }));
    });
  }

  /**
   * Clean shutdown
   */
  async shutdown(): Promise<void> {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    if (this.process) {
      this.process.kill('SIGTERM');
      
      // Wait for graceful shutdown
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          this.process?.kill('SIGKILL');
          resolve(void 0);
        }, 5000);

        this.process?.on('close', () => {
          clearTimeout(timeout);
          resolve(void 0);
        });
      });
      
      this.process = null;
    }

    this.isInitialized = false;
    this.emit('shutdown');
  }

  /**
   * Check if Claude Code CLI is available
   */
  static async isAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const checkProcess = spawn('claude-code', ['--version'], { stdio: 'pipe' });
      
      checkProcess.on('close', (code) => {
        resolve(code === 0);
      });
      
      checkProcess.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Install Claude Code CLI if not available
   */
  static async install(): Promise<void> {
    return new Promise((resolve, reject) => {
      const installProcess = spawn('npm', ['install', '-g', '@anthropic/claude-code'], {
        stdio: 'pipe'
      });

      installProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error('Failed to install Claude Code CLI'));
        }
      });
    });
  }
}