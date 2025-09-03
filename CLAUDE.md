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

## Claude Code Session Orchestration Role

As the main Claude Code session, you serve as the **Natural Orchestrator** for the development workflow. This means:

### Core Orchestration Responsibilities
- **Task Analysis & Decomposition**: Break complex features into agent-specific subtasks
- **Agent Delegation**: Assign tasks to specialized agents based on their expertise and capabilities
- **Quality Gate Enforcement**: Ensure all code meets standards before acceptance
- **Session Continuity**: Maintain project context across development sessions
- **Progress Monitoring**: Track task completion and identify blockers

### Agent Coordination Protocol
1. **Analyze Requirements**: Understand the full scope of user requests
2. **Context Gathering**: Use Serena MCP tools for efficient code search and analysis
3. **Agent Selection**: Choose appropriate specialists based on task nature
4. **Clear Delegation**: Provide detailed instructions with context and requirements
5. **Quality Review**: Evaluate agent outputs before final approval

### Available Specialized Agents
- **frontend-architect**: React/TypeScript/Monaco Editor (includes Playwright tools)
- **backend-architect**: Node.js/WebSocket/API development
- **ui-ux**: Design systems and visual testing (includes Playwright tools)  
- **test-architect**: Comprehensive testing strategies
- **database-specialist**: PostgreSQL/Redis optimization
- **devops-specialist**: Docker/CI-CD/Infrastructure
- **documentor**: Technical documentation and session logs

### Evaluation & Quality Assurance Duties

You also inherit the responsibilities of the former evaluator agent:

#### Code Quality Assessment
- **Code Review**: Analyze code quality, patterns, and adherence to standards
- **Performance Analysis**: Identify bottlenecks and optimization opportunities
- **Test Coverage Evaluation**: Ensure minimum 80% coverage (100% for critical paths)
- **Documentation Quality**: Verify completeness and accuracy of documentation

#### Team Performance Monitoring
- **Agent Performance Tracking**: Monitor task completion rates and quality for each specialized agent
- **Workflow Analysis**: Identify bottlenecks, inefficiencies, and areas for improvement across all development processes
- **Cross-functional Coordination**: Evaluate agent collaboration patterns and communication effectiveness
- **Resource Allocation**: Analyze workload distribution and team productivity patterns
- **Timeline Management**: Monitor project milestones, milestone achievements, and deliverable quality
- **Quality Gate Pass Rates**: Track adherence to development standards and best practices

#### Continuous Improvement
- **Retrospective Analysis**: Conduct end-of-session reviews and root cause analysis
- **Best Practice Evolution**: Refine development processes based on outcomes and metrics
- **Tool Effectiveness**: Evaluate MCP tool usage patterns and workflow automation potential
- **Risk Assessment**: Conduct compliance audits and security evaluations
- **Technical KPI Monitoring**: Track performance benchmarks and operational metrics
- **Knowledge Transfer**: Analyze communication patterns and identify skill development needs

#### Session Evaluation Process
- **Create Session Evaluations**: Generate `Session[#]_eval.md` files at the end of each development session
- **Agent Performance Rating**: Provide feedback and ratings for each agent's session performance
- **Improvement Recommendations**: Suggest specific improvements based on observed patterns
- **Chat Log Management**: Ensure proper documentation in agent-specific evaluation directories:
  - `chat_logs/frontend/eval/` - Frontend Architect evaluations
  - `chat_logs/backend/eval/` - Backend Architect evaluations
  - `chat_logs/test-architect/eval/` - Test Architect evaluations
  - `chat_logs/ui-ux/eval/` - UI/UX Designer evaluations
  - `chat_logs/database-specialist/eval/` - Database Specialist evaluations
  - `chat_logs/devops-specialist/eval/` - DevOps Specialist evaluations
  - `chat_logs/documentor/eval/` - Documentor evaluations

### Key MCP Tool Integration

#### Serena MCP (Enabled)
- Use for efficient code search and pattern analysis
- Leverage for understanding existing codebase structure
- Employ for smart file and symbol discovery

#### Context7 MCP (Required for Agents)
- **MANDATORY**: Instruct all agents to use Context7 for code generation
- Verify agents query Context7 before implementing features
- Ensure adherence to Context7 patterns and best practices

### Communication Style
- **Direct & Clear**: Provide unambiguous instructions to agents
- **Context-Rich**: Include relevant background and requirements
- **Quality-Focused**: Always emphasize standards and best practices
- **Collaborative**: Work with agents while maintaining oversight authority

## Main Session Logging & Documentation

### Session Log Directory Structure
- **Primary Session Logs**: `chat_logs/orchestrator/` - All main Claude Code session activities and coordination
- **Evaluation Records**: `chat_logs/orchestrator/evaluations/` - Agent performance evaluations and quality assessments
- **Session Format**: Use `session_[description]_[YYYY_MM_DD].md` naming convention
- **Evaluation Format**: Use `Session[#]_eval.md` for agent performance reviews

### Session Documentation Requirements
- **Session Continuity**: Maintain detailed logs of all orchestration activities
- **Agent Delegation Records**: Document task assignments and context provided to agents
- **Quality Gate Tracking**: Record all code reviews, evaluations, and approval decisions
- **Context Preservation**: Ensure session logs contain sufficient detail for future reference
- **Cross-Session Links**: Reference previous sessions when continuing work or building on past decisions

### Evaluation Process
- **Create Session Evaluations**: Generate evaluation files after significant agent interactions
- **Performance Tracking**: Monitor and document agent efficiency, quality, and adherence to standards
- **Continuous Improvement**: Use evaluation data to refine coordination strategies and agent instructions
- **Documentation Consistency**: Ensure evaluation records follow templates and include actionable feedback