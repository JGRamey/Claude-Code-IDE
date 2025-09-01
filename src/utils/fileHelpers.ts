import { FileNode } from '../types';

/**
 * Get appropriate icon for file based on name and type
 */
export function getFileIcon(fileName: string, type: 'file' | 'folder'): string {
  if (type === 'folder') {
    return '📁';
  }

  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  const iconMap: Record<string, string> = {
    // JavaScript/TypeScript
    'js': '🟨',
    'jsx': '⚛️',
    'ts': '🔷',
    'tsx': '⚛️',
    'vue': '💚',
    'svelte': '🧡',
    
    // Styling
    'css': '🎨',
    'scss': '💜',
    'sass': '💜',
    'less': '💙',
    'stylus': '💚',
    
    // Markup
    'html': '🌐',
    'htm': '🌐',
    'xml': '📄',
    'svg': '🖼️',
    'md': '📝',
    'mdx': '📝',
    'txt': '📄',
    
    // Data
    'json': '⚙️',
    'yaml': '⚙️',
    'yml': '⚙️',
    'toml': '⚙️',
    'ini': '⚙️',
    'env': '🔐',
    'csv': '📊',
    
    // Images
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'gif': '🖼️',
    'webp': '🖼️',
    'svg': '🖼️',
    'ico': '🖼️',
    
    // Documents
    'pdf': '📕',
    'doc': '📘',
    'docx': '📘',
    'xls': '📗',
    'xlsx': '📗',
    'ppt': '📙',
    'pptx': '📙',
    
    // Programming Languages
    'py': '🐍',
    'java': '☕',
    'cpp': '⚡',
    'c': '⚡',
    'cs': '💜',
    'php': '🐘',
    'rb': '💎',
    'go': '🐹',
    'rs': '🦀',
    'swift': '🦉',
    'kt': '🟣',
    'scala': '🔴',
    'r': '📊',
    'matlab': '📊',
    
    // Configuration
    'dockerfile': '🐳',
    'dockerignore': '🐳',
    'gitignore': '📂',
    'gitattributes': '📂',
    'editorconfig': '⚙️',
    'prettierrc': '💅',
    'eslintrc': '🔍',
    'babelrc': '🔄',
    'webpack': '📦',
    'rollup': '📦',
    'vite': '⚡',
    
    // Package managers
    'package': '📦',
    'lock': '🔒',
    'yarn': '📦',
    'pnpm': '📦',
    
    // Testing
    'test': '🧪',
    'spec': '🧪',
    
    // Database
    'sql': '🗄️',
    'db': '🗄️',
    'sqlite': '🗄️',
    
    // Logs
    'log': '📜',
    'logs': '📜',
    
    // Archives
    'zip': '📦',
    'tar': '📦',
    'gz': '📦',
    'rar': '📦',
    '7z': '📦'
  };

  // Special file name patterns
  const specialPatterns: Array<{ pattern: RegExp; icon: string }> = [
    { pattern: /^readme/i, icon: '📖' },
    { pattern: /^license/i, icon: '⚖️' },
    { pattern: /^changelog/i, icon: '📝' },
    { pattern: /^contributing/i, icon: '🤝' },
    { pattern: /^dockerfile/i, icon: '🐳' },
    { pattern: /^makefile/i, icon: '🔨' },
    { pattern: /^rakefile/i, icon: '💎' },
    { pattern: /^gemfile/i, icon: '💎' },
    { pattern: /^podfile/i, icon: '🍎' },
    { pattern: /^requirements\.txt/i, icon: '🐍' },
    { pattern: /^cargo\.toml/i, icon: '🦀' },
    { pattern: /^go\.mod/i, icon: '🐹' },
    { pattern: /^composer\.json/i, icon: '🐘' },
    { pattern: /package\.json/i, icon: '📦' },
    { pattern: /tsconfig\.json/i, icon: '🔷' },
    { pattern: /\.config\.(js|ts|json)/i, icon: '⚙️' },
    { pattern: /\.env/i, icon: '🔐' }
  ];

  // Check special patterns first
  for (const { pattern, icon } of specialPatterns) {
    if (pattern.test(fileName)) {
      return icon;
    }
  }

  // Check by extension
  return iconMap[extension] || '📄';
}

/**
 * Get programming language for Monaco Editor
 */
