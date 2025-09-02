// Docker utility functions for the Claude Code IDE

import { 
  DockerContainer, 
  DockerContainerStatus, 
  DockerImage, 
  DockerComposeService,
  DockerComposeConfig,
  DockerContainerConfig,
  DockerPortBinding,
  DockerHealthStatus
} from '../types/docker';

/**
 * Parses Docker container status from Docker API response
 */
export function parseContainerStatus(status: string): DockerContainerStatus {
  const normalizedStatus = status.toLowerCase();
  
  if (normalizedStatus.includes('up')) return 'running';
  if (normalizedStatus.includes('exited')) return 'exited';
  if (normalizedStatus.includes('created')) return 'created';
  if (normalizedStatus.includes('paused')) return 'paused';
  if (normalizedStatus.includes('restarting')) return 'restarting';
  if (normalizedStatus.includes('removing')) return 'removing';
  if (normalizedStatus.includes('dead')) return 'dead';
  
  return 'exited'; // Default fallback
}

/**
 * Formats Docker container uptime
 */
export function formatContainerUptime(startedAt?: Date): string {
  if (!startedAt) return 'Not running';
  
  const now = new Date();
  const uptime = now.getTime() - startedAt.getTime();
  const seconds = Math.floor(uptime / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Formats Docker image size
 */
export function formatImageSize(size: number): string {
  if (size === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const formattedSize = size / Math.pow(1024, i);
  
  return `${formattedSize.toFixed(1)} ${units[i]}`;
}

/**
 * Extracts image name and tag from full image reference
 */
export function parseImageReference(imageRef: string): { registry?: string; name: string; tag: string } {
  // Handle registry/namespace/image:tag format
  const parts = imageRef.split('/');
  let registry: string | undefined;
  let nameWithTag: string;
  
  if (parts.length === 3) {
    registry = parts[0];
    nameWithTag = `${parts[1]}/${parts[2]}`;
  } else if (parts.length === 2 && parts[0].includes('.')) {
    registry = parts[0];
    nameWithTag = parts[1];
  } else {
    nameWithTag = imageRef;
  }
  
  // Split name and tag
  const colonIndex = nameWithTag.lastIndexOf(':');
  let name: string;
  let tag: string;
  
  if (colonIndex > 0 && !nameWithTag.slice(colonIndex + 1).includes('/')) {
    name = nameWithTag.slice(0, colonIndex);
    tag = nameWithTag.slice(colonIndex + 1);
  } else {
    name = nameWithTag;
    tag = 'latest';
  }
  
  return { registry, name, tag };
}

/**
 * Validates Docker container name
 */
export function isValidContainerName(name: string): boolean {
  // Docker container names must match [a-zA-Z0-9][a-zA-Z0-9_.-]*
  const regex = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;
  return regex.test(name) && name.length > 0 && name.length <= 63;
}

/**
 * Validates Docker image name
 */
export function isValidImageName(imageName: string): boolean {
  const regex = /^(?:(?=[^:\/]{1,253})(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(?:\.(?!-)[a-zA-Z0-9-]{1,63}(?<!-))*(?::[0-9]{1,5})?\/)?[a-z0-9]+(?:(?:(?:[._]|__|[-]*)[a-z0-9]+)+)?(?:(?:\/[a-z0-9]+(?:(?:(?:[._]|__|[-]*)[a-z0-9]+)+)?)+)?(?::[a-zA-Z0-9_][a-zA-Z0-9._-]{0,127})?$/;
  return regex.test(imageName);
}

/**
 * Generates a unique container name
 */
export function generateContainerName(baseName: string, existingNames: string[]): string {
  let counter = 0;
  let name = baseName.replace(/[^a-zA-Z0-9_.-]/g, '-').toLowerCase();
  
  // Ensure it starts with alphanumeric
  if (!/^[a-zA-Z0-9]/.test(name)) {
    name = 'container-' + name;
  }
  
  let uniqueName = name;
  while (existingNames.includes(uniqueName)) {
    counter++;
    uniqueName = `${name}-${counter}`;
  }
  
  return uniqueName;
}

/**
 * Converts port binding object to string format
 */
export function formatPortBinding(binding: DockerPortBinding[]): string {
  return binding
    .map(b => `${b.hostIp || '0.0.0.0'}:${b.hostPort}`)
    .join(', ');
}

/**
 * Parses port string to port binding object
 */
export function parsePortString(portStr: string): { containerPort: number; hostPort?: number; protocol: 'tcp' | 'udp' } {
  // Handle formats: "80", "8080:80", "8080:80/tcp", "127.0.0.1:8080:80"
  const parts = portStr.split(':');
  let hostPort: number | undefined;
  let containerPort: number;
  let protocol: 'tcp' | 'udp' = 'tcp';
  
  if (parts.length === 1) {
    // "80" or "80/tcp"
    const [port, proto] = parts[0].split('/');
    containerPort = parseInt(port);
    if (proto) protocol = proto as 'tcp' | 'udp';
  } else if (parts.length === 2) {
    // "8080:80" or "8080:80/tcp"
    hostPort = parseInt(parts[0]);
    const [port, proto] = parts[1].split('/');
    containerPort = parseInt(port);
    if (proto) protocol = proto as 'tcp' | 'udp';
  } else if (parts.length === 3) {
    // "127.0.0.1:8080:80"
    hostPort = parseInt(parts[1]);
    const [port, proto] = parts[2].split('/');
    containerPort = parseInt(port);
    if (proto) protocol = proto as 'tcp' | 'udp';
  } else {
    throw new Error(`Invalid port format: ${portStr}`);
  }
  
  return { containerPort, hostPort, protocol };
}

/**
 * Creates a default Docker Compose configuration
 */
export function createDefaultDockerCompose(projectName: string): DockerComposeConfig {
  return {
    version: '3.8',
    services: {
      app: {
        build: '.',
        ports: ['3000:3000'],
        volumes: ['.:/app', '/app/node_modules'],
        environment: {
          NODE_ENV: 'development',
          PORT: '3000',
        },
        restart: 'unless-stopped',
        depends_on: [],
        networks: ['default'],
      },
    },
    networks: {
      default: {
        driver: 'bridge',
      },
    },
    volumes: {},
  };
}

/**
 * Validates Docker Compose service configuration
 */
export function validateDockerComposeService(service: DockerComposeService): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (!service.image && !service.build) {
    errors.push('Service must specify either "image" or "build"');
  }
  
  // Validate ports
  if (service.ports) {
    service.ports.forEach((port, index) => {
      try {
        parsePortString(port);
      } catch (error) {
        errors.push(`Invalid port format at index ${index}: ${port}`);
      }
    });
  }
  
  // Validate volumes
  if (service.volumes) {
    service.volumes.forEach((volume, index) => {
      if (!volume.includes(':')) {
        errors.push(`Invalid volume format at index ${index}: ${volume}. Expected "host:container" format`);
      }
    });
  }
  
  // Validate restart policy
  if (service.restart && !['no', 'always', 'unless-stopped', 'on-failure'].includes(service.restart)) {
    errors.push(`Invalid restart policy: ${service.restart}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a Dockerfile content based on project type
 */
export function generateDockerfile(projectType: 'node' | 'python' | 'java' | 'go' | 'rust' = 'node'): string {
  const dockerfiles = {
    node: `# Node.js Dockerfile for Claude Code IDE
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]`,

    python: `# Python Dockerfile for Claude Code IDE
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["python", "app.py"]`,

    java: `# Java Dockerfile for Claude Code IDE
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Install Maven
RUN apt-get update && apt-get install -y maven curl && rm -rf /var/lib/apt/lists/*

# Copy Maven files
COPY pom.xml .
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Start application
CMD ["java", "-jar", "target/app.jar"]`,

    go: `# Go Dockerfile for Claude Code IDE
FROM golang:1.21-alpine AS builder

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

# Install ca-certificates and curl for health checks
RUN apk --no-cache add ca-certificates curl

# Set working directory
WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/main .

# Create non-root user
RUN adduser -D -s /bin/sh app
USER app

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8080/health || exit 1

# Start application
CMD ["./main"]`,

    rust: `# Rust Dockerfile for Claude Code IDE
FROM rust:1.70 AS builder

# Set working directory
WORKDIR /app

# Copy Cargo files
COPY Cargo.toml Cargo.lock ./

# Create dummy source to cache dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -rf src

# Copy actual source
COPY src ./src

# Build application
RUN touch src/main.rs && cargo build --release

# Final stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/target/release/app .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8080/health || exit 1

# Start application
CMD ["./app"]`,
  };
  
  return dockerfiles[projectType];
}

/**
 * Creates a .dockerignore file content
 */
export function generateDockerIgnore(): string {
  return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Development files
.git/
.gitignore
.env.local
.env.*.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Build outputs
dist/
build/
*.tgz
*.tar.gz

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
.nyc_output/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# Next.js build output
.next/

# Nuxt.js build output
.nuxt/

# Storybook build outputs
.out/
.storybook-out/

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.sublime-*

# Local configuration files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Testing
test-results/
playwright-report/
.pytest_cache/

# Claude Code IDE specific
.claude/
claude-code/logs/
claude-code/temp/
`;
}

/**
 * Converts resource limits to Docker format
 */
export function formatResourceLimits(limits: {
  memory?: string;
  cpus?: string;
  pids?: number;
}): Record<string, any> {
  const result: Record<string, any> = {};
  
  if (limits.memory) {
    // Convert memory string like "512m" or "1g" to bytes
    const memoryMatch = limits.memory.match(/^(\d+(?:\.\d+)?)(b|k|m|g)?$/i);
    if (memoryMatch) {
      const [, amount, unit] = memoryMatch;
      const bytes = parseFloat(amount);
      const multipliers = { b: 1, k: 1024, m: 1024 ** 2, g: 1024 ** 3 };
      result.memory = Math.floor(bytes * (multipliers[unit?.toLowerCase() as keyof typeof multipliers] || 1));
    }
  }
  
  if (limits.cpus) {
    result.cpus = parseFloat(limits.cpus);
  }
  
  if (limits.pids) {
    result.pids_limit = limits.pids;
  }
  
  return result;
}

/**
 * Creates environment variables object from array
 */
export function parseEnvironmentVariables(envArray: string[]): Record<string, string> {
  const env: Record<string, string> = {};
  
  envArray.forEach(envVar => {
    const equalIndex = envVar.indexOf('=');
    if (equalIndex > 0) {
      const key = envVar.slice(0, equalIndex);
      const value = envVar.slice(equalIndex + 1);
      env[key] = value;
    }
  });
  
  return env;
}

/**
 * Converts environment object to array format
 */
export function formatEnvironmentVariables(env: Record<string, string>): string[] {
  return Object.entries(env).map(([key, value]) => `${key}=${value}`);
}

/**
 * Gets container health status from inspect data
 */
export function getContainerHealth(inspectData: any): DockerHealthStatus {
  if (!inspectData.State?.Health) return 'none';
  
  const health = inspectData.State.Health;
  if (health.Status === 'healthy') return 'healthy';
  if (health.Status === 'unhealthy') return 'unhealthy';
  if (health.Status === 'starting') return 'starting';
  
  return 'none';
}

/**
 * Estimates container resource usage percentage
 */
export function calculateResourceUsage(stats: any): {
  cpu: number;
  memory: number;
  network: { rx: number; tx: number };
} {
  // CPU usage calculation
  const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
  const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
  const numCpus = stats.cpu_stats.online_cpus || 1;
  const cpuUsage = (cpuDelta / systemDelta) * numCpus * 100;
  
  // Memory usage calculation
  const memoryUsage = (stats.memory_stats.usage / stats.memory_stats.limit) * 100;
  
  // Network usage
  const networks = stats.networks || {};
  const networkRx = Object.values(networks).reduce((total: number, net: any) => total + (net.rx_bytes || 0), 0);
  const networkTx = Object.values(networks).reduce((total: number, net: any) => total + (net.tx_bytes || 0), 0);
  
  return {
    cpu: Math.min(Math.max(cpuUsage || 0, 0), 100),
    memory: Math.min(Math.max(memoryUsage || 0, 0), 100),
    network: { rx: networkRx, tx: networkTx },
  };
}

/**
 * Formats Docker logs for display
 */
export function formatDockerLogs(logs: string): Array<{ timestamp: Date; stream: 'stdout' | 'stderr'; content: string }> {
  const lines = logs.split('\n').filter(line => line.trim());
  
  return lines.map(line => {
    // Try to parse Docker log format
    const logMatch = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s+(stdout|stderr)\s+(.*)$/);
    
    if (logMatch) {
      return {
        timestamp: new Date(logMatch[1]),
        stream: logMatch[2] as 'stdout' | 'stderr',
        content: logMatch[3],
      };
    }
    
    // Fallback for logs without timestamp
    return {
      timestamp: new Date(),
      stream: 'stdout' as const,
      content: line,
    };
  });
}

/**
 * Creates Docker container configuration from service definition
 */
export function serviceToContainerConfig(
  serviceName: string, 
  service: DockerComposeService, 
  projectName: string
): DockerContainerConfig {
  const config: DockerContainerConfig = {
    name: `${projectName}_${serviceName}_1`,
    image: service.image || `${projectName}_${serviceName}`,
    env: service.environment ? formatEnvironmentVariables(service.environment) : [],
    labels: {
      'com.docker.compose.project': projectName,
      'com.docker.compose.service': serviceName,
      ...service.labels,
    },
  };
  
  // Handle ports
  if (service.ports) {
    const portBindings: Record<string, DockerPortBinding[]> = {};
    const exposedPorts: Record<string, {}> = {};
    
    service.ports.forEach(portStr => {
      try {
        const { containerPort, hostPort, protocol } = parsePortString(portStr);
        const containerPortKey = `${containerPort}/${protocol}`;
        
        exposedPorts[containerPortKey] = {};
        
        if (hostPort) {
          portBindings[containerPortKey] = [{
            hostPort: hostPort.toString(),
          }];
        }
      } catch (error) {
        console.warn(`Invalid port configuration: ${portStr}`);
      }
    });
    
    config.exposedPorts = exposedPorts;
    config.hostConfig = {
      ...config.hostConfig,
      portBindings,
    };
  }
  
  // Handle volumes
  if (service.volumes) {
    const binds = service.volumes.filter(volume => volume.includes(':'));
    config.hostConfig = {
      ...config.hostConfig,
      binds,
    };
  }
  
  // Handle restart policy
  if (service.restart) {
    const restartPolicyMap = {
      'no': { name: 'no' as const },
      'always': { name: 'always' as const },
      'unless-stopped': { name: 'unless-stopped' as const },
      'on-failure': { name: 'on-failure' as const },
    };
    
    config.hostConfig = {
      ...config.hostConfig,
      restartPolicy: restartPolicyMap[service.restart as keyof typeof restartPolicyMap] || { name: 'no' },
    };
  }
  
  // Handle command
  if (service.command) {
    config.cmd = service.command.split(' ');
  }
  
  // Handle entrypoint
  if (service.entrypoint) {
    config.entrypoint = service.entrypoint.split(' ');
  }
  
  // Handle working directory
  if (service.working_dir) {
    config.workingDir = service.working_dir;
  }
  
  // Handle user
  if (service.user) {
    config.user = service.user;
  }
  
  return config;
}

/**
 * Escapes shell arguments for Docker exec commands
 */
export function escapeShellArg(arg: string): string {
  // Replace single quotes with '\'' (end quote, escaped quote, start quote)
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

/**
 * Creates a shell command array for Docker exec
 */
export function createExecCommand(command: string, shell: string = '/bin/sh'): string[] {
  return [shell, '-c', command];
}

/**
 * Monitors Docker container health
 */
export function createHealthMonitor(
  containerId: string,
  onHealthChange: (status: DockerHealthStatus) => void,
  interval: number = 30000
): () => void {
  let currentHealth: DockerHealthStatus = 'none';
  let intervalId: NodeJS.Timeout;
  
  const checkHealth = async () => {
    try {
      // This would normally make an API call to Docker
      // For now, we'll simulate the health check
      const response = await fetch(`/api/docker/containers/${containerId}/health`);
      const health = await response.json();
      
      if (health.status !== currentHealth) {
        currentHealth = health.status;
        onHealthChange(currentHealth);
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };
  
  // Start monitoring
  intervalId = setInterval(checkHealth, interval);
  checkHealth(); // Initial check
  
  // Return cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}

/**
 * Calculates optimal resource allocation for containers
 */
export function calculateOptimalResources(containers: DockerContainer[]): {
  totalMemory: number;
  totalCpu: number;
  recommendations: Array<{ containerId: string; memory: string; cpu: string }>;
} {
  // Get system resources (mock implementation)
  const systemMemory = 8 * 1024 * 1024 * 1024; // 8GB
  const systemCpus = 4;
  
  const runningContainers = containers.filter(c => c.status === 'running');
  const containerCount = runningContainers.length;
  
  if (containerCount === 0) {
    return {
      totalMemory: 0,
      totalCpu: 0,
      recommendations: [],
    };
  }
  
  // Allocate 75% of system resources to containers
  const availableMemory = systemMemory * 0.75;
  const availableCpu = systemCpus * 0.75;
  
  const memoryPerContainer = Math.floor(availableMemory / containerCount);
  const cpuPerContainer = Number((availableCpu / containerCount).toFixed(2));
  
  const recommendations = runningContainers.map(container => ({
    containerId: container.id,
    memory: formatImageSize(memoryPerContainer),
    cpu: cpuPerContainer.toString(),
  }));
  
  return {
    totalMemory: availableMemory,
    totalCpu: availableCpu,
    recommendations,
  };
}

/**
 * Generates Docker build context from project files
 */
export function createBuildContext(
  files: Array<{ path: string; content: string }>,
  excludePatterns: string[] = []
): { context: string; dockerfile: string } {
  const dockerfile = files.find(f => f.path === 'Dockerfile')?.content || generateDockerfile();
  
  // Filter out excluded files
  const contextFiles = files.filter(file => {
    return !excludePatterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
      return regex.test(file.path);
    });
  });
  
  // Create a simple tar-like structure (in real implementation, this would be a proper tar)
  const context = JSON.stringify({
    files: contextFiles.map(f => ({
      path: f.path,
      content: f.content,
      mode: f.path.endsWith('.sh') ? '755' : '644',
    })),
    timestamp: new Date().toISOString(),
  });
  
  return { context, dockerfile };
}

/**
 * Validates Docker Compose file format
 */
export function validateDockerCompose(config: DockerComposeConfig): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check version
  if (!config.version) {
    errors.push('Missing version field');
  } else if (!['3.0', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9'].includes(config.version)) {
    warnings.push(`Version ${config.version} may not be supported`);
  }
  
  // Check services
  if (!config.services || Object.keys(config.services).length === 0) {
    errors.push('At least one service must be defined');
  } else {
    Object.entries(config.services).forEach(([serviceName, service]) => {
      const serviceValidation = validateDockerComposeService(service);
      if (!serviceValidation.valid) {
        errors.push(`Service "${serviceName}": ${serviceValidation.errors.join(', ')}`);
      }
    });
  }
  
  // Check for circular dependencies
  const services = config.services || {};
  const visited = new Set<string>();
  const visiting = new Set<string>();
  
  const checkCircularDependency = (serviceName: string): boolean => {
    if (visiting.has(serviceName)) return true;
    if (visited.has(serviceName)) return false;
    
    visiting.add(serviceName);
    
    const service = services[serviceName];
    const dependencies = service?.depends_on || [];
    
    for (const dep of dependencies) {
      if (checkCircularDependency(dep)) {
        errors.push(`Circular dependency detected: ${serviceName} -> ${dep}`);
        return true;
      }
    }
    
    visiting.delete(serviceName);
    visited.add(serviceName);
    return false;
  };
  
  Object.keys(services).forEach(checkCircularDependency);
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Creates a Docker network configuration
 */
export function createNetworkConfig(
  name: string,
  driver: 'bridge' | 'host' | 'overlay' | 'none' = 'bridge',
  options?: Record<string, any>
): Record<string, any> {
  return {
    driver,
    attachable: true,
    labels: {
      'com.claude-ide.network': 'true',
      'com.claude-ide.created': new Date().toISOString(),
    },
    ...options,
  };
}

/**
 * Parses Docker build output
 */
export function parseBuildOutput(output: string): Array<{
  step: number;
  instruction: string;
  output: string;
  status: 'success' | 'error' | 'running';
}> {
  const lines = output.split('\n').filter(line => line.trim());
  const steps: Array<{
    step: number;
    instruction: string;
    output: string;
    status: 'success' | 'error' | 'running';
  }> = [];
  
  let currentStep = 0;
  
  lines.forEach(line => {
    // Match step format: "Step 1/5 : FROM node:18"
    const stepMatch = line.match(/^Step (\d+)\/\d+\s*:\s*(.+)$/);
    if (stepMatch) {
      currentStep = parseInt(stepMatch[1]);
      steps.push({
        step: currentStep,
        instruction: stepMatch[2],
        output: line,
        status: 'running',
      });
      return;
    }
    
    // Update current step output
    if (currentStep > 0 && steps.length > 0) {
      const lastStep = steps[steps.length - 1];
      if (lastStep.step === currentStep) {
        lastStep.output += '\n' + line;
        
        // Detect completion or error
        if (line.includes('Successfully built') || line.includes('Successfully tagged')) {
          lastStep.status = 'success';
        } else if (line.toLowerCase().includes('error') || line.toLowerCase().includes('failed')) {
          lastStep.status = 'error';
        }
      }
    }
  });
  
  return steps;
}

/**
 * Creates a container name from service and project
 */
export function createContainerName(projectName: string, serviceName: string, index: number = 1): string {
  return `${projectName.replace(/[^a-zA-Z0-9]/g, '-')}_${serviceName}_${index}`;
}

/**
 * Extracts project name from Docker Compose file path
 */
export function extractProjectName(composePath: string): string {
  const pathParts = composePath.split('/');
  const directory = pathParts[pathParts.length - 2] || 'unknown';
  return directory.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
}

/**
 * Merges Docker Compose configurations
 */
export function mergeDockerComposeConfigs(
  base: DockerComposeConfig,
  override: Partial<DockerComposeConfig>
): DockerComposeConfig {
  return {
    version: override.version || base.version,
    services: {
      ...base.services,
      ...Object.entries(override.services || {}).reduce((acc, [name, service]) => {
        acc[name] = {
          ...base.services[name],
          ...service,
          environment: {
            ...base.services[name]?.environment,
            ...service.environment,
          },
          volumes: [
            ...(base.services[name]?.volumes || []),
            ...(service.volumes || []),
          ],
          ports: [
            ...(base.services[name]?.ports || []),
            ...(service.ports || []),
          ],
        };
        return acc;
      }, {} as Record<string, DockerComposeService>),
    },
    networks: {
      ...base.networks,
      ...override.networks,
    },
    volumes: {
      ...base.volumes,
      ...override.volumes,
    },
  };
}

/**
 * Generates Docker Compose YAML content
 */
export function generateDockerComposeYAML(config: DockerComposeConfig): string {
  const yamlLines: string[] = [];
  
  yamlLines.push(`version: '${config.version}'`);
  yamlLines.push('');
  yamlLines.push('services:');
  
  Object.entries(config.services).forEach(([serviceName, service]) => {
    yamlLines.push(`  ${serviceName}:`);
    
    if (service.image) {
      yamlLines.push(`    image: ${service.image}`);
    }
    
    if (service.build) {
      if (typeof service.build === 'string') {
        yamlLines.push(`    build: ${service.build}`);
      } else {
        yamlLines.push('    build:');
        yamlLines.push(`      context: ${service.build.context}`);
        if (service.build.dockerfile) {
          yamlLines.push(`      dockerfile: ${service.build.dockerfile}`);
        }
        if (service.build.args) {
          yamlLines.push('      args:');
          Object.entries(service.build.args).forEach(([key, value]) => {
            yamlLines.push(`        ${key}: ${value}`);
          });
        }
      }
    }
    
    if (service.ports) {
      yamlLines.push('    ports:');
      service.ports.forEach(port => {
        yamlLines.push(`      - "${port}"`);
      });
    }
    
    if (service.volumes) {
      yamlLines.push('    volumes:');
      service.volumes.forEach(volume => {
        yamlLines.push(`      - ${volume}`);
      });
    }
    
    if (service.environment) {
      yamlLines.push('    environment:');
      Object.entries(service.environment).forEach(([key, value]) => {
        yamlLines.push(`      ${key}: ${value}`);
      });
    }
    
    if (service.depends_on && service.depends_on.length > 0) {
      yamlLines.push('    depends_on:');
      service.depends_on.forEach(dep => {
        yamlLines.push(`      - ${dep}`);
      });
    }
    
    if (service.restart) {
      yamlLines.push(`    restart: ${service.restart}`);
    }
    
    yamlLines.push('');
  });
  
  // Add networks if defined
  if (config.networks && Object.keys(config.networks).length > 0) {
    yamlLines.push('networks:');
    Object.entries(config.networks).forEach(([networkName, network]) => {
      yamlLines.push(`  ${networkName}:`);
      if (network.driver) {
        yamlLines.push(`    driver: ${network.driver}`);
      }
      if (network.attachable) {
        yamlLines.push(`    attachable: ${network.attachable}`);
      }
    });
    yamlLines.push('');
  }
  
  // Add volumes if defined
  if (config.volumes && Object.keys(config.volumes).length > 0) {
    yamlLines.push('volumes:');
    Object.entries(config.volumes).forEach(([volumeName, volume]) => {
      yamlLines.push(`  ${volumeName}:`);
      if (volume.driver) {
        yamlLines.push(`    driver: ${volume.driver}`);
      }
      if (volume.external) {
        yamlLines.push(`    external: ${volume.external}`);
      }
    });
  }
  
  return yamlLines.join('\n');
}

/**
 * Detects project type from files
 */
export function detectProjectType(files: string[]): 'node' | 'python' | 'java' | 'go' | 'rust' | 'unknown' {
  if (files.includes('package.json')) return 'node';
  if (files.includes('requirements.txt') || files.includes('pyproject.toml')) return 'python';
  if (files.includes('pom.xml') || files.includes('build.gradle')) return 'java';
  if (files.includes('go.mod')) return 'go';
  if (files.includes('Cargo.toml')) return 'rust';
  
  return 'unknown';
}

/**
 * Debounce function for Docker operations
 */
export function debounceDockerOperation<T extends (...args: any[]) => Promise<any>>(
  operation: T,
  delay: number = 1000
): T {
  let timeoutId: NodeJS.Timeout;
  let latestResolve: (value: any) => void;
  let latestReject: (reason: any) => void;
  
  return ((...args: Parameters<T>) => {
    return new Promise((resolve, reject) => {
      latestResolve = resolve;
      latestReject = reject;
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const result = await operation(...args);
          latestResolve(result);
        } catch (error) {
          latestReject(error);
        }
      }, delay);
    });
  }) as T;
}

/**
 * Creates Docker labels for Claude IDE containers
 */
export function createClaudeIDELabels(additionalLabels: Record<string, string> = {}): Record<string, string> {
  return {
    'com.claude-ide.managed': 'true',
    'com.claude-ide.version': '1.0.0',
    'com.claude-ide.created': new Date().toISOString(),
    ...additionalLabels,
  };
}

/**
 * Filters containers managed by Claude IDE
 */
export function filterClaudeIDEContainers(containers: DockerContainer[]): DockerContainer[] {
  return containers.filter(container => 
    container.labels['com.claude-ide.managed'] === 'true'
  );
}

/**
 * Creates a safe container name from user input
 */
export function sanitizeContainerName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_.-]/g, '-')
    .replace(/^[^a-zA-Z0-9]/, 'container-')
    .substring(0, 63);
}

/**
 * Estimates Docker image build time based on Dockerfile complexity
 */
export function estimateBuildTime(dockerfile: string): number {
  const lines = dockerfile.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
  
  let estimatedSeconds = 30; // Base time
  
  lines.forEach(line => {
    const instruction = line.trim().split(' ')[0].toUpperCase();
    
    switch (instruction) {
      case 'FROM':
        estimatedSeconds += 60; // Base image pull
        break;
      case 'RUN':
        if (line.includes('npm install') || line.includes('yarn install')) {
          estimatedSeconds += 120; // Package installation
        } else if (line.includes('apt-get') || line.includes('yum')) {
          estimatedSeconds += 60; // System package installation
        } else {
          estimatedSeconds += 30; // General RUN command
        }
        break;
      case 'COPY':
      case 'ADD':
        estimatedSeconds += 15; // File operations
        break;
      default:
        estimatedSeconds += 5; // Other instructions
    }
  });
  
  return estimatedSeconds;
}

/**
 * Creates development-optimized Docker Compose configuration
 */
export function createDevDockerCompose(projectName: string, ports: { [service: string]: number } = {}): DockerComposeConfig {
  return {
    version: '3.8',
    services: {
      app: {
        build: {
          context: '.',
          dockerfile: 'Dockerfile.dev',
        },
        ports: [`${ports.app || 3000}:3000`],
        volumes: [
          '.:/app',
          '/app/node_modules',
          './.claude:/app/.claude',
        ],
        environment: {
          NODE_ENV: 'development',
          CHOKIDAR_USEPOLLING: 'true',
          WATCHPACK_POLLING: 'true',
          FAST_REFRESH: 'true',
        },
        restart: 'unless-stopped',
        stdin_open: true,
        tty: true,
        labels: createClaudeIDELabels({
          'com.claude-ide.service': 'app',
          'com.claude-ide.environment': 'development',
        }),
      },
      'claude-code': {
        image: 'claude-code:latest',
        ports: [`${ports['claude-code'] || 3001}:3001`],
        volumes: [
          '.:/workspace',
          '/var/run/docker.sock:/var/run/docker.sock',
        ],
        environment: {
          WORKSPACE_PATH: '/workspace',
          LOG_LEVEL: 'debug',
        },
        restart: 'unless-stopped',
        depends_on: ['app'],
        labels: createClaudeIDELabels({
          'com.claude-ide.service': 'claude-code',
          'com.claude-ide.type': 'cli',
        }),
      },
    },
    networks: {
      default: {
        driver: 'bridge',
        labels: createClaudeIDELabels(),
      },
    },
    volumes: {
      node_modules: {
        labels: createClaudeIDELabels({
          'com.claude-ide.volume': 'node_modules',
        }),
      },
    },
  };
}