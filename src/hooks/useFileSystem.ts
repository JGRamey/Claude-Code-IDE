import { useState, useEffect, useCallback, useRef } from 'react';
import { FileNode, FileOperation } from '../types';
import { fileService } from '../services/fileService';
import { useAppStore } from '../stores';
import Fuse from 'fuse.js';
import { watch } from 'chokidar';

interface UseFileSystemReturn {
  fileTree: FileNode[];
  expandedFolders: Set<string>;
  isLoading: boolean;
  error: string | null;
  createFile: (parentPath: string, name: string, content?: string) => Promise<FileNode>;
  createFolder: (parentPath: string, name: string) => Promise<FileNode>;
  deleteNode: (path: string) => Promise<void>;
  renameNode: (path: string, newName: string) => Promise<FileNode>;
  moveNode: (fromPath: string, toPath: string) => Promise<FileNode>;
  saveFile: (path: string, content: string) => Promise<void>;
  loadFile: (path: string) => Promise<string>;
  refreshTree: () => Promise<void>;
  toggleFolder: (path: string) => void;
  searchFiles: (query: string, includeHidden?: boolean) => FileNode[];
  getFileHistory: (path: string) => FileOperation[];
  watchFile: (path: string, callback: (content: string) => void) => () => void;
  bulkOperation: (operations: FileOperation[]) => Promise<void>;
}

