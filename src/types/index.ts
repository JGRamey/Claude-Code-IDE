export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

export interface EditorState {
  openFiles: FileNode[];
  activeFileId: string | null;
  theme: 'dark' | 'light';
}

export interface TerminalState {
  isOpen: boolean;
  output: string[];
  currentCommand: string;
}

export interface WorkspaceState {
  projectName: string;
  rootPath: string;
  files: FileNode[];
  editor: EditorState;
  terminal: TerminalState;
}

export interface AIAssistant {
  isActive: boolean;
  suggestions: string[];
  currentQuery: string;
}