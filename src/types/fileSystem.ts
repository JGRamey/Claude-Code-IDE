// File system types for the Claude Code IDE

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  parentPath?: string;
  children?: FileNode[];
  content?: string;
  size?: number;
  lastModified?: Date;
  isExpanded?: boolean;
  isSelected?: boolean;
  language?: string;
  encoding?: string;
}

export interface FileTreeState {
  nodes: Record<string, FileNode>;
  rootNodes: string[];
  selectedNode?: string;
  openFiles: string[];
  activeFile?: string;
}

export interface FileOperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface CreateFileOptions {
  path: string;
  content?: string;
  overwrite?: boolean;
}

export interface CreateDirectoryOptions {
  path: string;
  recursive?: boolean;
}

export interface RenameOptions {
  oldPath: string;
  newPath: string;
}

export interface CopyOptions {
  sourcePath: string;
  destinationPath: string;
  overwrite?: boolean;
}

export interface MoveOptions {
  sourcePath: string;
  destinationPath: string;
  overwrite?: boolean;
}

export interface DeleteOptions {
  path: string;
  recursive?: boolean;
  force?: boolean;
}

export interface FileSearchOptions {
  query: string;
  includeContent?: boolean;
  fileTypes?: string[];
  excludePatterns?: string[];
  caseSensitive?: boolean;
}

export interface FileSearchResult {
  path: string;
  matches: {
    line: number;
    column: number;
    text: string;
    preview: string;
  }[];
}

export interface WatcherEvent {
  type: 'create' | 'update' | 'delete' | 'rename';
  path: string;
  oldPath?: string;
  timestamp: Date;
}

export interface FileSystemContext {
  fileTree: FileTreeState;
  openFile: (path: string) => Promise<void>;
  closeFile: (path: string) => void;
  createFile: (options: CreateFileOptions) => Promise<FileOperationResult>;
  createDirectory: (options: CreateDirectoryOptions) => Promise<FileOperationResult>;
  deleteFile: (options: DeleteOptions) => Promise<FileOperationResult>;
  renameFile: (options: RenameOptions) => Promise<FileOperationResult>;
  copyFile: (options: CopyOptions) => Promise<FileOperationResult>;
  moveFile: (options: MoveOptions) => Promise<FileOperationResult>;
  searchFiles: (options: FileSearchOptions) => Promise<FileSearchResult[]>;
  refreshTree: () => Promise<void>;
  selectNode: (path: string) => void;
  expandNode: (path: string) => void;
  collapseNode: (path: string) => void;
  watchFiles: (callback: (event: WatcherEvent) => void) => () => void;
}

export interface FileEditorState {
  path: string;
  content: string;
  originalContent: string;
  isDirty: boolean;
  cursor: {
    line: number;
    column: number;
  };
  selection?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
  scrollPosition: {
    top: number;
    left: number;
  };
  language: string;
}

export interface TabState {
  path: string;
  name: string;
  isDirty: boolean;
  isPinned: boolean;
  isActive: boolean;
}

export type FileSystemError = 
  | 'FILE_NOT_FOUND'
  | 'DIRECTORY_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'FILE_EXISTS'
  | 'DIRECTORY_EXISTS'
  | 'INVALID_PATH'
  | 'OPERATION_FAILED'
  | 'WATCH_ERROR';