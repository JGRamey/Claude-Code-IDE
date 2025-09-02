# Claude-Code IDE

A beautiful, feature-rich local IDE inspired by Replit, enhanced with Claude AI integration.

## Features

- 🎨 **Beautiful Interface**: Dark theme with VS Code-inspired design
- 📁 **File Explorer**: Real-time file management with drag & drop
- ✏️ **Monaco Editor**: Full VS Code editor experience with syntax highlighting
- 🖥️ **Integrated Terminal**: Execute commands with real-time output
- 🤖 **AI Assistant**: Claude-powered coding assistance
- 🔄 **Real-time Collaboration**: WebSocket-based file synchronization
- 💾 **Persistent Workspace**: Your project state is automatically saved
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom IDE components
- **Editor**: Monaco Editor (VS Code editor core)
- **State Management**: Zustand with persistence
- **Real-time**: WebSocket + Socket.IO
- **Containerization**: Docker + Docker Compose
- **AI Integration**: Claude Code CLI
- **File System**: Node.js fs with file watching (chokidar)
- **UI Components**: Lucide React icons + custom components

## Quick Start

### Using Docker (Recommended)

1. **Clone and start the IDE**:
   ```bash
   docker-compose up --build
   ```

2. **Access the IDE**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the backend server**:
   ```bash
   node server/index.js
   ```

3. **In a new terminal, start the frontend**:
   ```bash
   npm run dev
   ```

## Usage

### File Management
- Create new files and folders using the + button in the file explorer
- Right-click files for context menu options (rename, delete, copy)
- Click files to open them in the editor with syntax highlighting

### Editor Features
- Multiple file tabs with easy switching
- Auto-save on Ctrl/Cmd + S
- Syntax highlighting for 20+ languages
- IntelliSense and code completion
- Find and replace functionality

### Terminal
- Integrated terminal with command execution
- Real-time output streaming
- Command history with arrow key navigation
- Clear terminal functionality

### AI Assistant
- Claude-powered code generation and assistance
- Context-aware suggestions based on current file
- Code explanation and optimization
- Debug assistance with error analysis

### Keyboard Shortcuts
- `Ctrl/Cmd + S`: Save current file
- `Ctrl/Cmd + \``: Toggle terminal
- `Ctrl/Cmd + Shift + P`: Command palette (coming soon)
- `Ctrl/Cmd + B`: Toggle file explorer

## Configuration

### Claude AI Integration
To enable real Claude AI responses:

1. Get your Claude API key from Anthropic
2. Add it to your environment variables:
   ```bash
   export CLAUDE_API_KEY=your_api_key_here
   ```
3. Update the backend service to use the real Claude API

### Customization
- Modify `tailwind.config.js` for theme customization
- Update `src/store/workspace.ts` for workspace behavior
- Extend `server/index.js` for additional backend features

## Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build claude-code-frontend
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details