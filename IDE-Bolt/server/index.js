const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const chokidar = require('chokidar');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
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

// File watching
const watcher = chokidar.watch(PROJECT_ROOT, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true
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