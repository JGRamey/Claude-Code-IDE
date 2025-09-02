// Constants and configuration values for the Claude Code IDE

// Application metadata
export const APP_NAME = 'Claude Code IDE';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'AI-powered Interactive Development Environment';

// API endpoints and services
export const DEFAULT_ENDPOINTS = {
  CLAUDE_CODE_CLI: 'ws://localhost:3001',
  DOCKER_API: 'http://localhost:2375',
  FILE_SYSTEM_API: 'http://localhost:3002',
  PREVIEW_SERVER: 'http://localhost:3000',
} as const;

// WebSocket event types
export const WS_EVENTS = {
  // Connection
  CONNECT: 'ws:connect',
  DISCONNECT: 'ws:disconnect',
  RECONNECT: 'ws:reconnect',
  ERROR: 'ws:error',
  
  // Claude Code CLI
  CLI_COMMAND: 'cli:command',
  CLI_RESPONSE: 'cli:response',
  CLI_OUTPUT: 'cli:output',
  CLI_ERROR: 'cli:error',
  CLI_STATUS: 'cli:status',
  
  // Agent system
  AGENT_STATUS: 'agent:status',
  AGENT_MESSAGE: 'agent:message',
  AGENT_TASK_START: 'agent:task:start',
  AGENT_TASK_UPDATE: 'agent:task:update',
  AGENT_TASK_COMPLETE: 'agent:task:complete',
  AGENT_TASK_ERROR: 'agent:task:error',
  
  // File system
  FILE_CREATED: 'fs:file:created',
  FILE_UPDATED: 'fs:file:updated',
  FILE_DELETED: 'fs:file:deleted',
  FILE_RENAMED: 'fs:file:renamed',
  DIRECTORY_CREATED: 'fs:directory:created',
  DIRECTORY_DELETED: 'fs:directory:deleted',
  
  // Chat
  CHAT_MESSAGE: 'chat:message',
  CHAT_TYPING: 'chat:typing',
  CHAT_USER_JOIN: 'chat:user:join',
  CHAT_USER_LEAVE: 'chat:user:leave',
  
  // Docker
  DOCKER_STATUS: 'docker:status',
  DOCKER_CONTAINER_START: 'docker:container:start',
  DOCKER_CONTAINER_STOP: 'docker:container:stop',
  DOCKER_CONTAINER_LOGS: 'docker:container:logs',
  DOCKER_BUILD_PROGRESS: 'docker:build:progress',
  
  // Terminal
  TERMINAL_OUTPUT: 'terminal:output',
  TERMINAL_INPUT: 'terminal:input',
  TERMINAL_CLEAR: 'terminal:clear',
  TERMINAL_RESIZE: 'terminal:resize',
  
  // Workflow
  WORKFLOW_START: 'workflow:start',
  WORKFLOW_STOP: 'workflow:stop',
  WORKFLOW_UPDATE: 'workflow:update',
  WORKFLOW_NODE_UPDATE: 'workflow:node:update',
  WORKFLOW_EDGE_UPDATE: 'workflow:edge:update',
} as const;

// File system constants
export const FILE_SYSTEM = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_OPEN: 50,
  MAX_SEARCH_RESULTS: 1000,
  DEBOUNCE_DELAY: 300,
  AUTO_SAVE_DELAY: 2000,
  WATCH_DEBOUNCE: 100,
  
  // File type groups
  TEXT_EXTENSIONS: [
    'txt', 'md', 'markdown', 'json', 'yaml', 'yml', 'xml', 'toml', 'ini', 'env',
    'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'sass', 'less',
    'py', 'java', 'php', 'rb', 'go', 'rs', 'cpp', 'c', 'cs', 'kt', 'swift',
    'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd', 'sql'
  ],
  
  BINARY_EXTENSIONS: [
    'exe', 'dll', 'so', 'dylib', 'bin', 'obj', 'o', 'a', 'lib',
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'ico', 'webp',
    'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm',
    'mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz',
    'ttf', 'otf', 'woff', 'woff2', 'eot'
  ],
  
  IGNORED_PATTERNS: [
    'node_modules/**',
    '.git/**',
    '.svn/**',
    '.hg/**',
    'dist/**',
    'build/**',
    '.next/**',
    '.nuxt/**',
    '.vuepress/**',
    'coverage/**',
    '.nyc_output/**',
    '*.log',
    '.DS_Store',
    'Thumbs.db',
    '.env.local',
    '.env.*.local'
  ],
} as const;

