import Docker from 'dockerode';
import { EventEmitter } from 'events';
import { DockerContainer, DockerMetrics, DockerConfig } from '../types';

export class DockerService extends EventEmitter {
  private docker: Docker;
  private containers: Map<string, DockerContainer> = new Map();
  private metricsInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  constructor() {
    super();
    
    // Initialize Docker connection
    this.docker = new Docker({
      socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock'
    });
  }

  /**
   * Initialize Docker service and start monitoring
   */
  async initialize(): Promise<void> {
    try {
      // Test Docker connection
      await this.docker.ping();
      
      // Load existing containers
      await this.loadContainers();
      
      // Start monitoring
      this.startMonitoring();
      
      this.emit('initialized');
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to initialize Docker service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load existing containers
   */
  private async loadContainers(): Promise<void> {
    try {
      const containers = await this.docker.listContainers({ all: true });
      
      for (const containerInfo of containers) {
        const container = this.docker.getContainer(containerInfo.Id);
        const inspection = await container.inspect();
        
        const dockerContainer: DockerContainer = {
          id: containerInfo.Id,
          name: containerInfo.Names[0]?.replace('/', '') || 'unnamed',
          image: containerInfo.Image,
          status: containerInfo.State as DockerContainer['status'],
          ports: containerInfo.Ports.map(port => ({
            host: port.PublicPort || 0,
            container: port.PrivatePort
          })),
          volumes: inspection.Mounts.map(mount => ({
            host: mount.Source,
            container: mount.Destination
          })),
          environment: inspection.Config.Env.reduce((acc, env) => {
            const [key, value] = env.split('=');
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>),
          created: inspection.Created,
          started: inspection.State.StartedAt
        };

        this.containers.set(containerInfo.Id, dockerContainer);
      }

      this.emit('containers-loaded', Array.from(this.containers.values()));
    } catch (error) {
      console.error('Failed to load containers:', error);
    }
  }

  /**
   * Start monitoring Docker containers
   */
  private startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    
    // Monitor container events
    this.docker.getEvents({}, (err, stream) => {
      if (err) {
        console.error('Docker events error:', err);
        return;
      }

      if (stream) {
        stream.on('data', (chunk) => {
          try {
            const event = JSON.parse(chunk.toString());
            this.handleDockerEvent(event);
          } catch (error) {
            console.error('Failed to parse Docker event:', error);
          }
        });
      }
    });

    // Start metrics collection
    this.startMetricsCollection();
  }

  /**
   * Handle Docker events
   */
  private handleDockerEvent(event: any): void {
    const { Type, Action, Actor } = event;
    
    if (Type === 'container') {
      switch (Action) {
        case 'start':
          this.emit('container-started', Actor.ID);
          break;
        case 'stop':
          this.emit('container-stopped', Actor.ID);
          break;
        case 'die':
          this.emit('container-died', Actor.ID);
          break;
        case 'create':
          this.emit('container-created', Actor.ID);
          break;
        case 'destroy':
          this.emit('container-destroyed', Actor.ID);
          break;
      }
      
      // Reload container info
      this.loadContainers();
    }
  }

  /**
   * Start collecting container metrics
   */
  private startMetricsCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    this.metricsInterval = setInterval(async () => {
      for (const [containerId] of this.containers) {
        try {
          const metrics = await this.getContainerMetrics(containerId);
          this.emit('metrics-updated', containerId, metrics);
        } catch (error) {
          // Container might be stopped, ignore errors
        }
      }
    }, 2000); // Update every 2 seconds
  }

  /**
   * Get metrics for a specific container
   */
  async getContainerMetrics(containerId: string): Promise<DockerMetrics> {
    const container = this.docker.getContainer(containerId);
    const stats = await container.stats({ stream: false });

    // Calculate CPU usage
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemCpuDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuUsage = (cpuDelta / systemCpuDelta) * stats.cpu_stats.online_cpus * 100;

    // Memory usage
    const memoryUsage = stats.memory_stats.usage || 0;
    const memoryLimit = stats.memory_stats.limit || 0;

    // Network I/O
    const networks = stats.networks || {};
    const networkRx = Object.values(networks).reduce((acc: number, net: any) => acc + (net.rx_bytes || 0), 0);
    const networkTx = Object.values(networks).reduce((acc: number, net: any) => acc + (net.tx_bytes || 0), 0);

    // Disk I/O
    const blkioStats = stats.blkio_stats.io_service_bytes_recursive || [];
    const diskRead = blkioStats.filter((stat: any) => stat.op === 'Read').reduce((acc: number, stat: any) => acc + stat.value, 0);
    const diskWrite = blkioStats.filter((stat: any) => stat.op === 'Write').reduce((acc: number, stat: any) => acc + stat.value, 0);

    return {
      cpuUsage: isNaN(cpuUsage) ? 0 : cpuUsage,
      memoryUsage,
      memoryLimit,
      networkRx,
      networkTx,
      diskRead,
      diskWrite,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create and start a new container
   */
  async createContainer(config: DockerConfig, name: string): Promise<DockerContainer> {
    try {
      const container = await this.docker.createContainer({
        Image: config.image,
        name,
        ExposedPorts: config.ports.reduce((acc, port) => {
          acc[`${port.container}/tcp`] = {};
          return acc;
        }, {} as Record<string, any>),
        HostConfig: {
          PortBindings: config.ports.reduce((acc, port) => {
            acc[`${port.container}/tcp`] = [{ HostPort: port.host.toString() }];
            return acc;
          }, {} as Record<string, any>),
          Binds: config.volumes.map(vol => `${vol.host}:${vol.container}`),
          RestartPolicy: { Name: 'unless-stopped' }
        },
        Env: Object.entries(config.environment).map(([key, value]) => `${key}=${value}`),
        WorkingDir: '/app',
        Cmd: ['npm', 'start']
      });

      await container.start();

      const inspection = await container.inspect();
      
      const dockerContainer: DockerContainer = {
        id: container.id,
        name,
        image: config.image,
        status: 'running',
        ports: config.ports,
        volumes: config.volumes,
        environment: config.environment,
        created: inspection.Created,
        started: inspection.State.StartedAt
      };

      this.containers.set(container.id, dockerContainer);
      this.emit('container-created', dockerContainer);

      return dockerContainer;
    } catch (error) {
      throw new Error(`Failed to create container: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Start a container
   */
  async startContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.start();
      
      const dockerContainer = this.containers.get(containerId);
      if (dockerContainer) {
        dockerContainer.status = 'running';
        dockerContainer.started = new Date().toISOString();
        this.emit('container-started', dockerContainer);
      }
    } catch (error) {
      throw new Error(`Failed to start container: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stop a container
   */
  async stopContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.stop();
      
      const dockerContainer = this.containers.get(containerId);
      if (dockerContainer) {
        dockerContainer.status = 'stopped';
        this.emit('container-stopped', dockerContainer);
      }
    } catch (error) {
      throw new Error(`Failed to stop container: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Restart a container
   */
  async restartContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.restart();
      
      const dockerContainer = this.containers.get(containerId);
      if (dockerContainer) {
        dockerContainer.status = 'running';
        dockerContainer.started = new Date().toISOString();
        this.emit('container-restarted', dockerContainer);
      }
    } catch (error) {
      throw new Error(`Failed to restart container: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove a container
   */
  async removeContainer(containerId: string, force = false): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      
      if (force) {
        await container.kill();
      }
      
      await container.remove();
      
      this.containers.delete(containerId);
      this.emit('container-removed', containerId);
    } catch (error) {
      throw new Error(`Failed to remove container: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute command in container
   */
  async execCommand(containerId: string, command: string[]): Promise<string> {
    try {
      const container = this.docker.getContainer(containerId);
      
      const exec = await container.exec({
        Cmd: command,
        AttachStdout: true,
        AttachStderr: true
      });

      const stream = await exec.start({ hijack: true, stdin: false });
      
      return new Promise((resolve, reject) => {
        let output = '';
        
        stream.on('data', (chunk) => {
          output += chunk.toString();
        });
        
        stream.on('end', () => {
          resolve(output);
        });
        
        stream.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      throw new Error(`Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get container logs
   */
  async getContainerLogs(containerId: string, tail = 100): Promise<string> {
    try {
      const container = this.docker.getContainer(containerId);
      
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail,
        timestamps: true
      });

      return logs.toString();
    } catch (error) {
      throw new Error(`Failed to get container logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build image from Dockerfile
   */
  async buildImage(contextPath: string, dockerfile: string, tag: string): Promise<string> {
    try {
      const stream = await this.docker.buildImage({
        context: contextPath,
        src: ['.']
      }, {
        dockerfile,
        t: tag,
        pull: true,
        rm: true
      });

      return new Promise((resolve, reject) => {
        let imageId = '';
        
        this.docker.modem.followProgress(stream, (err, res) => {
          if (err) {
            reject(err);
          } else {
            // Extract image ID from build output
            const successMessage = res?.find((msg: any) => msg.aux?.ID);
            imageId = successMessage?.aux?.ID || tag;
            resolve(imageId);
          }
        }, (event) => {
          // Emit build progress events
          this.emit('build-progress', event);
        });
      });
    } catch (error) {
      throw new Error(`Failed to build image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Pull Docker image
   */
  async pullImage(imageName: string): Promise<void> {
    try {
      const stream = await this.docker.pull(imageName);
      
      await new Promise((resolve, reject) => {
        this.docker.modem.followProgress(stream, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        }, (event) => {
          this.emit('pull-progress', event);
        });
      });
    } catch (error) {
      throw new Error(`Failed to pull image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Docker system information
   */
  async getSystemInfo(): Promise<any> {
    try {
      const info = await this.docker.info();
      return {
        version: await this.docker.version(),
        info,
        containers: {
          total: info.Containers,
          running: info.ContainersRunning,
          paused: info.ContainersPaused,
          stopped: info.ContainersStopped
        },
        images: info.Images,
        serverVersion: info.ServerVersion
      };
    } catch (error) {
      throw new Error(`Failed to get system info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create development environment from docker-compose
   */
  async createDevEnvironment(composePath: string): Promise<void> {
    try {
      // This would use docker-compose programmatically
      // For now, we'll use the command line interface
      const { spawn } = require('child_process');
      
      const process = spawn('docker-compose', ['-f', composePath, 'up', '-d'], {
        stdio: 'pipe'
      });

      await new Promise((resolve, reject) => {
        let output = '';
        
        process.stdout.on('data', (data: Buffer) => {
          output += data.toString();
          this.emit('compose-output', data.toString());
        });
        
        process.stderr.on('data', (data: Buffer) => {
          output += data.toString();
          this.emit('compose-error', data.toString());
        });
        
        process.on('close', (code: number) => {
          if (code === 0) {
            resolve(output);
          } else {
            reject(new Error(`docker-compose failed with code ${code}`));
          }
        });
      });

      // Reload containers after compose up
      await this.loadContainers();
    } catch (error) {
      throw new Error(`Failed to create dev environment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stop development environment
   */
  async stopDevEnvironment(composePath: string): Promise<void> {
    try {
      const { spawn } = require('child_process');
      
      const process = spawn('docker-compose', ['-f', composePath, 'down'], {
        stdio: 'pipe'
      });

      await new Promise((resolve, reject) => {
        process.on('close', (code: number) => {
          if (code === 0) {
            resolve(void 0);
          } else {
            reject(new Error(`docker-compose down failed with code ${code}`));
          }
        });
      });

      // Clear stopped containers
      this.containers.clear();
      this.emit('dev-environment-stopped');
    } catch (error) {
      throw new Error(`Failed to stop dev environment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all containers
   */
  getContainers(): DockerContainer[] {
    return Array.from(this.containers.values());
  }

  /**
   * Get container by ID
   */
  getContainer(containerId: string): DockerContainer | undefined {
    return this.containers.get(containerId);
  }

  /**
   * Check if Docker is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const docker = new Docker();
      await docker.ping();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    this.isMonitoring = false;
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    this.removeAllListeners();
  }

  /**
   * Get container health status
   */
  async getContainerHealth(containerId: string): Promise<string> {
    try {
      const container = this.docker.getContainer(containerId);
      const inspection = await container.inspect();
      
      if (inspection.State.Health) {
        return inspection.State.Health.Status;
      }
      
      return inspection.State.Status;
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Stream container logs
   */
  async streamLogs(containerId: string, callback: (data: string) => void): Promise<() => void> {
    try {
      const container = this.docker.getContainer(containerId);
      
      const stream = await container.logs({
        follow: true,
        stdout: true,
        stderr: true,
        timestamps: true
      });

      stream.on('data', (chunk) => {
        callback(chunk.toString());
      });

      // Return cleanup function
      return () => {
        stream.destroy();
      };
    } catch (error) {
      throw new Error(`Failed to stream logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Prune unused containers and images
   */
  async prune(): Promise<{ containersDeleted: number; spaceReclaimed: number }> {
    try {
      const containerPrune = await this.docker.pruneContainers();
      const imagePrune = await this.docker.pruneImages();
      
      return {
        containersDeleted: containerPrune.ContainersDeleted?.length || 0,
        spaceReclaimed: (containerPrune.SpaceReclaimed || 0) + (imagePrune.SpaceReclaimed || 0)
      };
    } catch (error) {
      throw new Error(`Failed to prune: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const dockerService = new DockerService();