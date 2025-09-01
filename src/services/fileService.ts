import { FileNode, FileOperation } from '../types';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

class FileService {
  private workspacePath: string;
  private gitIgnorePatterns: string[] = [];

  constructor(workspacePath = process.cwd()) {
    this.workspacePath = workspacePath;
    this.loadGitIgnore();
  }

  /**
   * Load .gitignore patterns for filtering
   */
  private async loadGitIgnore(): Promise<void> {
    try {
      const gitIgnorePath = path.join(this.workspacePath, '.gitignore');
      const content = await fs.readFile(gitIgnorePath, 'utf-8');
      this.gitIgnorePatterns = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
    } catch {
      // .gitignore doesn't exist or can't be read
      this.gitIgnorePatterns = [
        'node_modules',
        '.git',
        'dist',
        'build',
        '.env.local',
        '*.log',
        '.DS_Store'
      ];
    }
  }

  /**
   * Check if a file should be ignored based on .gitignore patterns
   */
  private shouldIgnore(filePath: string, includeHidden = false): boolean {
    const relativePath = path.relative(this.workspacePath, filePath);
    
    // Check hidden files
    if (!includeHidden && path.basename(filePath).startsWith('.')) {
      return true;
    }

    // Check gitignore patterns
    return this.gitIgnorePatterns.some(pattern => {
      if (pattern.endsWith('/')) {
        return relativePath.startsWith(pattern);
      }
      return relativePath.includes(pattern);
    });
  }

