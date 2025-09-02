// Docker integration types for the Claude Code IDE

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  imageId: string;
  status: DockerContainerStatus;
  state: DockerContainerState;
  created: Date;
  started?: Date;
  finished?: Date;
  ports: DockerPort[];
  volumes: DockerVolume[];
  environment: Record<string, string>;
  labels: Record<string, string>;
  networkMode: string;
  networks: DockerNetwork[];
  restartPolicy: DockerRestartPolicy;
  resources: DockerResources;
  healthcheck?: DockerHealthcheck;
  metadata: Record<string, any>;
}

export type DockerContainerStatus = 
  | 'created'
  | 'running'
  | 'paused'
  | 'restarting'
  | 'removing'
  | 'exited'
  | 'dead';

export interface DockerContainerState {
  pid?: number;
  exitCode?: number;
  error?: string;
  startedAt?: Date;
  finishedAt?: Date;
  health?: DockerHealthStatus;
  oomKilled: boolean;
  dead: boolean;
  paused: boolean;
  restarting: boolean;
  running: boolean;
}

export type DockerHealthStatus = 'healthy' | 'unhealthy' | 'starting' | 'none';

export interface DockerPort {
  privatePort: number;
  publicPort?: number;
  type: 'tcp' | 'udp';
  ip?: string;
}

export interface DockerVolume {
  name?: string;
  source: string;
  destination: string;
  driver?: string;
  mode: 'ro' | 'rw';
  rw: boolean;
  propagation: string;
}

export interface DockerNetwork {
  id: string;
  name: string;
  driver: string;
  ipAddress?: string;
  gateway?: string;
  aliases: string[];
  links: string[];
}

export interface DockerRestartPolicy {
  name: 'no' | 'always' | 'unless-stopped' | 'on-failure';
  maximumRetryCount?: number;
}

export interface DockerResources {
  cpuShares?: number;
  memory?: number;
  memorySwap?: number;
  cpuPeriod?: number;
  cpuQuota?: number;
  cpuRealtimePeriod?: number;
  cpuRealtimeRuntime?: number;
  cpus?: number;
  cpusetCpus?: string;
  cpusetMems?: string;
  ioMaximumIOps?: number;
  ioMaximumBandwidth?: number;
  blkioWeight?: number;
  blkioDeviceReadBps?: DockerDeviceRate[];
  blkioDeviceWriteBps?: DockerDeviceRate[];
  blkioDeviceReadIOps?: DockerDeviceRate[];
  blkioDeviceWriteIOps?: DockerDeviceRate[];
  ulimits?: DockerUlimit[];
}

export interface DockerDeviceRate {
  path: string;
  rate: number;
}

export interface DockerUlimit {
  name: string;
  soft: number;
  hard: number;
}

export interface DockerHealthcheck {
  test: string[];
  interval: number;
  timeout: number;
  retries: number;
  startPeriod?: number;
}

export interface DockerImage {
  id: string;
  parentId?: string;
  repoTags: string[];
  repoDigests: string[];
  created: Date;
  size: number;
  virtualSize: number;
  sharedSize?: number;
  labels: Record<string, string>;
  containers: number;
}

export interface DockerContainerStats {
  containerId: string;
  timestamp: Date;
  cpuUsage: {
    totalUsage: number;
    usageInKernelmode: number;
    usageInUsermode: number;
    systemCpuUsage: number;
    onlineCpus: number;
    throttlingData: {
      periods: number;
      throttledPeriods: number;
      throttledTime: number;
    };
  };
  memoryUsage: {
    usage: number;
    maxUsage: number;
    limit: number;
    failcnt: number;
    stats: Record<string, number>;
  };
  networkStats: Record<string, {
    rxBytes: number;
    rxPackets: number;
    rxErrors: number;
    rxDropped: number;
    txBytes: number;
    txPackets: number;
    txErrors: number;
    txDropped: number;
  }>;
  blockIOStats: {
    ioServiceBytesRecursive: DockerIOStat[];
    ioServicedRecursive: DockerIOStat[];
    ioQueueRecursive: DockerIOStat[];
    ioServiceTimeRecursive: DockerIOStat[];
    ioWaitTimeRecursive: DockerIOStat[];
    ioMergedRecursive: DockerIOStat[];
    ioTimeRecursive: DockerIOStat[];
    sectorsRecursive: DockerIOStat[];
  };
}

export interface DockerIOStat {
  major: number;
  minor: number;
  op: string;
  value: number;
}