export function getFileLanguage(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  const languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'mjs': 'javascript',
    'cjs': 'javascript',
    
    // Web technologies
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'stylus': 'stylus',
    
    // Data formats
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'xml': 'xml',
    'csv': 'csv',
    
    // Programming languages
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'r': 'r',
    'sql': 'sql',
    
    // Shell scripts
    'sh': 'shell',
    'bash': 'shell',
    'zsh': 'shell',
    'fish': 'shell',
    'ps1': 'powershell',
    'bat': 'bat',
    'cmd': 'bat',
    
    // Markup
    'md': 'markdown',
    'mdx': 'markdown',
    'tex': 'latex',
    
    // Configuration
    'dockerfile': 'dockerfile',
    'gitignore': 'ignore',
    'gitattributes': 'ignore',
    'env': 'dotenv',
    'ini': 'ini',
    'cfg': 'ini',
    'conf': 'ini',
    
    // Other
    'log': 'log',
    'txt': 'plaintext'
  };

  // Special file name patterns
  if (/^dockerfile/i.test(fileName)) return 'dockerfile';
  if (/makefile/i.test(fileName)) return 'makefile';
  if (/rakefile/i.test(fileName)) return 'ruby';
  if (/gemfile/i.test(fileName)) return 'ruby';
  if (/podfile/i.test(fileName)) return 'ruby';
  if (/^readme/i.test(fileName)) return 'markdown';
  if (/^license/i.test(fileName)) return 'plaintext';
  if (/\.config\.(js|ts)/i.test(fileName)) return fileName.endsWith('.ts') ? 'typescript' : 'javascript';

  return languageMap[extension] || 'plaintext';
}

/**
 * Get language-specific comment syntax
 */
export function getCommentSyntax(language: string): { single: string; multi?: { start: string; end: string } } {
  const commentMap: Record<string, { single: string; multi?: { start: string; end: string } }> = {
    javascript: { single: '//', multi: { start: '/*', end: '*/' } },
    typescript: { single: '//', multi: { start: '/*', end: '*/' } },
    python: { single: '#', multi: { start: '"""', end: '"""' } },
    java: { single: '//', multi: { start: '/*', end: '*/' } },
    cpp: { single: '//', multi: { start: '/*', end: '*/' } },
    c: { single: '//', multi: { start: '/*', end: '*/' } },
    csharp: { single: '//', multi: { start: '/*', end: '*/' } },
    php: { single: '//', multi: { start: '/*', end: '*/' } },
    ruby: { single: '#', multi: { start: '=begin', end: '=end' } },
    go: { single: '//', multi: { start: '/*', end: '*/' } },
    rust: { single: '//', multi: { start: '/*', end: '*/' } },
    swift: { single: '//', multi: { start: '/*', end: '*/' } },
    kotlin: { single: '//', multi: { start: '/*', end: '*/' } },
    scala: { single: '//', multi: { start: '/*', end: '*/' } },
    shell: { single: '#' },
    powershell: { single: '#', multi: { start: '<#', end: '#>' } },
    sql: { single: '--', multi: { start: '/*', end: '*/' } },
    html: { multi: { start: '<!--', end: '-->' } },
    css: { multi: { start: '/*', end: '*/' } },
    yaml: { single: '#' },
    toml: { single: '#' },
    ini: { single: ';' },
    dockerfile: { single: '#' },
    markdown: { multi: { start: '<!--', end: '-->' } }
  };

  return commentMap[language] || { single: '#' };
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Check if file is binary
 */
export function isBinaryFile(fileName: string, content?: string): boolean {
  const binaryExtensions = new Set([
    'exe', 'dll', 'so', 'dylib', 'bin', 'app', 'dmg', 'pkg',
    'zip', 'tar', 'gz', 'rar', '7z', 'bz2', 'xz',
    'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico', 'tiff',
    'mp3', 'wav', 'flac', 'ogg', 'mp4', 'avi', 'mov', 'wmv',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'ttf', 'otf', 'woff', 'woff2', 'eot',
    'db', 'sqlite', 'sqlite3'
  ]);

  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (binaryExtensions.has(extension)) {
    return true;
  }

  // Check content for null bytes (binary indicator)
  if (content) {
    return content.includes('\0');
  }

  return false;
}

/**
 * Generate file template content
 */
export function generateFileTemplate(fileName: string, type: string = 'file'): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  const pascalCase = baseName.split(/[-_]/).map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');

  const templates: Record<string, string> = {
    'tsx': `import React from 'react';

interface ${pascalCase}Props {
  // Define your props here
}

export function ${pascalCase}({ }: ${pascalCase}Props) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">${pascalCase}</h1>
      <p>Your component content goes here.</p>
    </div>
  );
}

export default ${pascalCase};`,

    'ts': `/**
 * ${baseName} - TypeScript module
 * Generated by Claude Code IDE
 */

export interface ${pascalCase}Config {
  // Define your configuration interface
}

export class ${pascalCase} {
  private config: ${pascalCase}Config;

  constructor(config: ${pascalCase}Config) {
    this.config = config;
  }

  // Add your methods here
}

export default ${pascalCase};`,

    'js': `/**
 * ${baseName} - JavaScript module
 * Generated by Claude Code IDE
 */

/**
 * ${pascalCase} class
 */
class ${pascalCase} {
  constructor(config = {}) {
    this.config = config;
  }

  // Add your methods here
}

module.exports = ${pascalCase};`,

    'css': `/* ${baseName} - Stylesheet */
/* Generated by Claude Code IDE */

.${baseName} {
  /* Add your styles here */
}`,

    'scss': `// ${baseName} - Sass stylesheet
// Generated by Claude Code IDE

.${baseName} {
  // Add your styles here
  
  &__element {
    // Nested styles
  }
  
  &--modifier {
    // Modifier styles
  }
}`,

    'html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pascalCase}</title>
</head>
<body>
  <div id="app">
    <h1>Welcome to ${pascalCase}</h1>
  </div>
</body>
</html>`,

    'py': `"""
${baseName} - Python module
Generated by Claude Code IDE
"""

class ${pascalCase}:
    """${pascalCase} class"""
    
    def __init__(self, config=None):
        self.config = config or {}
    
    def main(self):
        """Main method"""
        pass

if __name__ == "__main__":
    instance = ${pascalCase}()
    instance.main()`,

    'java': `/**
 * ${baseName} - Java class
 * Generated by Claude Code IDE
 */

public class ${pascalCase} {
    
    public ${pascalCase}() {
        // Constructor
    }
    
    public static void main(String[] args) {
        ${pascalCase} instance = new ${pascalCase}();
        // Your code here
    }
}`,

    'md': `# ${pascalCase}

Generated by Claude Code IDE

## Overview

Add your documentation here.

## Usage

\`\`\`bash
# Example usage
\`\`\`

## Features

- Feature 1
- Feature 2
- Feature 3

## Contributing

Please read the contributing guidelines before submitting changes.`,

    'json': `{
  "name": "${baseName}",
  "version": "1.0.0",
  "description": "Generated by Claude Code IDE",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}`,

    'dockerfile': `# ${pascalCase} Docker Configuration
# Generated by Claude Code IDE

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]`,

    'gitignore': `# Dependencies
node_modules/
/.pnp
.pnp.js

# Production builds
/build
/dist

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Claude Code IDE
.claude-code/cache/
logs/
temp/`
  };

  return templates[extension] || `// ${baseName}
// Generated by Claude Code IDE

// Add your code here
`;
}

