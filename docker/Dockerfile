# Multi-stage build for Claude Code IDE

# Base stage with Node.js and system dependencies
FROM node:18-bullseye as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    python3 \
    python3-pip \
    build-essential \
    docker.io \
    docker-compose \
    vim \
    nano \
    htop \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g \
    @anthropic/claude-code \
    concurrently \
    http-server \
    nodemon \
    typescript \
    ts-node

# Create app directory
WORKDIR /app

# Development stage
FROM base as development

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY vite.config.ts ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY claude-code/ ./claude-code/

# Create necessary directories
RUN mkdir -p /app/logs /app/temp /app/.claude-code

# Set up Claude Code workspace
RUN claude-code init --workspace=/app --config-path=/app/claude-code/claude-code.config.js

# Set up file permissions
RUN chown -R node:node /app
USER node

# Expose ports
EXPOSE 3000 3001 5173 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Development command
CMD ["sh", "-c", "concurrently \"npm run dev\" \"claude-code dev --watch --docker --port=3001\" \"http-server public -p 8080 -c-1\""]

# Production stage
FROM base as production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application
COPY --from=development /app/dist ./dist
COPY --from=development /app/claude-code ./claude-code

# Copy production configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Install nginx for serving static files
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Set up Claude Code for production
RUN claude-code init --workspace=/app --production

# Expose port
EXPOSE 80

# Production command
CMD ["sh", "-c", "nginx -g 'daemon off;' & claude-code serve --port=3001"]

# Builder stage for CI/CD
FROM base as builder

WORKDIR /app

# Copy all files
COPY . .

# Install all dependencies
RUN npm ci

# Build the application
RUN npm run build

# Run tests
RUN npm run test --passWithNoTests

# Copy built files to output directory
RUN mkdir -p /output && cp -r dist/* /output/