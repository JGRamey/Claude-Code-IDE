interface CLICommand {
  id: string;
  type: 'generate' | 'explain' | 'optimize' | 'debug';
  instruction: string;
  context?: {
    files?: string[];
    workspace?: string;
    sessionId?: string;
  };
  options?: {
    priority?: 'high' | 'medium' | 'low';
    timeout?: number;
  };
}

interface CLIResponse {
  id: string;
  success: boolean;
  result?: string;
  error?: string;
  timestamp: Date;
}

class ClaudeCodeCLIService {
  private baseUrl = 'http://localhost:3001/api/claude';
  private sessionId: string;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async executeCommand(command: CLICommand): Promise<CLIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });
      
      if (!response.ok) {
        throw new Error(`CLI execution failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      return {
        id: command.id,
        success: true,
        result: result.output || result.code || result.explanation || result.solution,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Error executing Claude Code CLI command ${command.id}:`, error);
      return {
        id: command.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  private buildInstructionWithMCP(baseInstruction: string, type: string): string {
    const mcpDirective = `Before implementing with any library, use Context7 MCP server:
1. Use mcp__context7__resolve_library_id to find the library ID
2. Use mcp__context7__get_library_docs for implementation patterns
3. Follow development rules from .claude/agent_docs/rules/development_rules.md

${baseInstruction}`;
    return mcpDirective;
  }

  async generateCode(prompt: string, context?: string): Promise<string> {
    const command: CLICommand = {
      id: `generate_${Date.now()}`,
      type: 'generate',
      instruction: this.buildInstructionWithMCP(
        `Generate code for: ${prompt}${context ? `\n\nContext: ${context}` : ''}`,
        'generate'
      ),
      context: {
        workspace: '/Users/grant/Documents/GitHub/Claude-Code-IDE',
        sessionId: this.sessionId,
      },
      options: {
        priority: 'high',
        timeout: 30000,
      },
    };

    const response = await this.executeCommand(command);
    
    if (!response.success) {
      return `Error: ${response.error || 'Failed to generate code'}. Please check your Claude Code CLI configuration.`;
    }
    
    return response.result || 'No code generated.';
  }

  async explainCode(code: string): Promise<string> {
    const command: CLICommand = {
      id: `explain_${Date.now()}`,
      type: 'explain',
      instruction: `Explain this code:\n\n${code}`,
      context: {
        workspace: '/Users/grant/Documents/GitHub/Claude-Code-IDE',
        sessionId: this.sessionId,
      },
      options: {
        priority: 'medium',
        timeout: 20000,
      },
    };

    const response = await this.executeCommand(command);
    
    if (!response.success) {
      return `Error: ${response.error || 'Failed to explain code'}. Please check your Claude Code CLI configuration.`;
    }
    
    return response.result || 'No explanation provided.';
  }

  async optimizeCode(code: string): Promise<string> {
    const command: CLICommand = {
      id: `optimize_${Date.now()}`,
      type: 'optimize',
      instruction: this.buildInstructionWithMCP(
        `Optimize this code following development rules:\n\n${code}`,
        'optimize'
      ),
      context: {
        workspace: '/Users/grant/Documents/GitHub/Claude-Code-IDE',
        sessionId: this.sessionId,
      },
      options: {
        priority: 'medium',
        timeout: 25000,
      },
    };

    const response = await this.executeCommand(command);
    
    if (!response.success) {
      console.warn(`Optimization failed: ${response.error}`);
      return code; // Return original code if optimization fails
    }
    
    return response.result || code;
  }

  async debugCode(code: string, error: string): Promise<string> {
    const command: CLICommand = {
      id: `debug_${Date.now()}`,
      type: 'debug',
      instruction: `Debug this code with the following error:
      
Error: ${error}

Code:
${code}

Please provide a solution that follows our development rules.`,
      context: {
        workspace: '/Users/grant/Documents/GitHub/Claude-Code-IDE',
        sessionId: this.sessionId,
      },
      options: {
        priority: 'high',
        timeout: 35000,
      },
    };

    const response = await this.executeCommand(command);
    
    if (!response.success) {
      return `Error: ${response.error || 'Failed to debug code'}. Please try again or check your Claude Code CLI configuration.`;
    }
    
    return response.result || 'No debugging solution provided.';
  }

  // Additional method for general AI assistance
  async askAssistant(message: string, currentFile?: string): Promise<string> {
    const command: CLICommand = {
      id: `assist_${Date.now()}`,
      type: 'generate',
      instruction: this.buildInstructionWithMCP(
        `${message}${currentFile ? `\n\nCurrent file context:\n${currentFile}` : ''}`,
        'assist'
      ),
      context: {
        workspace: '/Users/grant/Documents/GitHub/Claude-Code-IDE',
        sessionId: this.sessionId,
        files: currentFile ? [currentFile] : undefined,
      },
      options: {
        priority: 'medium',
        timeout: 25000,
      },
    };

    const response = await this.executeCommand(command);
    
    if (!response.success) {
      return `Error: ${response.error || 'Failed to get assistance'}. Please check your Claude Code CLI configuration.`;
    }
    
    return response.result || 'No response provided.';
  }
}

export const claudeCodeCLI = new ClaudeCodeCLIService();