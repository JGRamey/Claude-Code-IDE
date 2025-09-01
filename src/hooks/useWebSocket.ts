import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../stores';
import { WebSocketMessage, AgentActivity } from '../types';
import io, { Socket } from 'socket.io-client';

interface UseWebSocketReturn {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  agentActivity: AgentActivity[];
  sendMessage: (type: string, data: any) => void;
  subscribeToChannel: (channel: string, callback: (data: any) => void) => () => void;
  error: string | null;
}

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [agentActivity, setAgentActivity] = useState<AgentActivity[]>([]);
  
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionsRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  const {
    addAgentActivity,
    updateAgentStatus,
    setDockerStatus,
    setContainerMetrics,
    addChatMessage,
    addError
  } = useAppStore();

  // Initialize WebSocket connection
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    setConnectionStatus('connecting');
    setError(null);

    try {
      // Create Socket.IO connection
      const socket = io('ws://localhost:3001', {
        transports: ['websocket'],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
      });

      socketRef.current = socket;

      // Connection events
      socket.on('connect', () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
        reconnectAttempts.current = 0;
        
        console.log('WebSocket connected to Claude Code');
        
        addChatMessage({
          id: `ws_${Date.now()}`,
          type: 'system',
          content: '🔗 Connected to Claude Code WebSocket',
          timestamp: new Date().toISOString()
        });
      });

      socket.on('disconnect', (reason) => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        console.log('WebSocket disconnected:', reason);
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect automatically
          setError('Server disconnected the connection');
        } else {
          // Attempt to reconnect
          attemptReconnect();
        }
      });

      socket.on('connect_error', (err) => {
        setConnectionStatus('error');
        setError(err.message);
        
        console.error('WebSocket connection error:', err);
        
        reconnectAttempts.current++;
        if (reconnectAttempts.current < maxReconnectAttempts) {
          attemptReconnect();
        } else {
          addError({
            id: Date.now().toString(),
            type: 'network',
            severity: 'high',
            message: 'Failed to connect to Claude Code WebSocket after multiple attempts',
            details: err.message,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Message handlers
      socket.on('agent-activity', (activity: AgentActivity) => {
        setAgentActivity(prev => [activity, ...prev.slice(0, 99)]);
        addAgentActivity(activity);
        
        // Update agent status based on activity
        if (activity.status === 'started') {
          updateAgentStatus(activity.agentId, 'active');
        } else if (activity.status === 'completed') {
          updateAgentStatus(activity.agentId, 'idle');
        } else if (activity.status === 'error') {
          updateAgentStatus(activity.agentId, 'error');
        }
      });

      socket.on('docker-status', (data: any) => {
        setDockerStatus(data.status);
        if (data.metrics) {
          setContainerMetrics(data.metrics);
        }
      });

      socket.on('file-changed', (data: { path: string; content: string }) => {
        // Notify about file changes for live reload
        console.log('File changed via WebSocket:', data.path);
        // The file system hook will handle the actual update
      });

      socket.on('workflow-update', (data: any) => {
        console.log('Workflow update received:', data);
        // Handle workflow updates
      });

      socket.on('system-notification', (data: { type: string; message: string; severity?: string }) => {
        addChatMessage({
          id: `sys_${Date.now()}`,
          type: 'system',
          content: `${data.type === 'error' ? '❌' : data.type === 'warning' ? '⚠️' : 'ℹ️'} ${data.message}`,
          timestamp: new Date().toISOString()
        });
      });

      // Generic message handler for subscriptions
      socket.onAny((event, data) => {
        const callbacks = subscriptionsRef.current.get(event);
        if (callbacks) {
          callbacks.forEach(callback => {
            try {
              callback(data);
            } catch (err) {
              console.error(`Error in WebSocket subscription callback for ${event}:`, err);
            }
          });
        }
      });

    } catch (err) {
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to create WebSocket connection');
    }
  }, [addAgentActivity, updateAgentStatus, setDockerStatus, setContainerMetrics, addChatMessage, addError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    subscriptionsRef.current.clear();
  }, []);

  const attemptReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (reconnectAttempts.current < maxReconnectAttempts) {
        console.log(`Attempting to reconnect (${reconnectAttempts.current + 1}/${maxReconnectAttempts})...`);
        connect();
      }
    }, delay);
  }, [connect]);

  const sendMessage = useCallback((type: string, data: any) => {
    if (!socketRef.current || !isConnected) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    const message: WebSocketMessage = {
      type: type as any,
      data,
      timestamp: new Date().toISOString()
    };

    socketRef.current.emit(type, data);
  }, [isConnected]);

  const subscribeToChannel = useCallback((channel: string, callback: (data: any) => void): (() => void) => {
    if (!subscriptionsRef.current.has(channel)) {
      subscriptionsRef.current.set(channel, new Set());
    }
    
    subscriptionsRef.current.get(channel)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = subscriptionsRef.current.get(channel);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          subscriptionsRef.current.delete(channel);
        }
      }
    };
  }, []);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  return {
    isConnected,
    connectionStatus,
    agentActivity,
    sendMessage,
    subscribeToChannel,
    error
  };
}