  /**
   * Get file tree structure
   */
  async getFileTree(rootPath = this.workspacePath, includeHidden = false): Promise<FileNode[]> {
    try {
      const items = await fs.readdir(rootPath, { withFileTypes: true });
      const nodes: FileNode[] = [];

      for (const item of items) {
        const fullPath = path.join(rootPath, item.name);
        
        if (this.shouldIgnore(fullPath, includeHidden)) {
          continue;
        }

        const stats = await fs.stat(fullPath);
        const relativePath = path.relative(this.workspacePath, fullPath);

        const node: FileNode = {
          id: uuidv4(),
          name: item.name,
          path: `/${relativePath.replace(/\\/g, '/')}`,
          type: item.isDirectory() ? 'folder' : 'file',
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
          created: stats.birthtime.toISOString(),
          gitStatus: await this.getGitStatus(fullPath),
          language: item.isFile() ? this.getFileLanguage(item.name) : undefined,
          permissions: {
            read: true, // Mock permissions - would need actual file system checks
            write: true,
            execute: stats.mode !== undefined ? (stats.mode & 0o111) !== 0 : false
          }
        };

        if (item.isDirectory()) {
          node.children = await this.getFileTree(fullPath, includeHidden);
        } else if (item.isFile()) {
          // Load content for small files only
          if (stats.size < 1024 * 1024) { // 1MB limit
            try {
              node.content = await fs.readFile(fullPath, 'utf-8');
            } catch {
              // Binary file or encoding issue
              node.content = `[Binary file: ${item.name}]`;
            }
          }
        }

        nodes.push(node);
      }

      // Sort: folders first, then files, both alphabetically
      return nodes.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });

    } catch (error) {
      console.error('Failed to get file tree:', error);
      throw new Error(`Failed to read directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new file
   */
  async createFile(parentPath: string, name: string, content = ''): Promise<FileNode> {
    const fullParentPath = parentPath ? path.join(this.workspacePath, parentPath) : this.workspacePath;
    const fullFilePath = path.join(fullParentPath, name);

    try {
      // Ensure parent directory exists
      await fs.mkdir(fullParentPath, { recursive: true });
      
      // Create file
      await fs.writeFile(fullFilePath, content, 'utf-8');
      
      const stats = await fs.stat(fullFilePath);
      const relativePath = path.relative(this.workspacePath, fullFilePath);

      return {
        id: uuidv4(),
        name,
        path: `/${relativePath.replace(/\\/g, '/')}`,
        type: 'file',
        size: stats.size,
        content,
        lastModified: stats.mtime.toISOString(),
        created: stats.birthtime.toISOString(),
        gitStatus: 'added',
        language: this.getFileLanguage(name),
        permissions: { read: true, write: true, execute: false }
      };
    } catch (error) {
      throw new Error(`Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new folder
   */
  async createFolder(parentPath: string, name: string): Promise<FileNode> {
    const fullParentPath = parentPath ? path.join(this.workspacePath, parentPath) : this.workspacePath;
    const fullFolderPath = path.join(fullParentPath, name);

    try {
      await fs.mkdir(fullFolderPath, { recursive: true });
      
      const stats = await fs.stat(fullFolderPath);
      const relativePath = path.relative(this.workspacePath, fullFolderPath);

      return {
        id: uuidv4(),
        name,
        path: `/${relativePath.replace(/\\/g, '/')}`,
        type: 'folder',
        children: [],
        lastModified: stats.mtime.toISOString(),
        created: stats.birthtime.toISOString(),
        gitStatus: 'added',
        permissions: { read: true, write: true, execute: true }
      };
    } catch (error) {
      throw new Error(`Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a file or folder
   */
  async deleteNode(nodePath: string): Promise<void> {
    const fullPath = path.join(this.workspacePath, nodePath);

    try {
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory()) {
        await fs.rmdir(fullPath, { recursive: true });
      } else {
        await fs.unlink(fullPath);
      }
    } catch (error) {
      throw new Error(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Rename a file or folder
   */
  async renameNode(oldPath: string, newName: string): Promise<FileNode> {
    const fullOldPath = path.join(this.workspacePath, oldPath);
    const parentDir = path.dirname(fullOldPath);
    const fullNewPath = path.join(parentDir, newName);

    try {
      await fs.rename(fullOldPath, fullNewPath);
      
      const stats = await fs.stat(fullNewPath);
      const relativePath = path.relative(this.workspacePath, fullNewPath);

      return {
        id: uuidv4(),
        name: newName,
        path: `/${relativePath.replace(/\\/g, '/')}`,
        type: stats.isDirectory() ? 'folder' : 'file',
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
        created: stats.birthtime.toISOString(),
        gitStatus: 'modified',
        language: stats.isFile() ? this.getFileLanguage(newName) : undefined,
        permissions: { read: true, write: true, execute: false }
      };
    } catch (error) {
      throw new Error(`Failed to rename: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Move a file or folder
   */
  async moveNode(fromPath: string, toPath: string): Promise<FileNode> {
    const fullFromPath = path.join(this.workspacePath, fromPath);
    const fullToPath = path.join(this.workspacePath, toPath);

    try {
      await fs.rename(fullFromPath, fullToPath);
      
      const stats = await fs.stat(fullToPath);
      const relativePath = path.relative(this.workspacePath, fullToPath);
      const name = path.basename(fullToPath);

      return {
        id: uuidv4(),
        name,
        path: `/${relativePath.replace(/\\/g, '/')}`,
        type: stats.isDirectory() ? 'folder' : 'file',
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
        created: stats.birthtime.toISOString(),
        gitStatus: 'modified',
        language: stats.isFile() ? this.getFileLanguage(name) : undefined,
        permissions: { read: true, write: true, execute: false }
      };
    } catch (error) {
      throw new Error(`Failed to move: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save file content
   */
  async saveFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.workspacePath, filePath);

    try {
      // Ensure parent directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      
      // Save file
      await fs.writeFile(fullPath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load file content
   */
  async loadFile(filePath: string): Promise<string> {
    const fullPath = path.join(this.workspacePath, filePath);

    try {
      return await fs.readFile(fullPath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to load file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute bulk file operations
   */
  async bulkOperation(operations: FileOperation[]): Promise<void> {
    const errors: string[] = [];

    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'create':
            if (operation.content !== undefined) {
              await this.createFile(path.dirname(operation.path), path.basename(operation.path), operation.content);
            } else {
              await this.createFolder(path.dirname(operation.path), path.basename(operation.path));
            }
            break;
          case 'delete':
            await this.deleteNode(operation.path);
            break;
          case 'rename':
            if (operation.newPath) {
              await this.renameNode(operation.path, path.basename(operation.newPath));
            }
            break;
          case 'move':
            if (operation.newPath) {
              await this.moveNode(operation.path, operation.newPath);
            }
            break;
          case 'modify':
            if (operation.content !== undefined) {
              await this.saveFile(operation.path, operation.content);
            }
            break;
        }
      } catch (error) {
        errors.push(`${operation.type} ${operation.path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Bulk operation partially failed:\n${errors.join('\n')}`);
    }
  }

  /**
   * Get Git status for a file (mock implementation)
   */
  private async getGitStatus(filePath: string): Promise<FileNode['gitStatus']> {
    // This would integrate with actual Git commands
    // For now, return mock status
    return 'unmodified';
  }

  /**
   * Determine file language based on extension
   */
  private getFileLanguage(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    
    const languageMap: Record<string, string> = {
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.cs': 'csharp',
      '.go': 'go',
      '.rs': 'rust',
      '.php': 'php',
      '.rb': 'ruby',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.scala': 'scala',
      '.html': 'html',
      '.htm': 'html',
      '.xml': 'xml',
      '.css': 'css',
      '.scss': 'scss',
      '.sass': 'sass',
      '.less': 'less',
      '.json': 'json',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.toml': 'toml',
      '.ini': 'ini',
      '.cfg': 'ini',
      '.conf': 'ini',
      '.md': 'markdown',
      '.mdx': 'markdown',
      '.sql': 'sql',
      '.sh': 'shell',
      '.bash': 'shell',
      '.zsh': 'shell',
      '.fish': 'shell',
      '.ps1': 'powershell',
      '.dockerfile': 'dockerfile',
      '.gitignore': 'gitignore',
      '.env': 'dotenv'
    };

    return languageMap[ext] || 'text';
  }

  /**
   * Watch for file system changes
   */
  watchDirectory(callback: (event: string, path: string) => void): () => void {
    // This would set up file system watching
    // Implementation depends on the environment (Node.js vs browser)
    
    const watchers: any[] = [];
    
    // Cleanup function
    return () => {
      watchers.forEach(watcher => watcher.close());
    };
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(filePath: string): Promise<Partial<FileNode>> {
    const fullPath = path.join(this.workspacePath, filePath);
    
    try {
      const stats = await fs.stat(fullPath);
      
      return {
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
        created: stats.birthtime.toISOString(),
        permissions: {
          read: true, // Would need proper permission checking
          write: true,
          execute: (stats.mode & 0o111) !== 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search files by content
   */
  async searchInFiles(query: string, extensions: string[] = []): Promise<FileNode[]> {
    // This would implement file content searching
    // For now, return empty array
    return [];
  }

  /**
   * Get file content with caching
   */
  private fileCache = new Map<string, { content: string; lastModified: string }>();

  async getFileContent(filePath: string, useCache = true): Promise<string> {
    const fullPath = path.join(this.workspacePath, filePath);
    
    try {
      const stats = await fs.stat(fullPath);
      const lastModified = stats.mtime.toISOString();
      
      // Check cache
      if (useCache && this.fileCache.has(filePath)) {
        const cached = this.fileCache.get(filePath)!;
        if (cached.lastModified === lastModified) {
          return cached.content;
        }
      }
      
      // Read file
      const content = await fs.readFile(fullPath, 'utf-8');
      
      // Update cache
      this.fileCache.set(filePath, { content, lastModified });
      
      return content;
    } catch (error) {
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create project from template
   */
  async createFromTemplate(templateId: string, projectName: string): Promise<FileNode[]> {
    // This would create a project from a predefined template
    // Implementation would depend on available templates
    return [];
  }

  /**
   * Backup project
   */
  async backupProject(backupPath?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup_${timestamp}`;
    const backupFullPath = backupPath || path.join(this.workspacePath, '..', backupName);
    
    try {
      // This would create a project backup
      // Implementation would copy all non-ignored files
      return backupFullPath;
    } catch (error) {
      throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const fileService = new FileService();

// Export class for testing or multiple instances
export { FileService };