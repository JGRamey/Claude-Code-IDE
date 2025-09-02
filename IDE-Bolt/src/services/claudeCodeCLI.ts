class ClaudeCodeCLIService {
  private baseUrl = 'http://localhost:3001/api/claude';

  async generateCode(prompt: string, context?: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      });
      
      if (!response.ok) throw new Error('Failed to generate code');
      
      const result = await response.json();
      return result.code;
    } catch (error) {
      console.error('Error generating code:', error);
      return 'Error: Unable to generate code. Please check your Claude API configuration.';
    }
  }

  async explainCode(code: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) throw new Error('Failed to explain code');
      
      const result = await response.json();
      return result.explanation;
    } catch (error) {
      console.error('Error explaining code:', error);
      return 'Error: Unable to explain code. Please check your Claude API configuration.';
    }
  }

  async optimizeCode(code: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) throw new Error('Failed to optimize code');
      
      const result = await response.json();
      return result.optimizedCode;
    } catch (error) {
      console.error('Error optimizing code:', error);
      return code; // Return original code if optimization fails
    }
  }

  async debugCode(code: string, error: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/debug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, error }),
      });
      
      if (!response.ok) throw new Error('Failed to debug code');
      
      const result = await response.json();
      return result.solution;
    } catch (error) {
      console.error('Error debugging code:', error);
      return 'Error: Unable to provide debugging assistance.';
    }
  }
}

export const claudeCodeCLI = new ClaudeCodeCLIService();