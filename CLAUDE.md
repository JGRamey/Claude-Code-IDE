# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a planned React-TypeScript IDE that will integrate with Claude Code CLI. The project is currently in the planning/infrastructure phase with Docker configuration and shell scripts set up, but the actual React application has not been implemented yet.

**Current State**: Configuration and infrastructure files exist, but source code implementation is pending.

## Key Commands

### Setup & Development
```bash
# Complete environment setup (run first)
./scripts/setup.sh          # Full environment setup with prerequisites check

# Development operations  
./scripts/dev.sh             # Start development environment (empty file currently)
./scripts/build.sh           # Build scripts (empty file currently)

# Docker operations
docker-compose -f docker/docker-compose.dev.yml up     # Start development containers
docker-compose -f docker/docker-compose.dev.yml down   # Stop containers
docker-compose -f docker/docker-compose.yml up         # Production containers
```

### Setup Script Details
The `scripts/setup.sh` script handles:
- Prerequisites validation (Node.js 18+, npm, Docker)
- Claude Code CLI installation
- Environment file creation
- Docker image building
- Database setup (PostgreSQL, Redis)
- Project directory creation

## Planned Architecture

### Target Technology Stack
- **React 18 + TypeScript** with strict mode (to be implemented)
- **Vite** for bundling with path aliases (to be configured)
- **Zustand** for state management (to be implemented)
- **Monaco Editor** integration for code editing (to be implemented)
- **Docker + WebSocket** for real-time communication (Docker configured)

### Infrastructure (Existing)
- **Docker Environment**: Multi-service setup with PostgreSQL and Redis
- **Claude Code CLI Integration**: Configuration files in place
- **Environment Configuration**: Template and setup automation
- **Shell Scripts**: Automated setup and deployment scripts

### Planned Components (To Be Implemented)
- **App.tsx**: Main layout with tab system
- **FileExplorer**: VS Code-style file tree
- **CodeEditor**: Monaco editor wrapper
- **PreviewPanel**: Live preview with device simulation
- **ChatPanel**: Claude Code CLI integration
- **WorkflowEditor**: Visual agent orchestration
- **Terminal**: Integrated terminal interface

## Development Rules & Standards

**CRITICAL**: This project follows strict development rules defined in `docs/development/dev_rules.md`. All Claude Code agents MUST adhere to these rules:

### Mandatory TDD (Test-Driven Development)
- **RED → GREEN → REFACTOR** cycle is required
- Write failing tests BEFORE implementation
- Minimum 80% test coverage (100% for critical paths)
- Use the test template structure provided in dev_rules.md

### Code Quality Requirements
- **File size limits**: Components (200 lines), Services (300 lines), Tests (500 lines)
- **Function complexity**: Maximum cyclomatic complexity of 5
- **Documentation**: JSDoc required for all public functions
- **Comments**: Extensive commenting requirements (see dev_rules.md for details)

### Context7 Integration
- **MANDATORY**: Use Context7 for all code generation
- Query Context7 before writing any new code
- Follow Context7 patterns and best practices

### Architecture Rules
- **Modular design**: Single responsibility principle
- **No circular dependencies**: Modules communicate via events, stores, or props
- **Clean naming**: PascalCase components, camelCase hooks, SCREAMING_SNAKE_CASE constants

### Error Handling & Performance
- **Error boundaries** required for all modules
- **Try-catch** required for all async operations
- **Performance budgets**: Initial load < 3s, File operations < 100ms
- **Memory management**: Clean up all resources in useEffect

### Security & Validation
- **Input validation** required for all user inputs
- **Secure communication**: WSS, authentication tokens, rate limiting
- **No sensitive data** in code or commits

## Docker Integration

Current Docker setup includes:
- **PostgreSQL**: Database on standard port
- **Redis**: Caching and session storage  
- **Development environment**: Hot reload support
- **Production builds**: Multi-stage Docker configuration

Port configuration (from setup script):
- Main app: 3000
- WebSocket: 3001  
- Preview: 8080
- Docker API: 2376

## Implementation Status

**Next Steps for Development**:
1. Initialize package.json with proper dependencies
2. Set up Vite configuration with path aliases
3. Implement TDD workflow following dev_rules.md
4. Create base React application structure
5. Integrate Monaco Editor with TypeScript support
6. Implement Zustand stores for state management

**Important**: Before implementing ANY feature, read and follow the comprehensive development rules in `docs/development/dev_rules.md`. These rules are non-negotiable and must be followed by all agents.