import { useState, useEffect, useRef, useCallback } from 'react';
import { TerminalSession, TerminalCommand } from '../types';
import { spawn, ChildProcess } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

interface UseTerminalReturn {
  sessions: TerminalSession[];
  activeSession: TerminalSession | null;
  isProcessing: boolean;
  executeCommand: (sessionId: string, command: string) => Promise<TerminalCommand>;
  createSession: (name: string, shell: string, cwd: string) => Promise<TerminalSession>;
  closeSession: (sessionId: string) => Promise<void>;
  clearSession: (sessionId: string) => Promise<void>;
  getSessionHistory: (sessionId: string) => TerminalCommand[];
  switchToSession: (sessionId: string) => void;
  error: string | null;
}

export function useTerminal(): UseTerminalReturn {
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const processesRef = useRef<Map<string, ChildProcess>>(new Map());
  const outputBuffersRef = useRef<Map<string, string>>(new Map());

  // Cleanup processes on unmount
  useEffect(() => {
    return () => {
      processesRef.current.forEach((process) => {
        if (!process.killed) {
          process.kill('SIGTERM');
        }
      });
    };
  }, []);

  const createSession = useCallback(async (
    name: string, 
    shell: string, 
    cwd: string
  ): Promise<TerminalSession> => {
    const sessionId = uuidv4();
    
    const session: TerminalSession = {
      id: sessionId,
      name,
      type: shell as any,
      cwd,
      history: [],
      isActive: true,
      created: new Date().toISOString()
    };

    // Add welcome message
    const welcomeCommand: TerminalCommand = {
      id: `welcome_${sessionId}`,
      command: '',
      output: `Welcome to ${name}\nShell: ${shell}\nWorking Directory: ${cwd}\n`,
      exitCode: 0,
      timestamp: new Date().toISOString(),
      duration: 0
    };

    session.history.push(welcomeCommand);
    
    setSessions(prev => [...prev, session]);
    setActiveSessionId(sessionId);
    
    return session;
  }, []);

  const executeCommand = useCallback(async (
    sessionId: string, 
    command: string
  ): Promise<TerminalCommand> => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    setIsProcessing(true);
    setError(null);

    const startTime = Date.now();
    const commandId = uuidv4();

    try {
      // Create terminal command record
      const terminalCommand: TerminalCommand = {
        id: commandId,
        command,
        timestamp: new Date().toISOString()
      };

      // Handle special commands
      if (command.trim() === 'clear') {
        // Clear session history
        setSessions(prev => prev.map(s => 
          s.id === sessionId ? { ...s, history: [] } : s
        ));
        
        return {
          ...terminalCommand,
          output: '',
          exitCode: 0,
          duration: Date.now() - startTime
        };
      }

      if (command.trim().startsWith('cd ')) {
        // Change directory
        const newPath = command.trim().substring(3).trim();
        const resolvedPath = newPath.startsWith('/') 
          ? newPath 
          : `${session.cwd}/${newPath}`.replace(/\/+/g, '/');

        // Update session working directory
        setSessions(prev => prev.map(s => 
          s.id === sessionId ? { ...s, cwd: resolvedPath } : s
        ));

        return {
          ...terminalCommand,
          output: `Changed directory to: ${resolvedPath}\n`,
          exitCode: 0,
          duration: Date.now() - startTime
        };
      }

      // Execute command in child process
      const result = await executeInShell(command, session.cwd, session.type);
      
      const completedCommand: TerminalCommand = {
        ...terminalCommand,
        output: result.output,
        error: result.error,
        exitCode: result.exitCode,
        duration: Date.now() - startTime
      };

      // Update session history
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, history: [...s.history, completedCommand] }
          : s
      ));

      return completedCommand;

    } catch (err) {
      const errorCommand: TerminalCommand = {
        id: commandId,
        command,
        error: err instanceof Error ? err.message : 'Unknown error',
        exitCode: 1,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime
      };

      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, history: [...s.history, errorCommand] }
          : s
      ));

      return errorCommand;
    } finally {
      setIsProcessing(false);
    }
  }, [sessions]);

  const executeInShell = useCallback((
    command: string, 
    cwd: string, 
    shell: string
  ): Promise<{ output: string; error?: string; exitCode: number }> => {
    return new Promise((resolve) => {
      const args = getShellArgs(shell, command);
      const process = spawn(shell, args, {
        cwd,
        stdio: 'pipe',
        env: { ...process.env, FORCE_COLOR: '1' }
      });

      let output = '';
      let error = '';

      process.stdout?.on('data', (data) => {
        output += data.toString();
      });

      process.stderr?.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        resolve({
          output: output || (error ? '' : 'Command completed successfully\n'),
          error: error || undefined,
          exitCode: code || 0
        });
      });

      process.on('error', (err) => {
        resolve({
          output: '',
          error: err.message,
          exitCode: 1
        });
      });

      // Kill process after 30 seconds
      setTimeout(() => {
        if (!process.killed) {
          process.kill('SIGTERM');
          resolve({
            output: '',
            error: 'Command timed out after 30 seconds',
            exitCode: 1
          });
        }
      }, 30000);
    });
  }, []);

  const getShellArgs = (shell: string, command: string): string[] => {
    switch (shell) {
      case 'bash':
      case 'zsh':
      case 'sh':
        return ['-c', command];
      case 'fish':
        return ['-c', command];
      case 'cmd':
        return ['/c', command];
      case 'powershell':
        return ['-Command', command];
      default:
        return ['-c', command];
    }
  };

  const closeSession = useCallback(async (sessionId: string): Promise<void> => {
    // Kill associated process if any
    const process = processesRef.current.get(sessionId);
    if (process && !process.killed) {
      process.kill('SIGTERM');
      processesRef.current.delete(sessionId);
    }

    // Remove session
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    
    // Switch to another session if this was active
    if (activeSessionId === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      setActiveSessionId(remainingSessions[0]?.id || '');
    }
  }, [sessions, activeSessionId]);

  const clearSession = useCallback(async (sessionId: string): Promise<void> => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, history: [] } : s
    ));
  }, []);

  const getSessionHistory = useCallback((sessionId: string): TerminalCommand[] => {
    const session = sessions.find(s => s.id === sessionId);
    return session?.history || [];
  }, [sessions]);

  const switchToSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  return {
    sessions,
    activeSession,
    isProcessing,
    executeCommand,
    createSession,
    closeSession,
    clearSession,
    getSessionHistory,
    switchToSession,
    error
  };
}