claude-code-ide/
├── src/
│   ├── core/                 # Essential IDE functionality
│   │   ├── editor/           # Monaco Editor wrapper
│   │   ├── filesystem/       # File operations
│   │   ├── terminal/         # Terminal emulator
│   │   └── websocket/        # Real-time communication
│   ├── features/             # Feature modules
│   │   ├── chat/            # Claude Code chat interface
│   │   ├── preview/         # Live preview
│   │   ├── explorer/        # File explorer
│   │   └── workflow/        # Agent workflow visualization
│   ├── shared/              # Shared utilities
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── stores/         # Zustand stores
│   │   └── types/          # TypeScript definitions
│   ├── layout/             # Layout components
│   │   ├── Shell.tsx       # Main application shell
│   │   ├── Sidebar.tsx     # Collapsible sidebar
│   │   └── Panels.tsx      # Resizable panels
│   └── app.tsx             # Application entry point
├── claude-code/            # Claude Code CLI configuration
│   ├── config.js          # CLI configuration
│   ├── agents.json        # Agent definitions (read-only)
│   └── workspace/         # Working directory
├── docker/                # Docker configuration
│   ├── Dockerfile.dev     # Development container
│   └── docker-compose.yml # Service orchestration
├── scripts/               # Build and setup scripts
│   ├── setup.sh          # Initial setup
│   └── start.sh          # Start all services
└── config/               # Configuration files
    ├── vite.config.ts    # Vite configuration
    ├── tsconfig.json     # TypeScript configuration
    └── tailwind.config.js # Tailwind CSS