/**
 * Validate file name
 */
export function validateFileName(name: string): { isValid: boolean; error?: string } {
  if (!name.trim()) {
    return { isValid: false, error: 'File name cannot be empty' };
  }

  if (name.length > 255) {
    return { isValid: false, error: 'File name too long (max 255 characters)' };
  }

  // Check for invalid characters (Windows + Unix)
  const invalidChars = /[<>:"|?*\x00-\x1f]/;
  if (invalidChars.test(name)) {
    return { isValid: false, error: 'File name contains invalid characters' };
  }

  // Check for reserved names (Windows)
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
  if (reservedNames.test(name)) {
    return { isValid: false, error: 'File name is reserved by the system' };
  }

  // Check for leading/trailing spaces or dots
  if (name !== name.trim() || name.endsWith('.')) {
    return { isValid: false, error: 'File name cannot start/end with spaces or end with a dot' };
  }

  return { isValid: true };
}

/**
 * Get relative path from absolute paths
 */
export function getRelativePath(fromPath: string, toPath: string): string {
  const fromParts = fromPath.split('/').filter(Boolean);
  const toParts = toPath.split('/').filter(Boolean);
  
  let commonLength = 0;
  while (
    commonLength < fromParts.length &&
    commonLength < toParts.length &&
    fromParts[commonLength] === toParts[commonLength]
  ) {
    commonLength++;
  }
  
  const upLevels = fromParts.length - commonLength;
  const upPath = '../'.repeat(upLevels);
  const downPath = toParts.slice(commonLength).join('/');
  
  return upPath + downPath || './';
}

/**
 * Check if path is under another path
 */
export function isPathUnder(childPath: string, parentPath: string): boolean {
  const normalizedChild = childPath.replace(/\\/g, '/').replace(/\/$/, '');
  const normalizedParent = parentPath.replace(/\\/g, '/').replace(/\/$/, '');
  
  return normalizedChild.startsWith(normalizedParent + '/') || normalizedChild === normalizedParent;
}

/**
 * Sort files with folders first, then alphabetically
 */
export function sortFileNodes(nodes: FileNode[]): FileNode[] {
  return [...nodes].sort((a, b) => {
    // Folders first
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    
    // Then alphabetically, case-insensitive
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
}

/**
 * Find file node by path in tree
 */
export function findFileInTree(tree: FileNode[], targetPath: string): FileNode | null {
  for (const node of tree) {
    if (node.path === targetPath) {
      return node;
    }
    
    if (node.children) {
      const found = findFileInTree(node.children, targetPath);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * Get all file paths from tree
 */
export function getAllFilePaths(tree: FileNode[], fileOnly = false): string[] {
  const paths: string[] = [];
  
  const traverse = (nodes: FileNode[]) => {
    for (const node of nodes) {
      if (!fileOnly || node.type === 'file') {
        paths.push(node.path);
      }
      
      if (node.children) {
        traverse(node.children);
      }
    }
  };
  
  traverse(tree);
  return paths;
}

/**
 * Calculate directory size
 */
export function calculateDirectorySize(node: FileNode): number {
  if (node.type === 'file') {
    return node.size || 0;
  }
  
  if (!node.children) {
    return 0;
  }
  
  return node.children.reduce((total, child) => {
    return total + calculateDirectorySize(child);
  }, 0);
}

/**
 * Get file extension without dot
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file is editable in text editor
 */
export function isEditableFile(fileName: string): boolean {
  const editableExtensions = new Set([
    'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte',
    'html', 'htm', 'css', 'scss', 'sass', 'less',
    'json', 'yaml', 'yml', 'toml', 'xml',
    'md', 'mdx', 'txt', 'log',
    'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs',
    'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd',
    'sql', 'dockerfile', 'gitignore', 'env', 'ini', 'cfg', 'conf'
  ]);

  const extension = getFileExtension(fileName);
  return editableExtensions.has(extension) || !isBinaryFile(fileName);
}

/**
 * Get suggested files for auto-completion
 */
export function getSuggestedFiles(currentPath: string, tree: FileNode[], query: string): FileNode[] {
  const allFiles = getAllFilePaths(tree, true);
  const currentDir = currentPath.split('/').slice(0, -1).join('/');
  
  return allFiles
    .filter(path => path.toLowerCase().includes(query.toLowerCase()))
    .map(path => findFileInTree(tree, path))
    .filter((node): node is FileNode => node !== null)
    .slice(0, 10);
}

/**
 * Generate unique file name if conflicts exist
 */
export function generateUniqueFileName(baseName: string, existingFiles: string[]): string {
  let counter = 1;
  let fileName = baseName;
  
  while (existingFiles.includes(fileName)) {
    const extension = baseName.split('.').pop();
    const nameWithoutExt = baseName.replace(/\.[^/.]+$/, '');
    
    if (extension && extension !== baseName) {
      fileName = `${nameWithoutExt} (${counter}).${extension}`;
    } else {
      fileName = `${baseName} (${counter})`;
    }
    
    counter++;
  }
  
  return fileName;
}

/**
 * Extract imports from file content
 */
export function extractImports(content: string, language: string): string[] {
  const imports: string[] = [];
  
  if (language === 'javascript' || language === 'typescript') {
    // Match import statements
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    // Match require statements
    const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
  } else if (language === 'python') {
    // Match Python imports
    const importRegex = /(?:from\s+(\S+)\s+import|import\s+(\S+))/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1] || match[2]);
    }
  }
  
  return [...new Set(imports)]; // Remove duplicates
}

/**
 * Get file dependencies based on imports
 */
export function getFileDependencies(node: FileNode, tree: FileNode[]): FileNode[] {
  if (!node.content) return [];
  
  const imports = extractImports(node.content, node.language || '');
  const dependencies: FileNode[] = [];
  
  for (const importPath of imports) {
    // Skip external packages (don't start with . or /)
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      continue;
    }
    
    // Resolve relative imports
    const resolvedPath = resolveImportPath(node.path, importPath);
    const dependency = findFileInTree(tree, resolvedPath);
    
    if (dependency) {
      dependencies.push(dependency);
    }
  }
  
  return dependencies;
}

/**
 * Resolve relative import path
 */
function resolveImportPath(currentFilePath: string, importPath: string): string {
  const currentDir = currentFilePath.split('/').slice(0, -1).join('/');
  
  if (importPath.startsWith('./')) {
    return `${currentDir}/${importPath.slice(2)}`;
  } else if (importPath.startsWith('../')) {
    const parts = currentDir.split('/');
    const upLevels = (importPath.match(/\.\.\//g) || []).length;
    const resolvedDir = parts.slice(0, -upLevels).join('/');
    const relativePath = importPath.replace(/\.\.\//g, '');
    return `${resolvedDir}/${relativePath}`;
  } else if (importPath.startsWith('/')) {
    return importPath;
  }
  
  return `${currentDir}/${importPath}`;
}