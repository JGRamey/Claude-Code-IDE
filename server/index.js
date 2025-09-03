import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import chokidar from 'chokidar';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PROJECT_ROOT = path.join(__dirname, '..');

// File system API endpoints
app.get('/api/files', async (req, res) => {
  try {
    const dirPath = req.query.path || PROJECT_ROOT;
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    const files = await Promise.all(
      items
        .filter(item => !item.name.startsWith('.') && item.name !== 'node_modules')
        .map(async (item) => {
          const fullPath = path.join(dirPath, item.name);
          const relativePath = path.relative(PROJECT_ROOT, fullPath);
          
          const fileNode = {
            id: Math.random().toString(36).substr(2, 9),
            name: item.name,
            type: item.isDirectory() ? 'folder' : 'file',
            path: relativePath || item.name,
            isOpen: false,
          };

          if (item.isDirectory()) {
            try {
              const children = await fs.readdir(fullPath, { withFileTypes: true });
              fileNode.children = children
                .filter(child => !child.name.startsWith('.') && child.name !== 'node_modules')
                .map(child => ({
                  id: Math.random().toString(36).substr(2, 9),
                  name: child.name,
                  type: child.isDirectory() ? 'folder' : 'file',
                  path: path.join(relativePath, child.name),
                  isOpen: false,
                }));
            } catch (error) {
              fileNode.children = [];
            }
          }

          return fileNode;
        })
    );

    res.json(files);
  } catch (error) {
    console.error('Error reading directory:', error);
    res.status(500).json({ error: 'Failed to read directory' });
  }
});

app.get('/api/files/content', async (req, res) => {
  try {
    const filePath = path.join(PROJECT_ROOT, req.query.path);
    const content = await fs.readFile(filePath, 'utf8');
    res.json({ content });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

app.post('/api/files/content', async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    const fullPath = path.join(PROJECT_ROOT, filePath);
    await fs.writeFile(fullPath, content, 'utf8');
    
    // Emit file change event
    io.emit('file-changed', { path: filePath });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: 'Failed to write file' });
  }
});

app.post('/api/files', async (req, res) => {
  try {
    const { path: filePath, type } = req.body;
    const fullPath = path.join(PROJECT_ROOT, filePath);
    
    if (type === 'folder') {
      await fs.mkdir(fullPath, { recursive: true });
    } else {
      await fs.writeFile(fullPath, '', 'utf8');
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating file/folder:', error);
    res.status(500).json({ error: 'Failed to create file/folder' });
  }
});

app.delete('/api/files', async (req, res) => {
  try {
    const { path: filePath } = req.body;
    const fullPath = path.join(PROJECT_ROOT, filePath);
    
    const stats = await fs.stat(fullPath);
    if (stats.isDirectory()) {
      await fs.rmdir(fullPath, { recursive: true });
    } else {
      await fs.unlink(fullPath);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting file/folder:', error);
    res.status(500).json({ error: 'Failed to delete file/folder' });
  }
});

app.post('/api/files/rename', async (req, res) => {
  try {
    const { oldPath, newPath } = req.body;
    const fullOldPath = path.join(PROJECT_ROOT, oldPath);
    const fullNewPath = path.join(PROJECT_ROOT, newPath);
    
    await fs.rename(fullOldPath, fullNewPath);
    res.json({ success: true });
  } catch (error) {
    console.error('Error renaming file/folder:', error);
    res.status(500).json({ error: 'Failed to rename file/folder' });
  }
});

// Claude AI API endpoints (mock implementation)
app.post('/api/claude/generate', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    
    // This is a mock response - in a real implementation, you'd integrate with Claude API
    const mockResponse = `// Generated code for: ${prompt}\n// Context: ${context ? 'Available' : 'None'}\n\n// This is a mock response. Configure your Claude API key to get real responses.\nconsole.log('Hello from Claude-generated code!');`;
    
    setTimeout(() => {
      res.json({ code: mockResponse });
    }, 1000); // Simulate API delay
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate code' });
  }
});

app.post('/api/claude/explain', async (req, res) => {
  try {
    const { code } = req.body;
    
    const mockExplanation = `This code appears to be ${code.includes('function') ? 'a function definition' : 'a code snippet'}. To get detailed explanations, please configure your Claude API key in the settings.`;
    
    setTimeout(() => {
      res.json({ explanation: mockExplanation });
    }, 800);
  } catch (error) {
    res.status(500).json({ error: 'Failed to explain code' });
  }
});

app.post('/api/claude/optimize', async (req, res) => {
  try {
    const { code } = req.body;
    
    // Mock optimization
    const optimizedCode = `// Optimized version:\n${code}\n\n// Note: Configure Claude API for real optimizations`;
    
    setTimeout(() => {
      res.json({ optimizedCode });
    }, 1200);
  } catch (error) {
    res.status(500).json({ error: 'Failed to optimize code' });
  }
});

app.post('/api/claude/debug', async (req, res) => {
  try {
    const { code, error } = req.body;
    
    const mockSolution = `Based on the error "${error}", here are some suggestions:\n\n1. Check for syntax errors\n2. Verify import statements\n3. Ensure proper type definitions\n\nConfigure Claude API for detailed debugging assistance.`;
    
    setTimeout(() => {
      res.json({ solution: mockSolution });
    }, 1000);
  } catch (error) {
    res.status(500).json({ error: 'Failed to debug code' });
  }
});