// Editor configuration
export const EDITOR = {
  DEFAULT_FONT_SIZE: 14,
  MIN_FONT_SIZE: 8,
  MAX_FONT_SIZE: 72,
  DEFAULT_TAB_SIZE: 2,
  DEFAULT_LINE_HEIGHT: 1.5,
  
  THEMES: {
    LIGHT: 'vs-light',
    DARK: 'vs-dark',
    HIGH_CONTRAST: 'hc-black',
  },
  
  LANGUAGES: {
    JAVASCRIPT: 'javascript',
    TYPESCRIPT: 'typescript',
    HTML: 'html',
    CSS: 'css',
    JSON: 'json',
    MARKDOWN: 'markdown',
    PYTHON: 'python',
    YAML: 'yaml',
    DOCKERFILE: 'dockerfile',
    SHELL: 'shell',
  },
  
  SHORTCUTS: {
    SAVE: 'Ctrl+S',
    SAVE_ALL: 'Ctrl+Shift+S',
    OPEN: 'Ctrl+O',
    NEW_FILE: 'Ctrl+N',
    NEW_FOLDER: 'Ctrl+Shift+N',
    CLOSE_TAB: 'Ctrl+W',
    CLOSE_ALL: 'Ctrl+Shift+W',
    FIND: 'Ctrl+F',
    FIND_REPLACE: 'Ctrl+H',
    FIND_IN_FILES: 'Ctrl+Shift+F',
    TOGGLE_SIDEBAR: 'Ctrl+B',
    TOGGLE_TERMINAL: 'Ctrl+`',
    COMMAND_PALETTE: 'Ctrl+Shift+P',
    QUICK_OPEN: 'Ctrl+P',
    ZOOM_IN: 'Ctrl+=',
    ZOOM_OUT: 'Ctrl+-',
    RESET_ZOOM: 'Ctrl+0',
    DUPLICATE_LINE: 'Ctrl+Shift+D',
    MOVE_LINE_UP: 'Alt+Up',
    MOVE_LINE_DOWN: 'Alt+Down',
    COMMENT_LINE: 'Ctrl+/',
    BLOCK_COMMENT: 'Ctrl+Shift+/',
    FORMAT_DOCUMENT: 'Shift+Alt+F',
    GO_TO_LINE: 'Ctrl+G',
    GO_TO_DEFINITION: 'F12',
    GO_TO_REFERENCES: 'Shift+F12',
    RENAME_SYMBOL: 'F2',
    SHOW_HOVER: 'Ctrl+K Ctrl+I',
  },
} as const;

// Terminal configuration
export const TERMINAL = {
  DEFAULT_SHELL: process.platform === 'win32' ? 'powershell' : 'bash',
  DEFAULT_FONT_SIZE: 14,
  DEFAULT_ROWS: 24,
  DEFAULT_COLS: 80,
  SCROLLBACK_LIMIT: 1000,
  
  COLORS: {
    BLACK: '#000000',
    RED: '#cd0000',
    GREEN: '#00cd00',
    YELLOW: '#cdcd00',
    BLUE: '#0000ee',
    MAGENTA: '#cd00cd',
    CYAN: '#00cdcd',
    WHITE: '#e5e5e5',
    BRIGHT_BLACK: '#7f7f7f',
    BRIGHT_RED: '#ff0000',
    BRIGHT_GREEN: '#00ff00',
    BRIGHT_YELLOW: '#ffff00',
    BRIGHT_BLUE: '#5c5cff',
    BRIGHT_MAGENTA: '#ff00ff',
    BRIGHT_CYAN: '#00ffff',
    BRIGHT_WHITE: '#ffffff',
  },
} as const;