export function useFileSystem(): UseFileSystemReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileOperations, setFileOperations] = useState<FileOperation[]>([]);
  const [fileWatchers, setFileWatchers] = useState<Map<string, any>>(new Map());
  
  const fuseRef = useRef<Fuse<FileNode> | null>(null);
  const watcherRef = useRef<any>(null);
  
  const {
    fileTree,
    expandedFolders,
    setFileTree,
    toggleFolder: storeToggleFolder,
    updateFileContent,
    addError
  } = useAppStore();

  // Initialize file system watcher
  useEffect(() => {
    initializeWatcher();
    return () => {
      if (watcherRef.current) {
        watcherRef.current.close();
      }
    };
  }, []);

  // Initialize search index when file tree changes
  useEffect(() => {
    const flattenFiles = (nodes: FileNode[]): FileNode[] => {
      const result: FileNode[] = [];
      
      const traverse = (node: FileNode) => {
        result.push(node);
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      
      nodes.forEach(traverse);
      return result;
    };

    const flatFiles = flattenFiles(fileTree);
    fuseRef.current = new Fuse(flatFiles, {
      keys: ['name', 'path', 'content'],
      threshold: 0.3,
      includeScore: true
    });
  }, [fileTree]);

  const initializeWatcher = useCallback(() => {
    try {
      watcherRef.current = watch('.', {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true,
        followSymlinks: false
      });

      watcherRef.current
        .on('add', (path: string) => {
          console.log('File added:', path);
          refreshTree();
        })
        .on('change', (path: string) => {
          console.log('File changed:', path);
          handleFileChange(path);
        })
        .on('unlink', (path: string) => {
          console.log('File removed:', path);
          refreshTree();
        })
        .on('addDir', (path: string) => {
          console.log('Directory added:', path);
          refreshTree();
        })
        .on('unlinkDir', (path: string) => {
          console.log('Directory removed:', path);
          refreshTree();
        })
        .on('error', (error: Error) => {
          console.error('Watcher error:', error);
          setError(error.message);
        });

    } catch (err) {
      console.error('Failed to initialize file watcher:', err);
    }
  }, []);

  const handleFileChange = useCallback(async (path: string) => {
    try {
      const content = await loadFile(path);
      updateFileContent(path, content);
      
      // Notify file watchers
      const callback = fileWatchers.get(path);
      if (callback) {
        callback(content);
      }
    } catch (err) {
      console.error('Failed to handle file change:', err);
    }
  }, [fileWatchers, updateFileContent]);

  const createFile = useCallback(async (parentPath: string, name: string, content = ''): Promise<FileNode> => {
    setIsLoading(true);
    setError(null);

    try {
      const newFile = await fileService.createFile(parentPath, name, content);
      
      const operation: FileOperation = {
        type: 'create',
        path: newFile.path,
        content,
        timestamp: new Date().toISOString()
      };
      
      setFileOperations(prev => [operation, ...prev]);
      await refreshTree();
      
      return newFile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create file';
      setError(errorMessage);
      addError({
        id: Date.now().toString(),
        type: 'file-system',
        severity: 'medium',
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [addError]);

  const createFolder = useCallback(async (parentPath: string, name: string): Promise<FileNode> => {
    setIsLoading(true);
    setError(null);

    try {
      const newFolder = await fileService.createFolder(parentPath, name);
      
      const operation: FileOperation = {
        type: 'create',
        path: newFolder.path,
        timestamp: new Date().toISOString()
      };
      
      setFileOperations(prev => [operation, ...prev]);
      await refreshTree();
      
      return newFolder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create folder';
      setError(errorMessage);
      addError({
        id: Date.now().toString(),
        type: 'file-system',
        severity: 'medium',
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [addError]);

  const deleteNode = useCallback(async (path: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await fileService.deleteNode(path);
      
      const operation: FileOperation = {
        type: 'delete',
        path,
        timestamp: new Date().toISOString()
      };
      
      setFileOperations(prev => [operation, ...prev]);
      await refreshTree();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete';
      setError(errorMessage);
      addError({
        id: Date.now().toString(),
        type: 'file-system',
        severity: 'medium',
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [addError]);

  const renameNode = useCallback(async (path: string, newName: string): Promise<FileNode> => {
    setIsLoading(true);
    setError(null);

    try {
      const renamedNode = await fileService.renameNode(path, newName);
      
      const operation: FileOperation = {
        type: 'rename',
        path,
        newPath: renamedNode.path,
        timestamp: new Date().toISOString()
      };
      
      setFileOperations(prev => [operation, ...prev]);
      await refreshTree();
      
      return renamedNode;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rename';
      setError(errorMessage);
      addError({
        id: Date.now().toString(),
        type: 'file-system',
        severity: 'medium',
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [addError]);

  const moveNode = useCallback(async (fromPath: string, toPath: string): Promise<FileNode> => {
    setIsLoading(true);
    setError(null);

    try {
      const movedNode = await fileService.moveNode(fromPath, toPath);
      
      const operation: FileOperation = {
        type: 'move',
        path: fromPath,
        newPath: toPath,
        timestamp: new Date().toISOString()
      };
      
      setFileOperations(prev => [operation, ...prev]);
      await refreshTree();
      
      return movedNode;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move';
      setError(errorMessage);
      addError({
        id: Date.now().toString(),
        type: 'file-system',
        severity: 'medium',
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [addError]);

  const saveFile = useCallback(async (path: string, content: string): Promise<void> => {
    try {
      await fileService.saveFile(path, content);
      
      const operation: FileOperation = {
        type: 'modify',
        path,
        content,
        timestamp: new Date().toISOString()
      };
      
      setFileOperations(prev => [operation, ...prev]);
      updateFileContent(path, content);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save file';
      setError(errorMessage);
      addError({
        id: Date.now().toString(),
        type: 'file-system',
        severity: 'high',
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      throw err;
    }
  }, [updateFileContent, addError]);

  const loadFile = useCallback(async (path: string): Promise<string> => {
    try {
      return await fileService.loadFile(path);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load file';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const refreshTree = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const tree = await fileService.getFileTree();
      setFileTree(tree);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh file tree';
      setError(errorMessage);
      addError({
        id: Date.now().toString(),
        type: 'file-system',
        severity: 'medium',
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  }, [setFileTree, addError]);

  const toggleFolder = useCallback((path: string) => {
    storeToggleFolder(path);
  }, [storeToggleFolder]);

  const searchFiles = useCallback((query: string, includeHidden = false): FileNode[] => {
    if (!query.trim() || !fuseRef.current) {
      return fileTree;
    }

    const results = fuseRef.current.search(query);
    let filteredResults = results.map(result => result.item);

    if (!includeHidden) {
      filteredResults = filteredResults.filter(file => !file.name.startsWith('.'));
    }

    return filteredResults;
  }, [fileTree]);

  const getFileHistory = useCallback((path: string): FileOperation[] => {
    return fileOperations.filter(op => op.path === path || op.newPath === path);
  }, [fileOperations]);

  const watchFile = useCallback((path: string, callback: (content: string) => void): (() => void) => {
    setFileWatchers(prev => new Map(prev.set(path, callback)));
    
    return () => {
      setFileWatchers(prev => {
        const newMap = new Map(prev);
        newMap.delete(path);
        return newMap;
      });
    };
  }, []);

  const bulkOperation = useCallback(async (operations: FileOperation[]): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await fileService.bulkOperation(operations);
      setFileOperations(prev => [...operations, ...prev]);
      await refreshTree();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bulk operation failed';
      setError(errorMessage);
      addError({
        id: Date.now().toString(),
        type: 'file-system',
        severity: 'high',
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [addError, refreshTree]);

  return {
    fileTree,
    expandedFolders,
    isLoading,
    error,
    createFile,
    createFolder,
    deleteNode,
    renameNode,
    moveNode,
    saveFile,
    loadFile,
    refreshTree,
    toggleFolder,
    searchFiles,
    getFileHistory,
    watchFile,
    bulkOperation
  };
}