// Claude Code CLI Integration - Real Implementation
const activeCLIProcesses = new Map();

/**
 * Execute Claude Code CLI command with proper process management
 */
app.post('/api/claude/execute', async (req, res) => {
  try {
    const { id, type, instruction, context, options } = req.body;
    
    if (!id || !instruction) {
      return res.status(400).json({ error: 'Missing required fields: id, instruction' });
    }

    console.log(`[${new Date().toISOString()}] Executing Claude CLI command: ${id} (${type})`);
    
    // Prepare Claude Code CLI arguments
    const args = [
      '--workspace', context?.workspace || PROJECT_ROOT,
      '--session-id', context?.sessionId || 'default',
    ];

    // Add instruction as argument or via stdin
    const cliProcess = spawn('claude-code', [...args], {
      cwd: context?.workspace || PROJECT_ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        CLAUDE_CODE_MODE: 'api',
        CLAUDE_CODE_LOG_LEVEL: 'info',
      },
      timeout: options?.timeout || 30000,
    });

    // Track the process
    activeCLIProcesses.set(id, cliProcess);

    let output = '';
    let errorOutput = '';

    // Handle CLI output
    cliProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    cliProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Send instruction to Claude Code CLI
    cliProcess.stdin.write(instruction);
    cliProcess.stdin.end();

    // Handle process completion
    cliProcess.on('close', (code) => {
      activeCLIProcesses.delete(id);
      
      if (code === 0 && output.trim()) {
        console.log(`[${new Date().toISOString()}] CLI command ${id} completed successfully`);
        res.json({
          id,
          success: true,
          output: output.trim(),
          timestamp: new Date().toISOString(),
        });
      } else {
        console.error(`[${new Date().toISOString()}] CLI command ${id} failed with code ${code}`);
        console.error(`Error output: ${errorOutput}`);
        
        res.status(500).json({
          id,
          success: false,
          error: errorOutput || `Process exited with code ${code}`,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle process errors
    cliProcess.on('error', (error) => {
      activeCLIProcesses.delete(id);
      console.error(`[${new Date().toISOString()}] CLI process error for ${id}:`, error);
      
      // Check if this is a "claude-code command not found" error
      if (error.code === 'ENOENT') {
        res.status(503).json({
          id,
          success: false,
          error: 'Claude Code CLI not found. Please ensure claude-code is installed and available in PATH.',
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(500).json({
          id,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Set timeout for the request
    const timeoutMs = options?.timeout || 30000;
    setTimeout(() => {
      if (activeCLIProcesses.has(id)) {
        console.warn(`[${new Date().toISOString()}] Killing CLI process ${id} due to timeout`);
        cliProcess.kill('SIGTERM');
        activeCLIProcesses.delete(id);
        
        if (!res.headersSent) {
          res.status(408).json({
            id,
            success: false,
            error: `Command timed out after ${timeoutMs}ms`,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }, timeoutMs);

  } catch (error) {
    console.error('Error in Claude CLI execution:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check endpoint for Claude Code CLI
app.get('/api/claude/health', async (req, res) => {
  try {
    const healthCheck = spawn('claude-code', ['--version'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000,
    });

    let output = '';
    healthCheck.stdout.on('data', (data) => {
      output += data.toString();
    });

    healthCheck.on('close', (code) => {
      if (code === 0) {
        res.json({
          status: 'healthy',
          version: output.trim(),
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(503).json({
          status: 'unhealthy',
          error: 'Claude Code CLI not responding',
          timestamp: new Date().toISOString(),
        });
      }
    });

    healthCheck.on('error', (error) => {
      res.status(503).json({
        status: 'unavailable',
        error: error.code === 'ENOENT' 
          ? 'Claude Code CLI not installed'
          : error.message,
        timestamp: new Date().toISOString(),
      });
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('execute-command', (data) => {
    const { command } = data;
    console.log('Executing command:', command);

    const process = spawn('sh', ['-c', command], {
      cwd: PROJECT_ROOT,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    process.stdout.on('data', (data) => {
      socket.emit('command-output', { output: data.toString() });
    });

    process.stderr.on('data', (data) => {
      socket.emit('command-error', { error: data.toString() });
    });

    process.on('close', (code) => {
      socket.emit('command-output', { 
        output: `Process exited with code ${code}` 
      });
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// File watching - only watch source files to avoid too many open files
const watcher = chokidar.watch([
  path.join(PROJECT_ROOT, 'src'),
  path.join(PROJECT_ROOT, 'server'),
  path.join(PROJECT_ROOT, '*.json'),
  path.join(PROJECT_ROOT, '*.md'),
  path.join(PROJECT_ROOT, '*.ts'),
  path.join(PROJECT_ROOT, '*.js')
], {
  ignored: [
    /(^|[\/\\])\../, // ignore dotfiles
    /node_modules/, // ignore node_modules
    /dist/, // ignore build output
    /\.git/, // ignore git
    /logs/, // ignore logs
  ],
  persistent: true,
  ignoreInitial: true,
  usePolling: false,
  depth: 5 // limit recursion depth
});

watcher.on('change', (filePath) => {
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  io.emit('file-changed', { path: relativePath });
});

watcher.on('add', (filePath) => {
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  io.emit('file-added', { path: relativePath });
});

watcher.on('unlink', (filePath) => {
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  io.emit('file-deleted', { path: relativePath });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Claude-Code IDE Server running on port ${PORT}`);
});