# 🚀 Claude Code IDE

An advanced, AI-powered Interactive Development Environment that integrates seamlessly with Claude Code CLI. Built with React, TypeScript, and Docker for a world-class development experience.

![Claude Code IDE Screenshot](https://via.placeholder.com/800x500/1f2937/ffffff?text=Claude+Code+IDE)

## ✨ Features

### 🎯 Core IDE Features
- **VS Code-style File Explorer** with drag-and-drop, context menus, and real-time file watching
- **Monaco Editor Integration** with syntax highlighting, IntelliSense, and multi-cursor editing
- **Live Preview Panel** with device simulation (desktop, tablet, mobile) and responsive testing
- **Integrated Terminal** with multiple session support and command history
- **Real-time Chat** with Claude Code CLI for AI-assisted development

### 🤖 AI-Powered Development
- **Claude Code CLI Integration** for natural language programming
- **Multi-Agent Workflow** with specialized agents for frontend, backend, testing, and deployment
- **Visual Workflow Editor** with drag-and-drop agent orchestration
- **Intelligent Code Generation** based on context and conversation history
- **Real-time Agent Activity** monitoring and status indicators

### 🐳 Docker Integration
- **Containerized Development** environment with hot reload
- **Multi-service Orchestration** with docker-compose
- **Performance Monitoring** with real-time container metrics
- **One-click Deployment** and environment management

### 🔧 Advanced Features
- **Split-panel Layout** with resizable sections
- **Live Reload & Hot Module Replacement** for instant feedback
- **Git Integration** with status indicators and change tracking
- **WebSocket Communication** for real-time updates
- **Project Templates** and scaffolding tools
- **Export/Import** capabilities for projects and configurations

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom IDE components
- **Editor**: Monaco Editor (VS Code editor core)
- **State Management**: Zustand with persistence
- **Real-time**: WebSocket + Socket.IO
- **Containerization**: Docker + Docker Compose
- **AI Integration**: Claude Code CLI
- **File System**: Node.js fs with file watching (chokidar)
- **UI Components**: Lucide React icons + custom components

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **Docker** with Docker Compose
- **Git** (optional but recommended)

### Installation

1. **Clone and Setup**
```bash
git clone <repository-url>
cd claude-code-ide
chmod +x scripts/setup.sh
./scripts/setup.sh
```

2. **Install Claude Code CLI** (if not installed automatically)
```bash
npm install -g @anthropic/claude-code
```

3. **Start Development Environment**
```bash
# Option 1: Full environment (recommended)
npm run start:full

# Option 2: Individual services
npm run docker:up     # Start Docker containers
npm run dev           # Start Vite dev server  
npm run claude:dev    # Start Claude Code CLI
```

4. **Access the IDE**
- **Main IDE**: http://localhost:3000
- **Live Preview**: http://localhost:8080
- **Claude Code WebSocket**: ws://localhost:3001

## 📁 Project Structure

```
claude-code-ide/
├── 📁 src/
│   ├── 📁 components/          # React components
│   │   ├── 📁 Editor/         # Code editor components
│   │   ├── 📁 FileExplorer/   # File tree and management
│   │   ├── 📁 Preview/        # Live preview panel
│   │   ├── 📁 Terminal/       # Terminal interface
│   │   ├── 📁 WorkflowEditor/ # Agent workflow management
│   │   ├── 📁 ChatPanel/      # Claude Code chat interface
│   │   ├── 📁 Layout/         # Layout components
│   │   └── 📁 Settings/       # Configuration panels
│   ├── 📁 hooks/              # Custom React hooks
│   ├── 📁 services/           # Business logic and API calls
│   ├── 📁 stores/             # State management (Zustand)
│   ├── 📁 types/              # TypeScript type definitions
│   └── 📁 utils/              # Utility functions
├── 📁 docker/                 # Docker configuration
├── 📁 claude-code/            # Claude Code CLI configuration
├── 📁 scripts/                # Setup and deployment scripts
└── 📁 docs/                   # Documentation
```

## 🎮 Usage Guide

### Getting Started
1. **Start the IDE** with `npm run start:full`
2. **Open a file** from the explorer or create a new one
3. **Begin coding** with full IntelliSense and syntax highlighting
4. **See live preview** in the preview panel
5. **Chat with Claude Code** for AI assistance

### Working with Claude Code
```bash
# In the chat panel, try these commands:
"Create a React component for user authentication"
"Add a REST API endpoint for user data"
"Write tests for the login component"
"Optimize the app bundle size"
"Set up Docker deployment configuration"
```

### Agent Workflow Management
1. **Open Workflow Editor** tab
2. **Drag agents** from the palette to the canvas
3. **Connect agents** by drawing lines between them
4. **Configure conditions** and execution logic
5. **Save and execute** your custom workflow

### Docker Operations
```bash
# In the terminal:
docker ps                    # List running containers
docker-compose up --build    # Rebuild and start services
docker logs <container-id>   # View container logs
claude-code docker status    # Check Claude Code Docker integration
```

## ⚙️ Configuration

### Environment Setup
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
# Edit .env with your settings
```

### Claude Code Configuration
Edit `claude-code/claude-code.config.js`:
- **Agent settings** and capabilities
- **Workflow definitions**
- **Docker integration options**
- **Development preferences**

### Agent Configuration
Configure individual agents in `claude-code/config/agents.json`:
```json
{
  "frontend": {
    "enabled": true,
    "autoActivate": true,
    "capabilities": ["react", "typescript", "tailwind"]
  }
}
```

## 🔧 Advanced Usage

### Custom Workflows
Create custom agent workflows by:
1. Opening the **Workflow Editor**
2. Dragging agents onto the canvas
3. Connecting them with conditional logic
4. Saving as reusable templates

### Multi-Agent Collaboration
Enable agents to work together:
```javascript
// In chat panel:
"Have the frontend and backend agents collaborate to create a user dashboard with real-time data"
```

### Docker Orchestration
Manage multiple containers:
```yaml
# docker/docker-compose.dev.yml
services:
  app:
    build: .
    ports: ["3000:3000"]
  database:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
```

### VS Code Integration
The IDE supports VS Code-style features:
- **File operations** (create, rename, delete, move)
- **Multi-cursor editing** and advanced text manipulation
- **IntelliSense** with TypeScript support
- **Integrated terminal** with shell selection
- **Extension system** for Claude Code agents

## 📊 Monitoring & Debugging

### Performance Metrics
- **Container resource usage** (CPU, memory, network, disk)
- **Build times** and bundle size analysis
- **Agent performance** and response times
- **File system operation** monitoring

### Debug Tools
- **Browser DevTools** integration in preview panel
- **Container logs** streaming
- **Agent activity** real-time tracking
- **WebSocket connection** status monitoring
- **Error reporting** with stack traces

## 🚢 Deployment

### Development
```bash
npm run start:full
```

### Production Build
```bash
npm run build
docker-compose -f docker/docker-compose.yml up --build
```

### Cloud Deployment
```bash
# Build for production
npm run build

# Deploy to cloud provider
npm run deploy:aws    # AWS deployment
npm run deploy:gcp    # Google Cloud deployment
npm run deploy:azure  # Azure deployment
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper TypeScript types
4. **Test thoroughly** with `npm run test`
5. **Submit a pull request**

### Development Guidelines
- **Follow TypeScript** strict mode requirements
- **Use Prettier** for code formatting
- **Write tests** for new components and hooks
- **Document complex functions** with JSDoc
- **Follow the established** component architecture

### Code Style
- **React components** in PascalCase with TypeScript interfaces
- **Hooks** prefixed with `use` and proper dependency arrays
- **Services** as singleton classes with error handling
- **Types** in separate files with clear interfaces
- **Utils** as pure functions with unit tests

## 📚 Documentation

- **[Setup Guide](./docs/SETUP.md)** - Detailed installation instructions
- **[Claude Code Integration](./docs/CLAUDE_CODE_INTEGRATION.md)** - AI assistant configuration
- **[API Reference](./docs/API.md)** - Service and hook documentation
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🐛 Troubleshooting

### Common Issues

**Claude Code CLI not found**
```bash
npm install -g @anthropic/claude-code
claude-code --version
```

**Docker not starting**
```bash
# Check Docker status
docker info

# Restart Docker service
sudo systemctl restart docker  # Linux
# or restart Docker Desktop    # macOS/Windows
```

**Port conflicts**
```bash
# Check port usage
lsof -i :3000
lsof -i :3001

# Kill processes using ports
sudo kill -9 $(lsof -t -i:3000)
```

**WebSocket connection issues**
- Ensure ports 3000 and 3001 are available
- Check firewall settings
- Verify Docker networking configuration

### Getting Help

1. **Check logs**: `docker-compose logs` or view in IDE terminal
2. **GitHub Issues**: Report bugs and request features
3. **Documentation**: Check the docs/ directory
4. **Community**: Join our Discord/Slack for support

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic** for Claude Code CLI
- **Microsoft** for Monaco Editor
- **Vercel** for inspiration from v0.dev
- **Replit** for development environment concepts
- **VS Code team** for IDE design patterns

---

**Built with ❤️ for developers who want AI-powered coding experiences**

🌟 **Star this repo** if you find it useful!
🐛 **Report issues** to help us improve
🤝 **Contribute** to make it even better

*Happy coding with Claude! 🚀*