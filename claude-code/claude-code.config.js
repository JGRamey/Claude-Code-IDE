/**
 * Claude Code IDE Configuration
 * Defines how Claude Code CLI integrates with the IDE environment
 */

module.exports = {
  // Project configuration
  project: {
    name: 'Claude Code IDE',
    type: 'react-typescript',
    framework: 'vite',
    version: '1.0.0',
    description: 'Interactive development environment with AI assistance'
  },

  // Workspace settings
  workspace: {
    rootPath: process.cwd(),
    srcPath: './src',
    buildPath: './dist',
    publicPath: './public',
    configPath: './claude-code',
    
    // File watching patterns
    watchPatterns: [
      'src/**/*.{ts,tsx,js,jsx,css,scss,json}',
      'public/**/*',
      'package.json',
      'tsconfig.json',
      'tailwind.config.js'
    ],
    
    // Ignore patterns
    ignorePatterns: [
      'node_modules/**',
      'dist/**',
      '.git/**',
      '*.log',
      '.env.local'
    ]
  },

  // Agent configuration
  agents: {
    // Frontend Agent - React/TypeScript specialist
    frontend: {
      enabled: true,
      autoActivate: true,
      priority: 'high',
      capabilities: [
        'react',
        'typescript',
        'jsx',
        'css',
        'tailwindcss',
        'component-design',
        'state-management',
        'routing',
        'ui-optimization'
      ],
      config: {
        livePreview: true,
        autoFormat: true,
        componentLibrary: 'tailwindcss',
        stateManagement: 'zustand',
        typeChecking: true,
        linting: true,
        a11y: true
      },
      filePatterns: [
        '**/*.tsx',
        '**/*.jsx',
        '**/*.css',
        '**/*.scss',
        '**/components/**/*'
      ]
    },

    // Backend Agent - Server and API specialist
    backend: {
      enabled: true,
      autoActivate: false,
      priority: 'medium',
      capabilities: [
        'node.js',
        'express',
        'fastify',
        'api-design',
        'database',
        'authentication',
        'middleware',
        'error-handling',
        'validation'
      ],
      config: {
        apiDocumentation: true,
        autoTest: true,
        errorHandling: 'comprehensive',
        validation: 'joi',
        authentication: 'jwt'
      },
      filePatterns: [
        '**/api/**/*',
        '**/server/**/*',
        '**/routes/**/*',
        '**/middleware/**/*',
        '**/*.server.ts'
      ]
    },

    // Database Agent - Data management specialist
    database: {
      enabled: false,
      autoActivate: false,
      priority: 'medium',
      capabilities: [
        'sql',
        'postgresql',
        'mongodb',
        'prisma',
        'migrations',
        'schema-design',
        'query-optimization',
        'data-modeling'
      ],
      config: {
        orm: 'prisma',
        migrations: true,
        seeding: true,
        indexing: 'auto'
      },
      filePatterns: [
        '**/database/**/*',
        '**/models/**/*',
        '**/migrations/**/*',
        '**/*.sql',
        'prisma/**/*'
      ]
    },

    // Testing Agent - Quality assurance specialist
    testing: {
      enabled: true,
      autoActivate: false,
      priority: 'low',
      capabilities: [
        'jest',
        'vitest',
        'cypress',
        'playwright',
        'unit-testing',
        'integration-testing',
        'e2e-testing',
        'test-automation',
        'coverage-analysis'
      ],
      config: {
        framework: 'vitest',
        coverage: 80,
        autoRun: false,
        e2eFramework: 'playwright',
        parallelization: true
      },
      filePatterns: [
        '**/*.test.{ts,tsx,js,jsx}',
        '**/*.spec.{ts,tsx,js,jsx}',
        '**/tests/**/*',
        '**/e2e/**/*'
      ]
    },

    // Deployment Agent - CI/CD and infrastructure specialist
    deployment: {
      enabled: true,
      autoActivate: false,
      priority: 'low',
      capabilities: [
        'docker',
        'docker-compose',
        'kubernetes',
        'ci-cd',
        'github-actions',
        'aws',
        'vercel',
        'nginx',
        'optimization'
      ],
      config: {
        provider: 'docker',
        autoTrigger: false,
        optimization: true,
        caching: true,
        monitoring: true
      },
      filePatterns: [
        'Dockerfile*',
        'docker-compose*.yml',
        '.github/workflows/**/*',
        'k8s/**/*',
        'deploy/**/*'
      ]
    }
  },

  // Workflow configuration
  workflows: {
    // Default workflow for new features
    feature_development: {
      name: 'Feature Development',
      description: 'Standard workflow for developing new features',
      steps: [
        { agent: 'frontend', action: 'analyze_request', parallel: false },
        { agent: 'frontend', action: 'create_components', parallel: true },
        { agent: 'backend', action: 'create_api_endpoints', parallel: true },
        { agent: 'testing', action: 'write_tests', parallel: false },
        { agent: 'deployment', action: 'update_docker_config', parallel: false }
      ],
      conditions: {
        auto_execute: false,
        requires_approval: true,
        max_parallel_agents: 2
      }
    },

    // Bug fix workflow
    bug_fix: {
      name: 'Bug Fix',
      description: 'Workflow for identifying and fixing bugs',
      steps: [
        { agent: 'testing', action: 'analyze_issue', parallel: false },
        { agent: 'frontend', action: 'identify_frontend_issues', parallel: true },
        { agent: 'backend', action: 'identify_backend_issues', parallel: true },
        { agent: 'testing', action: 'create_reproduction_tests', parallel: false },
        { agent: 'frontend', action: 'implement_fixes', parallel: true },
        { agent: 'backend', action: 'implement_fixes', parallel: true },
        { agent: 'testing', action: 'verify_fixes', parallel: false }
      ],
      conditions: {
        auto_execute: true,
        requires_approval: false,
        max_parallel_agents: 3
      }
    },

    // Optimization workflow
    performance_optimization: {
      name: 'Performance Optimization',
      description: 'Workflow for optimizing application performance',
      steps: [
        { agent: 'frontend', action: 'analyze_bundle_size', parallel: true },
        { agent: 'backend', action: 'analyze_api_performance', parallel: true },
        { agent: 'database', action: 'analyze_query_performance', parallel: true },
        { agent: 'frontend', action: 'optimize_components', parallel: false },
        { agent: 'backend', action: 'optimize_endpoints', parallel: false },
        { agent: 'deployment', action: 'optimize_docker_config', parallel: false },
        { agent: 'testing', action: 'performance_testing', parallel: false }
      ],
      conditions: {
        auto_execute: false,
        requires_approval: true,
        max_parallel_agents: 2
      }
    }
  },

  // Docker integration
  docker: {
    enabled: true,
    autoStart: true,
    config: {
      composeFile: './docker/docker-compose.dev.yml',
      serviceName: 'claude-code-ide',
      ports: {
        app: 3000,
        websocket: 3001,
        preview: 8080
      },
      volumes: {
        source: './src',
        public: './public',
        config: './claude-code'
      },
      environment: {
        NODE_ENV: 'development',
        CLAUDE_CODE_MODE: 'watch',
        HOT_RELOAD: 'true'
      }
    }
  },

  // WebSocket server configuration
  websocket: {
    enabled: true,
    port: 3001,
    host: '0.0.0.0',
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true
    },
    events: {
      agent_activity: true,
      file_operations: true,
      docker_status: true,
      workflow_updates: true,
      system_notifications: true
    }
  },

  // Development server configuration
  development: {
    server: {
      port: 3000,
      host: '0.0.0.0',
      open: false,  // Don't auto-open browser
      cors: true,
      hmr: {
        port: 3001,
        host: 'localhost'
      }
    },
    
    // File watching configuration
    watcher: {
      usePolling: true,
      interval: 1000,
      binaryInterval: 3000,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/.claude-code/cache/**'
      ]
    },

    // Auto-reload configuration
    autoReload: {
      enabled: true,
      delay: 500,
      includeCSS: true,
      includeJS: true
    }
  },

  // Logging configuration
  logging: {
    level: 'info',
    file: './logs/claude-code.log',
    console: true,
    format: 'json',
    maxFiles: 5,
    maxSize: '10MB'
  },

  // Security settings
  security: {
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080'
    ],
    maxRequestSize: '50MB',
    rateLimiting: {
      enabled: true,
      maxRequests: 100,
      windowMs: 60000
    }
  },

  // Performance settings
  performance: {
    maxConcurrentAgents: 3,
    timeoutMs: 30000,
    memoryLimit: '2GB',
    cpuLimit: '2',
    caching: {
      enabled: true,
      ttl: 3600,
      maxSize: '1GB'
    }
  },

  // Integration settings
  integrations: {
    vscode: {
      enabled: true,
      settingsSync: true,
      extensionRecommendations: [
        'ms-vscode.vscode-typescript-next',
        'bradlc.vscode-tailwindcss',
        'esbenp.prettier-vscode',
        'ms-vscode.vscode-eslint'
      ]
    },
    
    git: {
      enabled: true,
      autoCommit: false,
      commitMessageTemplate: 'feat: {description} [claude-code]',
      hooks: {
        preCommit: ['npm run lint', 'npm run type-check'],
        prePush: ['npm run test']
      }
    }
  },

  // Custom commands
  commands: {
    'create-component': {
      description: 'Create a new React component',
      agent: 'frontend',
      template: 'react-component',
      prompts: [
        { name: 'componentName', type: 'string', required: true },
        { name: 'withProps', type: 'boolean', default: true },
        { name: 'withState', type: 'boolean', default: false }
      ]
    },
    
    'create-api': {
      description: 'Create a new API endpoint',
      agent: 'backend',
      template: 'express-endpoint',
      prompts: [
        { name: 'endpointPath', type: 'string', required: true },
        { name: 'method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'GET' },
        { name: 'withAuth', type: 'boolean', default: true }
      ]
    },
    
    'add-tests': {
      description: 'Add tests for existing code',
      agent: 'testing',
      template: 'test-suite',
      prompts: [
        { name: 'testType', type: 'select', options: ['unit', 'integration', 'e2e'], default: 'unit' },
        { name: 'coverage', type: 'number', default: 80 }
      ]
    },
    
    'optimize-bundle': {
      description: 'Optimize application bundle',
      agent: 'deployment',
      workflow: 'performance_optimization',
      prompts: [
        { name: 'target', type: 'select', options: ['size', 'speed', 'both'], default: 'both' }
      ]
    }
  },

  // Error handling
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 1000,
    fallbackToManual: true,
    logErrors: true,
    notifyUser: true
  },

  // Extensions
  extensions: {
    // Custom agent extensions
    customAgents: [],
    
    // Workflow extensions
    customWorkflows: [],
    
    // Command extensions
    customCommands: []
  }
};