// Docker configuration
export const DOCKER = {
  DEFAULT_REGISTRY: 'docker.io',
  DEFAULT_TIMEOUT: 30000,
  HEALTH_CHECK_INTERVAL: 5000,
  LOG_TAIL_LINES: 100,
  
  CONTAINER_STATES: {
    CREATED: 'created',
    RUNNING: 'running',
    PAUSED: 'paused',
    RESTARTING: 'restarting',
    REMOVING: 'removing',
    EXITED: 'exited',
    DEAD: 'dead',
  },
  
  RESTART_POLICIES: {
    NO: 'no',
    ALWAYS: 'always',
    UNLESS_STOPPED: 'unless-stopped',
    ON_FAILURE: 'on-failure',
  },
} as const;

// Agent system configuration
export const AGENTS = {
  MAX_CONCURRENT_TASKS: 5,
  DEFAULT_TIMEOUT: 300000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,
  HEARTBEAT_INTERVAL: 30000,
  METRICS_UPDATE_INTERVAL: 10000,
  
  TYPES: {
    ORCHESTRATOR: 'orchestrator',
    FRONTEND_ARCHITECT: 'frontend-architect',
    BACKEND_ARCHITECT: 'backend-architect',
    DATABASE_SPECIALIST: 'database-specialist',
    DEVOPS_SPECIALIST: 'devops-specialist',
    UI_UX: 'ui-ux',
    TEST_ARCHITECT: 'test-architect',
    DOCUMENTOR: 'documentor',
    EVALUATOR: 'evaluator',
    STRUCTURE_UPDATER: 'structure-updater',
  },
  
  CAPABILITIES: {
    CODE_GENERATION: 'code-generation',
    CODE_REVIEW: 'code-review',
    TESTING: 'testing',
    DOCUMENTATION: 'documentation',
    DEPLOYMENT: 'deployment',
    MONITORING: 'monitoring',
    OPTIMIZATION: 'optimization',
    DEBUGGING: 'debugging',
    ARCHITECTURE_DESIGN: 'architecture-design',
    UI_DESIGN: 'ui-design',
    DATABASE_DESIGN: 'database-design',
    API_DESIGN: 'api-design',
    WORKFLOW_MANAGEMENT: 'workflow-management',
  },
  
  PRIORITIES: {
    LOW: 1,
    MEDIUM: 5,
    HIGH: 8,
    CRITICAL: 10,
  },
} as const;

// Chat system configuration
export const CHAT = {
  MAX_MESSAGE_LENGTH: 32000,
  MAX_ATTACHMENTS_PER_MESSAGE: 10,
  MAX_ATTACHMENT_SIZE: 25 * 1024 * 1024, // 25MB
  TYPING_TIMEOUT: 5000,
  MESSAGE_BATCH_SIZE: 50,
  AUTO_SCROLL_THRESHOLD: 100,
  
  MESSAGE_TYPES: {
    TEXT: 'text',
    CODE: 'code',
    FILE: 'file',
    IMAGE: 'image',
    SYSTEM: 'system',
    COMMAND: 'command',
    ERROR: 'error',
    SUCCESS: 'success',
    WARNING: 'warning',
    INFO: 'info',
  },
  
  ROLES: {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system',
    AGENT: 'agent',
  },
  
  QUICK_ACTIONS: [
    {
      id: 'explain-code',
      label: 'Explain Code',
      icon: '💡',
      shortcut: 'Ctrl+Shift+E',
      description: 'Explain the selected code'
    },
    {
      id: 'optimize-code',
      label: 'Optimize',
      icon: '⚡',
      shortcut: 'Ctrl+Shift+O',
      description: 'Optimize the selected code'
    },
    {
      id: 'add-tests',
      label: 'Add Tests',
      icon: '🧪',
      shortcut: 'Ctrl+Shift+T',
      description: 'Generate tests for the selected code'
    },
    {
      id: 'add-docs',
      label: 'Add Documentation',
      icon: '📝',
      shortcut: 'Ctrl+Shift+D',
      description: 'Generate documentation for the selected code'
    },
    {
      id: 'refactor',
      label: 'Refactor',
      icon: '🔧',
      shortcut: 'Ctrl+Shift+R',
      description: 'Refactor the selected code'
    },
    {
      id: 'debug',
      label: 'Debug',
      icon: '🐛',
      shortcut: 'Ctrl+Shift+B',
      description: 'Help debug the selected code'
    }
  ],
} as const;

