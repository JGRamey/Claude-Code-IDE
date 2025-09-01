# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-TypeScript IDE built with Vite that integrates with Claude Code CLI. It provides a full development environment with file exploration, code editing with Monaco Editor, live preview, terminal, workflow management, and AI-powered chat functionality.

## Key Commands

### Development
```bash
# Start full development environment (recommended)
npm run start:full

# Individual services
npm run dev              # Start Vite dev server (port 3000)
npm run claude:dev       # Start Claude Code CLI with Docker integration
npm run docker:up        # Start Docker containers

# Setup from scratch
npm run setup            # Install deps, init Claude Code, build Docker
```

### Build & Quality
```bash
npm run build            # TypeScript compilation + Vite build
npm run lint             # ESLint with TypeScript extensions
npm run type-check       # TypeScript type checking without emit
npm run preview          # Preview production build (port 4173)
```

### Docker Operations
```bash
npm run docker:build    # Build Docker containers
npm run docker:up       # Start containers in background
npm run docker:down     # Stop and remove containers
```

## Architecture

### Core Structure
- **React 18 + TypeScript** with strict mode enabled
- **Vite** for bundling with path aliases (@, @components, @hooks, etc.)
- **Zustand** for state management across components
- **Monaco Editor** integration for code editing
- **Docker + WebSocket** for real-time communication

### Component Architecture
- **App.tsx**: Main layout with tab system (editor, preview, workflow, terminal)
- **Layout components**: Header, SplitPanel for resizable interfaces
- **FileExplorer**: VS Code-style file tree with context menus
- **CodeEditor**: Monaco editor with file tabs and toolbar
- **PreviewPanel**: Live preview with device simulation
- **ChatPanel**: Claude Code CLI integration with agent activity
- **WorkflowEditor**: Visual agent orchestration interface
- **AgentStatus**: Real-time agent monitoring overlay

### State Management (Zustand)
- **useAppStore**: Main app state (activeTab, selectedFile, isRunning)
- **agentStore**: Agent status and activity tracking
- **fileStore**: File system state and operations
- **settingsStore**: IDE configuration and preferences
- **workflowStore**: Agent workflow definitions

### Services Layer
- **claudeCodeCLI.ts**: Claude Code CLI communication
- **dockerService.ts**: Docker container management and metrics
- **fileService.ts**: File system operations with watching
- **websocketService.ts**: Real-time communication
- **workflowService.ts**: Agent workflow execution

### Key Integrations
- **Monaco Editor**: Full VS Code editor with TypeScript support
- **Docker API**: Container monitoring via dockerode
- **Claude Code CLI**: AI assistant integration
- **WebSocket**: Real-time updates on port 3001
- **File Watching**: chokidar for live file system monitoring

## Development Patterns

### Path Aliases
- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`
- `@hooks/*`, `@services/*`, `@types/*`, `@utils/*`, `@stores/*`

### TypeScript Configuration
- Strict mode with comprehensive type checking
- Path mapping for clean imports
- Declaration files generated for better IDE support

### Component Conventions
- Index files for clean exports from component directories
- Separation of UI components from business logic
- Custom hooks for reusable stateful logic
- Services as singleton classes for external API communication

### Development Environment
- Hot Module Replacement on port 3000
- WebSocket proxy for Claude Code CLI
- Docker API proxy for container management
- File watching with polling for Docker volumes

## Testing & Quality

Run linting and type checking before commits:
```bash
npm run lint && npm run type-check
```

Build process includes:
- TypeScript compilation with strict checks
- Bundle optimization with vendor chunking
- Source maps for debugging
- Chunk size warnings at 1000kb

## Docker Integration

The IDE runs in a containerized environment:
- Main app on port 3000
- WebSocket/HMR on port 3001
- Preview server on port 8080
- Docker API access on port 2376

File watching uses polling for Docker volume compatibility.