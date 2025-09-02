import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FileNode, WorkspaceState, EditorState, TerminalState } from '../types';

interface WorkspaceStore extends WorkspaceState {
  // File operations
  addFile: (parentPath: string, name: string, type: 'file' | 'folder') => void;
  deleteFile: (path: string) => void;
  renameFile: (path: string, newName: string) => void;
  updateFileContent: (path: string, content: string) => void;
  toggleFolder: (path: string) => void;
  
  // Editor operations
  openFile: (file: FileNode) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  
  // Terminal operations
  toggleTerminal: () => void;
  addTerminalOutput: (output: string) => void;
  setCurrentCommand: (command: string) => void;
  clearTerminal: () => void;
  
  // Workspace operations
  setProjectName: (name: string) => void;
  initializeWorkspace: (files: FileNode[]) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      projectName: 'Claude Code Project',
      rootPath: '/home/project',
      files: [],
      editor: {
        openFiles: [],
        activeFileId: null,
        theme: 'dark',
      },
      terminal: {
        isOpen: false,
        output: ['Welcome to Claude-Code IDE Terminal'],
        currentCommand: '',
      },

      addFile: (parentPath, name, type) => {
        const newFile: FileNode = {
          id: generateId(),
          name,
          type,
          path: `${parentPath}/${name}`,
          content: type === 'file' ? '' : undefined,
          children: type === 'folder' ? [] : undefined,
          isOpen: false,
        };

        set((state) => ({
          files: addFileToTree(state.files, parentPath, newFile),
        }));
      },

      deleteFile: (path) => {
        set((state) => ({
          files: removeFileFromTree(state.files, path),
          editor: {
            ...state.editor,
            openFiles: state.editor.openFiles.filter(f => !f.path.startsWith(path)),
            activeFileId: state.editor.activeFileId && 
              state.editor.openFiles.find(f => f.id === state.editor.activeFileId)?.path.startsWith(path)
              ? null : state.editor.activeFileId,
          },
        }));
      },

      renameFile: (path, newName) => {
        set((state) => ({
          files: renameFileInTree(state.files, path, newName),
        }));
      },

      updateFileContent: (path, content) => {
        set((state) => ({
          files: updateFileContentInTree(state.files, path, content),
          editor: {
            ...state.editor,
            openFiles: state.editor.openFiles.map(f => 
              f.path === path ? { ...f, content } : f
            ),
          },
        }));
      },

      toggleFolder: (path) => {
        set((state) => ({
          files: toggleFolderInTree(state.files, path),
        }));
      },

      openFile: (file) => {
        set((state) => {
          const isAlreadyOpen = state.editor.openFiles.some(f => f.id === file.id);
          if (isAlreadyOpen) {
            return { editor: { ...state.editor, activeFileId: file.id } };
          }
          
          return {
            editor: {
              ...state.editor,
              openFiles: [...state.editor.openFiles, file],
              activeFileId: file.id,
            },
          };
        });
      },

      closeFile: (fileId) => {
        set((state) => {
          const openFiles = state.editor.openFiles.filter(f => f.id !== fileId);
          const activeFileId = state.editor.activeFileId === fileId 
            ? (openFiles.length > 0 ? openFiles[openFiles.length - 1].id : null)
            : state.editor.activeFileId;
          
          return {
            editor: {
              ...state.editor,
              openFiles,
              activeFileId,
            },
          };
        });
      },

      setActiveFile: (fileId) => {
        set((state) => ({
          editor: { ...state.editor, activeFileId: fileId },
        }));
      },

      setTheme: (theme) => {
        set((state) => ({
          editor: { ...state.editor, theme },
        }));
      },

      toggleTerminal: () => {
        set((state) => ({
          terminal: { ...state.terminal, isOpen: !state.terminal.isOpen },
        }));
      },

      addTerminalOutput: (output) => {
        set((state) => ({
          terminal: {
            ...state.terminal,
            output: [...state.terminal.output, output],
          },
        }));
      },

      setCurrentCommand: (command) => {
        set((state) => ({
          terminal: { ...state.terminal, currentCommand: command },
        }));
      },

      clearTerminal: () => {
        set((state) => ({
          terminal: { ...state.terminal, output: ['Terminal cleared'] },
        }));
      },

      setProjectName: (name) => {
        set({ projectName: name });
      },

      initializeWorkspace: (files) => {
        set({ files });
      },
    }),
    {
      name: 'claude-code-workspace',
      partialize: (state) => ({
        projectName: state.projectName,
        editor: state.editor,
        terminal: { ...state.terminal, output: ['Welcome to Claude-Code IDE Terminal'] },
      }),
    }
  )
);

// Helper functions
function addFileToTree(files: FileNode[], parentPath: string, newFile: FileNode): FileNode[] {
  if (parentPath === '/home/project') {
    return [...files, newFile];
  }
  
  return files.map(file => {
    if (file.path === parentPath && file.type === 'folder' && file.children) {
      return { ...file, children: [...file.children, newFile] };
    }
    if (file.children) {
      return { ...file, children: addFileToTree(file.children, parentPath, newFile) };
    }
    return file;
  });
}

function removeFileFromTree(files: FileNode[], path: string): FileNode[] {
  return files.filter(file => file.path !== path).map(file => {
    if (file.children) {
      return { ...file, children: removeFileFromTree(file.children, path) };
    }
    return file;
  });
}

function renameFileInTree(files: FileNode[], path: string, newName: string): FileNode[] {
  return files.map(file => {
    if (file.path === path) {
      const newPath = file.path.replace(file.name, newName);
      return { ...file, name: newName, path: newPath };
    }
    if (file.children) {
      return { ...file, children: renameFileInTree(file.children, path, newName) };
    }
    return file;
  });
}

function updateFileContentInTree(files: FileNode[], path: string, content: string): FileNode[] {
  return files.map(file => {
    if (file.path === path) {
      return { ...file, content };
    }
    if (file.children) {
      return { ...file, children: updateFileContentInTree(file.children, path, content) };
    }
    return file;
  });
}

function toggleFolderInTree(files: FileNode[], path: string): FileNode[] {
  return files.map(file => {
    if (file.path === path && file.type === 'folder') {
      return { ...file, isOpen: !file.isOpen };
    }
    if (file.children) {
      return { ...file, children: toggleFolderInTree(file.children, path) };
    }
    return file;
  });
}