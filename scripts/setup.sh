#!/bin/bash

# Claude Code IDE - Complete Setup Script
# This script sets up the entire development environment

set -e  # Exit on any error

echo "🚀 Setting up Claude Code IDE Environment..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install npm first."
    exit 1
fi

print_success "npm $(npm --version) found"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker not found. Please install Docker first."
    exit 1
fi

if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

print_success "Docker found and running"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_warning "docker-compose not found. Trying docker compose..."
    if ! docker compose version &> /dev/null; then
        print_error "Neither docker-compose nor 'docker compose' found."
        exit 1
    else
        alias docker-compose="docker compose"
    fi
fi

print_success "Docker Compose found"

# Install Claude Code CLI globally if not present
print_status "Checking Claude Code CLI..."
if ! command -v claude-code &> /dev/null; then
    print_status "Installing Claude Code CLI globally..."
    npm install -g @anthropic/claude-code
    print_success "Claude Code CLI installed"
else
    print_success "Claude Code CLI already installed"
fi

# Install project dependencies
print_status "Installing project dependencies..."
npm install
print_success "Dependencies installed"

# Set up environment files
print_status "Setting up environment configuration..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    print_success "Environment file created from template"
else
    print_warning "Environment file already exists"
fi

# Initialize Claude Code workspace
print_status "Initializing Claude Code workspace..."
claude-code init --workspace=. --config-path=./claude-code/claude-code.config.js
print_success "Claude Code workspace initialized"

# Build Docker images
print_status "Building Docker images..."
docker-compose -f docker/docker-compose.yml build
print_success "Docker images built"

# Create necessary directories
print_status "Creating project directories..."
mkdir -p logs temp .claude-code/cache .claude-code/workflows .claude-code/sessions
print_success "Project directories created"

# Set up Git hooks (if in a Git repository)
if [ -d ".git" ]; then
    print_status "Setting up Git hooks..."
    cp scripts/pre-commit .git/hooks/
    chmod +x .git/hooks/pre-commit
    print_success "Git hooks configured"
fi

# Generate initial project configuration
print_status "Generating initial configuration..."
cat > claude-code/config/settings.json << EOF
{
  "workspace": {
    "name": "Claude Code IDE Project",
    "type": "react-typescript",
    "framework": "vite"
  },
  "agents": {
    "frontend": {
      "enabled": true,
      "autoActivate": true,
      "config": {
        "livePreview": true,
        "autoFormat": true,
        "componentLibrary": "tailwindcss"
      }
    },
    "backend": {
      "enabled": true,
      "autoActivate": false,
      "config": {
        "apiDocumentation": true,
        "autoTest": true
      }
    },
    "testing": {
      "enabled": true,
      "autoActivate": false,
      "config": {
        "coverage": 80,
        "autoRun": false
      }
    },
    "deployment": {
      "enabled": true,
      "autoActivate": false,
      "config": {
        "provider": "docker",
        "autoTrigger": false
      }
    }
  },
  "docker": {
    "autoStart": true,
    "hotReload": true,
    "portMapping": {
      "app": 3000,
      "websocket": 3001,
      "preview": 8080
    }
  },
  "development": {
    "liveReload": true,
    "autoSave": true,
    "formatOnSave": true,
    "linting": true
  }
}
EOF

print_success "Configuration files generated"

# Test the setup
print_status "Testing the setup..."

# Start services in background for testing
docker-compose -f docker/docker-compose.yml up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 20

# Check if services are running
if curl -f http://localhost:5173 &> /dev/null; then
    print_success "Frontend is running on http://localhost:5173"
else
    print_warning "Frontend not yet accessible (may take a few more moments)"
fi

if curl -f http://localhost:3001/api/claude/health &> /dev/null; then
    print_success "Backend API server is running"
else
    print_warning "Backend API server not yet accessible"
fi

# Stop test services
docker-compose -f docker/docker-compose.yml down

print_success "Setup complete!"
echo ""
echo "🎉 Claude Code IDE is now ready!"
echo ""
echo "To start the development environment:"
echo "  npm start                              # Start both frontend and backend"
echo "  docker-compose up                      # Or use Docker (recommended)"
echo ""
echo "Or start individual services:"
echo "  npm run dev:frontend                   # Frontend only (Vite dev server)"
echo "  npm run dev:backend                    # Backend only (API server)"
echo "  docker-compose up claude-code-frontend # Frontend container"
echo "  docker-compose up claude-code-backend  # Backend container"
echo ""
echo "Access your IDE at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend API: http://localhost:3001"
echo "  Health Check: http://localhost:3001/api/claude/health"
echo ""
echo "🚀 Happy coding with Claude Code IDE!"
echo ""
print_status "Next steps:"
echo "1. Set your Claude API key in environment variables"
echo "2. Run 'npm start' or 'docker-compose up' to launch the IDE"
echo "3. Open http://localhost:5173 in your browser"
echo "4. Start coding and let Claude assist you!"