export interface DockerLogEntry {
  containerId: string;
  timestamp: Date;
  stream: 'stdout' | 'stderr';
  content: string;
  size: number;
}

export interface DockerBuildContext {
  dockerfile?: string;
  context: string;
  buildArgs?: Record<string, string>;
  labels?: Record<string, string>;
  target?: string;
  networkMode?: string;
  extraHosts?: string[];
  squash?: boolean;
  cachefrom?: string[];
  securityOpt?: string[];
  shmSize?: number;
  ulimits?: DockerUlimit[];
  buildKit?: boolean;
  platform?: string;
}

export interface DockerBuildStep {
  step: number;
  instruction: string;
  detail: string;
  status: 'running' | 'completed' | 'error';
  progress?: number;
  timestamp: Date;
}

export interface DockerComposeService {
  name: string;
  image?: string;
  build?: {
    context: string;
    dockerfile?: string;
    args?: Record<string, string>;
  };
  ports?: string[];
  volumes?: string[];
  environment?: Record<string, string>;
  depends_on?: string[];
  restart?: string;
  networks?: string[];
  labels?: Record<string, string>;
  command?: string;
  entrypoint?: string;
  working_dir?: string;
  user?: string;
  hostname?: string;
  domainname?: string;
  mac_address?: string;
  privileged?: boolean;
  cap_add?: string[];
  cap_drop?: string[];
  security_opt?: string[];
  tmpfs?: string[];
  logging?: {
    driver: string;
    options?: Record<string, string>;
  };
  healthcheck?: {
    test: string[];
    interval?: string;
    timeout?: string;
    retries?: number;
    start_period?: string;
  };
}

export interface DockerComposeConfig {
  version: string;
  services: Record<string, DockerComposeService>;
  networks?: Record<string, {
    driver?: string;
    attachable?: boolean;
    labels?: Record<string, string>;
  }>;
  volumes?: Record<string, {
    driver?: string;
    driver_opts?: Record<string, string>;
    external?: boolean;
    labels?: Record<string, string>;
  }>;
}

export interface DockerRegistryAuth {
  username: string;
  password: string;
  email?: string;
  serveraddress: string;
}

export interface DockerContext {
  containers: DockerContainer[];
  images: DockerImage[];
  isConnected: boolean;
  version?: string;
  info?: DockerSystemInfo;
  
  // Container management
  listContainers: (all?: boolean) => Promise<DockerContainer[]>;
  getContainer: (id: string) => Promise<DockerContainer>;
  createContainer: (config: DockerContainerConfig) => Promise<DockerContainer>;
  startContainer: (id: string) => Promise<void>;
  stopContainer: (id: string, timeout?: number) => Promise<void>;
  restartContainer: (id: string, timeout?: number) => Promise<void>;
  removeContainer: (id: string, force?: boolean) => Promise<void>;
  pauseContainer: (id: string) => Promise<void>;
  unpauseContainer: (id: string) => Promise<void>;
  
  // Container operations
  execContainer: (id: string, command: string[], options?: DockerExecOptions) => Promise<DockerExecResult>;
  attachContainer: (id: string, stream: 'stdin' | 'stdout' | 'stderr') => Promise<ReadableStream>;
  getContainerLogs: (id: string, options?: DockerLogsOptions) => Promise<DockerLogEntry[]>;
  getContainerStats: (id: string, stream?: boolean) => Promise<DockerContainerStats>;
  inspectContainer: (id: string) => Promise<DockerContainerInspect>;
  
  // Image management
  listImages: (all?: boolean) => Promise<DockerImage[]>;
  buildImage: (context: DockerBuildContext, onProgress?: (step: DockerBuildStep) => void) => Promise<DockerImage>;
  pullImage: (name: string, tag?: string, onProgress?: (progress: any) => void) => Promise<DockerImage>;
  pushImage: (name: string, tag?: string, auth?: DockerRegistryAuth, onProgress?: (progress: any) => void) => Promise<void>;
  removeImage: (id: string, force?: boolean) => Promise<void>;
  tagImage: (id: string, repo: string, tag?: string) => Promise<void>;
  
  // Docker Compose operations
  composeUp: (config: DockerComposeConfig, options?: DockerComposeOptions) => Promise<void>;
  composeDown: (options?: DockerComposeOptions) => Promise<void>;
  composeRestart: (services?: string[], options?: DockerComposeOptions) => Promise<void>;
  composePs: (options?: DockerComposeOptions) => Promise<DockerContainer[]>;
  composeLogs: (services?: string[], options?: DockerComposeOptions) => Promise<DockerLogEntry[]>;
  
