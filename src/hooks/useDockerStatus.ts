import { useState, useEffect, useCallback, useRef } from 'react';
import { dockerService } from '../services/dockerService';
import { useAppStore } from '../stores';
import { DockerContainer, DockerMetrics } from '../types';

interface UseDockerStatusReturn {
  dockerStatus: string;
  containers: DockerContainer[];
  containerMetrics: DockerMetrics | null;
  isDockerAvailable: boolean;
  isMonitoring: boolean;
  startContainer: (containerId: string) => Promise<void>;
  stopContainer: (containerId: string) => Promise<void>;
  restartContainer: (containerId: string) => Promise<void>;
  buildImage: (tag: string) => Promise<void>;
  startDevEnvironment: () => Promise<void>;
  stopDevEnvironment: () => Promise<void>;
  getContainerLogs: (containerId: string) => Promise<string>;
  error: string | null;
}

export function useDockerStatus(): UseDockerStatusReturn {
  const [dockerStatus, setDockerStatus] = useState('unknown');
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [containerMetrics, setContainerMetrics] = useState<DockerMetrics | null>(null);
  const [isDockerAvailable, setIsDockerAvailable] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { addError, setContainerMetrics: storeSetMetrics } = useAppStore();

  // Initialize Docker service
  useEffect(() => {
    initializeDocker();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeDocker = useCallback(async () => {
    try {
      // Check if Docker is available
      const available = await dockerService.isAvailable();
      setIsDockerAvailable(available);
      
      if (!available) {
        setDockerStatus('unavailable');
        setError('Docker is not available. Please install and start Docker.');
        return;
      }

      // Initialize Docker service
      await dockerService.initialize();
      setDockerStatus('connected');
      
      // Set up event listeners
      dockerService.on('initialized', () => {
        setDockerStatus('connected');
        startMonitoring();
      });

      dockerService.on('containers-loaded', (loadedContainers: DockerContainer[]) => {
        setContainers(loadedContainers);
        
        // Update overall Docker status based on containers
        const runningContainers = loadedContainers.filter(c => c.status === 'running');
        if (runningContainers.length > 0) {
          setDockerStatus('running');
        } else {
          setDockerStatus('stopped');
        }
      });

      dockerService.on('container-started', (container: DockerContainer) => {
        setContainers(prev => prev.map(c => 
          c.id === container.id ? { ...c, status: 'running' } : c
        ));
        setDockerStatus('running');
      });

      dockerService.on('container-stopped', (container: DockerContainer) => {
        setContainers(prev => prev.map(c => 
          c.id === container.id ? { ...c, status: 'stopped' } : c
        ));
        
        // Check if any containers are still running
        const stillRunning = containers.some(c => c.id !== container.id && c.status === 'running');
        if (!stillRunning) {
          setDockerStatus('stopped');
        }
      });

      dockerService.on('metrics-updated', (containerId: string, metrics: DockerMetrics) => {
        setContainerMetrics(metrics);
        storeSetMetrics(metrics);
      });

      dockerService.on('error', (err: Error) => {
        setError(err.message);
        setDockerStatus('error');
        
        addError({
          id: Date.now().toString(),
          type: 'docker',
          severity: 'high',
          message: err.message,
          timestamp: new Date().toISOString()
        });
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Docker';
      setError(errorMessage);
      setDockerStatus('error');
      setIsDockerAvailable(false);
    }
  }, [containers, addError, storeSetMetrics]);

  const startMonitoring = useCallback(() => {
    if (isMonitoring || !isDockerAvailable) return;

    setIsMonitoring(true);
    
    // Monitor Docker status every 5 seconds
    monitoringIntervalRef.current = setInterval(async () => {
      try {
        const systemInfo = await dockerService.getSystemInfo();
        
        // Update container list
        const currentContainers = dockerService.getContainers();
        setContainers(currentContainers);
        
        // Update status based on running containers
        const runningCount = currentContainers.filter(c => c.status === 'running').length;
        if (runningCount > 0) {
          setDockerStatus('running');
        } else if (currentContainers.length > 0) {
          setDockerStatus('stopped');
        } else {
          setDockerStatus('connected');
        }
        
        setError(null);
      } catch (err) {
        console.error('Docker monitoring error:', err);
        setDockerStatus('error');
        setError(err instanceof Error ? err.message : 'Docker monitoring failed');
      }
    }, 5000);
  }, [isMonitoring, isDockerAvailable]);

  const cleanup = useCallback(() => {
    setIsMonitoring(false);
    
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
    
    dockerService.cleanup();
  }, []);

  const startContainer = useCallback(async (containerId: string): Promise<void> => {
    try {
      await dockerService.startContainer(containerId);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start container';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const stopContainer = useCallback(async (containerId: string): Promise<void> => {
    try {
      await dockerService.stopContainer(containerId);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop container';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const restartContainer = useCallback(async (containerId: string): Promise<void> => {
    try {
      await dockerService.restartContainer(containerId);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restart container';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const buildImage = useCallback(async (tag: string): Promise<void> => {
    try {
      setDockerStatus('building');
      await dockerService.buildImage('.', 'docker/Dockerfile', tag);
      setDockerStatus('connected');
      setError(null);
    } catch (err) {
      setDockerStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Failed to build image';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const startDevEnvironment = useCallback(async (): Promise<void> => {
    try {
      setDockerStatus('building');
      await dockerService.createDevEnvironment('docker/docker-compose.dev.yml');
      setDockerStatus('running');
      setError(null);
    } catch (err) {
      setDockerStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Failed to start development environment';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const stopDevEnvironment = useCallback(async (): Promise<void> => {
    try {
      await dockerService.stopDevEnvironment('docker/docker-compose.dev.yml');
      setDockerStatus('stopped');
      setContainers([]);
      setContainerMetrics(null);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop development environment';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getContainerLogs = useCallback(async (containerId: string): Promise<string> => {
    try {
      return await dockerService.getContainerLogs(containerId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get container logs';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    dockerStatus,
    containers,
    containerMetrics,
    isDockerAvailable,
    isMonitoring,
    startContainer,
    stopContainer,
    restartContainer,
    buildImage,
    startDevEnvironment,
    stopDevEnvironment,
    getContainerLogs,
    error
  };
}