// UI layout configuration
export const LAYOUT = {
  SIDEBAR_MIN_WIDTH: 200,
  SIDEBAR_MAX_WIDTH: 600,
  SIDEBAR_DEFAULT_WIDTH: 300,
  
  PANEL_MIN_HEIGHT: 100,
  PANEL_MAX_HEIGHT: 800,
  PANEL_DEFAULT_HEIGHT: 300,
  
  HEADER_HEIGHT: 60,
  TAB_HEIGHT: 40,
  STATUS_BAR_HEIGHT: 24,
  
  ANIMATION_DURATION: 200,
  RESIZE_DEBOUNCE: 100,
  
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536,
  },
  
  Z_INDEX: {
    DROPDOWN: 1000,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    TOOLTIP: 1070,
    CONTEXT_MENU: 1080,
    TOAST: 1090,
  },
} as const;

// Theme configuration
export const THEMES = {
  LIGHT: {
    id: 'light',
    name: 'Light',
    type: 'light' as const,
    colors: {
      primary: '#0066cc',
      secondary: '#6c757d',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#212529',
      textSecondary: '#6c757d',
      border: '#dee2e6',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8',
    },
    shadows: {
      small: '0 1px 3px rgba(0, 0, 0, 0.12)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.15)',
      large: '0 10px 25px rgba(0, 0, 0, 0.19)',
    },
    borderRadius: {
      small: 4,
      medium: 6,
      large: 8,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    typography: {
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
    },
  },
  
  DARK: {
    id: 'dark',
    name: 'Dark',
    type: 'dark' as const,
    colors: {
      primary: '#0084ff',
      secondary: '#8e9297',
      background: '#1a1a1a',
      surface: '#2d2d2d',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      border: '#404040',
      success: '#00d26a',
      warning: '#ffb020',
      error: '#ff453a',
      info: '#00c7be',
    },
    shadows: {
      small: '0 1px 3px rgba(0, 0, 0, 0.3)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.4)',
      large: '0 10px 25px rgba(0, 0, 0, 0.5)',
    },
    borderRadius: {
      small: 4,
      medium: 6,
      large: 8,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    typography: {
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
    },
  },
} as const;

// Workflow configuration
export const WORKFLOW = {
  NODE_MIN_WIDTH: 120,
  NODE_MIN_HEIGHT: 60,
  NODE_DEFAULT_WIDTH: 200,
  NODE_DEFAULT_HEIGHT: 100,
  
  GRID_SIZE: 20,
  SNAP_THRESHOLD: 10,
  
  COLORS: {
    ORCHESTRATOR: '#8b5cf6',
    FRONTEND_ARCHITECT: '#06b6d4',
    BACKEND_ARCHITECT: '#10b981',
    DATABASE_SPECIALIST: '#f59e0b',
    DEVOPS_SPECIALIST: '#ef4444',
    UI_UX: '#ec4899',
    TEST_ARCHITECT: '#84cc16',
    DOCUMENTOR: '#6366f1',
    EVALUATOR: '#f97316',
    STRUCTURE_UPDATER: '#64748b',
  },
  
  EDGE_TYPES: {
    DEFAULT: 'default',
    STRAIGHT: 'straight',
    STEP: 'step',
    SMOOTH_STEP: 'smoothstep',
    BEZIER: 'bezier',
  },
  
  ANIMATION_DURATION: 300,
  MINIMAP_SCALE: 0.2,
} as const;

// Performance configuration
export const PERFORMANCE = {
  VIRTUAL_SCROLL_THRESHOLD: 100,
  DEBOUNCE_SEARCH: 300,
  DEBOUNCE_RESIZE: 100,
  THROTTLE_SCROLL: 16, // 60fps
  CACHE_TTL: 300000, // 5 minutes
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  
  CHUNK_SIZE: {
    FILE_CONTENT: 1024 * 1024, // 1MB chunks
    LOG_ENTRIES: 1000,
    SEARCH_RESULTS: 100,
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  FILE_NOT_FOUND: 'File not found',
  DIRECTORY_NOT_FOUND: 'Directory not found',
  PERMISSION_DENIED: 'Permission denied',
  FILE_EXISTS: 'File already exists',
  DIRECTORY_EXISTS: 'Directory already exists',
  INVALID_PATH: 'Invalid file path',
  OPERATION_FAILED: 'Operation failed',
  WATCH_ERROR: 'File watching error',
  
  NETWORK_ERROR: 'Network connection error',
  TIMEOUT_ERROR: 'Operation timed out',
  VALIDATION_ERROR: 'Validation error',
  AUTHENTICATION_ERROR: 'Authentication failed',
  AUTHORIZATION_ERROR: 'Access denied',
  
  DOCKER_NOT_RUNNING: 'Docker is not running',
  DOCKER_CONNECTION_ERROR: 'Cannot connect to Docker',
  CONTAINER_NOT_FOUND: 'Container not found',
  IMAGE_NOT_FOUND: 'Image not found',
  
  CLAUDE_CODE_NOT_AVAILABLE: 'Claude Code CLI is not available',
  AGENT_NOT_RESPONDING: 'Agent is not responding',
  WORKFLOW_EXECUTION_FAILED: 'Workflow execution failed',
  
  UNSUPPORTED_FILE_TYPE: 'Unsupported file type',
  FILE_TOO_LARGE: 'File is too large',
  QUOTA_EXCEEDED: 'Storage quota exceeded',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  FILE_CREATED: 'File created successfully',
  FILE_UPDATED: 'File saved successfully',
  FILE_DELETED: 'File deleted successfully',
  FILE_RENAMED: 'File renamed successfully',
  FILE_COPIED: 'File copied successfully',
  FILE_MOVED: 'File moved successfully',
  
  DIRECTORY_CREATED: 'Directory created successfully',
  DIRECTORY_DELETED: 'Directory deleted successfully',
  
  CONTAINER_STARTED: 'Container started successfully',
  CONTAINER_STOPPED: 'Container stopped successfully',
  
  WORKFLOW_EXECUTED: 'Workflow executed successfully',
  TASK_COMPLETED: 'Task completed successfully',
  
  SETTINGS_SAVED: 'Settings saved successfully',
  PROJECT_OPENED: 'Project opened successfully',
} as const;

// Regular expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  IPV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  PORT: /^(?:[1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  SEMVER: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
  DOCKER_IMAGE: /^(?:(?=[^:\/]{1,253})(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(?:\.(?!-)[a-zA-Z0-9-]{1,63}(?<!-))*(?::[0-9]{1,5})?\/)?[a-z0-9]+(?:(?:(?:[._]|__|[-]*)[a-z0-9]+)+)?(?:(?:\/[a-z0-9]+(?:(?:(?:[._]|__|[-]*)[a-z0-9]+)+)?)+)?(?::[a-zA-Z0-9_][a-zA-Z0-9._-]{0,127})?$/,
  CONTAINER_NAME: /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'claude-ide:preferences',
  WORKSPACE_STATE: 'claude-ide:workspace',
  OPEN_FILES: 'claude-ide:open-files',
  WINDOW_STATE: 'claude-ide:window-state',
  RECENT_WORKSPACES: 'claude-ide:recent-workspaces',
  CHAT_HISTORY: 'claude-ide:chat-history',
  AGENT_CONFIGS: 'claude-ide:agent-configs',
  WORKFLOW_TEMPLATES: 'claude-ide:workflow-templates',
  CUSTOM_SHORTCUTS: 'claude-ide:custom-shortcuts',
  THEME_SETTINGS: 'claude-ide:theme-settings',
} as const;

// Feature flags
export const FEATURES = {
  ENABLE_BETA_FEATURES: false,
  ENABLE_TELEMETRY: true,
  ENABLE_ERROR_REPORTING: true,
  ENABLE_AUTO_UPDATES: true,
  ENABLE_COLLABORATION: false,
  ENABLE_CLOUD_SYNC: false,
  ENABLE_AI_SUGGESTIONS: true,
  ENABLE_CODE_INTELLIGENCE: true,
  ENABLE_VISUAL_DEBUGGING: false,
  ENABLE_PERFORMANCE_PROFILING: false,
} as const;

// Development configuration
export const DEV = {
  ENABLE_DEV_TOOLS: process.env.NODE_ENV === 'development',
  ENABLE_HOT_RELOAD: process.env.NODE_ENV === 'development',
  SHOW_PERFORMANCE_METRICS: process.env.NODE_ENV === 'development',
  ENABLE_DEBUG_MODE: process.env.NODE_ENV === 'development',
  LOG_LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  
  MOCK_DELAYS: {
    FILE_OPERATIONS: 100,
    DOCKER_OPERATIONS: 500,
    AGENT_RESPONSES: 1000,
    NETWORK_REQUESTS: 200,
  },
} as const;

// Security configuration
export const SECURITY = {
  ALLOWED_ORIGINS: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  CSRF_TOKEN_LENGTH: 32,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  CONTENT_SECURITY_POLICY: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'", 'ws:', 'wss:'],
    'font-src': ["'self'", 'data:'],
  },
} as const;

// Monitoring and analytics
export const ANALYTICS = {
  TRACK_USER_ACTIONS: true,
  TRACK_PERFORMANCE: true,
  TRACK_ERRORS: true,
  BATCH_SIZE: 10,
  FLUSH_INTERVAL: 30000, // 30 seconds
  
  EVENTS: {
    FILE_OPENED: 'file_opened',
    FILE_CREATED: 'file_created',
    FILE_EDITED: 'file_edited',
    FILE_SAVED: 'file_saved',
    COMMAND_EXECUTED: 'command_executed',
    AGENT_TASK_STARTED: 'agent_task_started',
    WORKFLOW_EXECUTED: 'workflow_executed',
    ERROR_OCCURRED: 'error_occurred',
    PERFORMANCE_METRIC: 'performance_metric',
  },
} as const;

// Default configurations for various components
export const DEFAULTS = {
  USER_PREFERENCES: {
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: true,
    showLineNumbers: true,
    showMinimap: true,
    autoSave: true,
    autoSaveDelay: 2000,
    showWhitespace: false,
    showInvisibles: false,
    highlightCurrentLine: true,
    enableVim: false,
    enableEmmet: true,
    formatOnSave: true,
    formatOnPaste: false,
    trimTrailingWhitespace: true,
    insertFinalNewline: true,
  },
  
  DOCKER_COMPOSE: {
    version: '3.8',
    services: {
      app: {
        build: '.',
        ports: ['3000:3000'],
        volumes: ['.:/app', '/app/node_modules'],
        environment: {
          NODE_ENV: 'development',
        },
        restart: 'unless-stopped',
      },
    },
  },
  
  VITE_CONFIG: {
    server: {
      port: 3000,
      host: true,
      hmr: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            utils: ['lodash', 'date-fns'],
          },
        },
      },
    },
    plugins: ['@vitejs/plugin-react'],
  },
} as const;

// Export all constants as a single object for convenience
export const CONSTANTS = {
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  DEFAULT_ENDPOINTS,
  WS_EVENTS,
  FILE_SYSTEM,
  EDITOR,
  TERMINAL,
  DOCKER,
  AGENTS,
  CHAT,
  LAYOUT,
  THEMES,
  PERFORMANCE,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REGEX,
  STORAGE_KEYS,
  FEATURES,
  DEV,
  SECURITY,
  ANALYTICS,
  DEFAULTS,
} as const;

export default CONSTANTS;