  // System operations
  getSystemInfo: () => Promise<DockerSystemInfo>;
  getVersion: () => Promise<DockerVersionInfo>;
  ping: () => Promise<boolean>;
  
  // Event streaming
  subscribeToEvents: (callback: (event: DockerEvent) => void) => () => void;
  subscribeToContainerLogs: (containerId: string, callback: (log: DockerLogEntry) => void) => () => void;
  subscribeToContainerStats: (containerId: string, callback: (stats: DockerContainerStats) => void) => () => void;
}

export interface DockerContainerConfig {
  name?: string;
  image: string;
  cmd?: string[];
  entrypoint?: string[];
  workingDir?: string;
  env?: string[];
  user?: string;
  labels?: Record<string, string>;
  exposedPorts?: Record<string, {}>;
  hostConfig?: {
    binds?: string[];
    links?: string[];
    portBindings?: Record<string, DockerPortBinding[]>;
    networkMode?: string;
    restartPolicy?: DockerRestartPolicy;
    privileged?: boolean;
    capAdd?: string[];
    capDrop?: string[];
    securityOpt?: string[];
    resources?: DockerResources;
  };
  networkingConfig?: {
    endpointsConfig?: Record<string, {
      aliases?: string[];
      links?: string[];
      ipv4Address?: string;
      ipv6Address?: string;
    }>;
  };
}

export interface DockerPortBinding {
  hostIp?: string;
  hostPort: string;
}

export interface DockerExecOptions {
  attachStdin?: boolean;
  attachStdout?: boolean;
  attachStderr?: boolean;
  detach?: boolean;
  tty?: boolean;
  env?: string[];
  user?: string;
  privileged?: boolean;
  workingDir?: string;
}

export interface DockerExecResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface DockerLogsOptions {
  follow?: boolean;
  stdout?: boolean;
  stderr?: boolean;
  since?: Date;
  until?: Date;
  timestamps?: boolean;
  tail?: number;
}

export interface DockerContainerInspect {
  id: string;
  created: Date;
  path: string;
  args: string[];
  state: DockerContainerState;
  image: string;
  resolvConfPath: string;
  hostnamePath: string;
  hostsPath: string;
  logPath: string;
  name: string;
  restartCount: number;
  driver: string;
  platform: string;
  mountLabel: string;
  processLabel: string;
  appArmorProfile: string;
  execIDs: string[];
  hostConfig: any;
  graphDriver: any;
  mounts: any[];
  config: any;
  networkSettings: any;
}

export interface DockerComposeOptions {
  projectName?: string;
  file?: string[];
  envFile?: string;
  projectDir?: string;
}

export interface DockerSystemInfo {
  containers: number;
  containersRunning: number;
  containersPaused: number;
  containersStopped: number;
  images: number;
  driver: string;
  dockerRootDir: string;
  driverStatus: string[][];
  systemStatus: string[][];
  plugins: {
    volume: string[];
    network: string[];
    authorization: string[];
    log: string[];
  };
  memoryLimit: boolean;
  swapLimit: boolean;
  kernelMemory: boolean;
  cpuCfsQuota: boolean;
  cpuCfsPeriod: boolean;
  cpuShares: boolean;
  cpuSetCpus: boolean;
  cpuSetMems: boolean;
  oomKillDisable: boolean;
  ipv4Forwarding: boolean;
  bridgeNfIptables: boolean;
  bridgeNfIp6tables: boolean;
  debug: boolean;
  nfd: number;
  nGoroutines: number;
  systemTime: Date;
  loggingDriver: string;
  cgroupDriver: string;
  nEventsListener: number;
  kernelVersion: string;
  operatingSystem: string;
  osType: string;
  architecture: string;
  indexServerAddress: string;
  ncpu: number;
  memTotal: number;
  genericResources: any[];
  httpProxy: string;
  httpsProxy: string;
  noProxy: string;
  name: string;
  labels: string[];
  experimentalBuild: boolean;
  serverVersion: string;
}

export interface DockerVersionInfo {
  version: string;
  apiVersion: string;
  minAPIVersion: string;
  gitCommit: string;
  goVersion: string;
  os: string;
  arch: string;
  kernelVersion: string;
  buildTime: Date;
  experimental: boolean;
}

export interface DockerEvent {
  type: 'container' | 'image' | 'volume' | 'network' | 'daemon';
  action: string;
  actor: {
    id: string;
    attributes: Record<string, string>;
  };
  scope: 'local' | 'swarm';
  time: Date;
  timeNano: number;
}