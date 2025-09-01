import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { FileTab } from './FileTab';
import { EditorToolbar } from './EditorToolbar';
import { useAppStore, selectFileState } from '../../stores';
import { useFileSystem } from '../../hooks/useFileSystem';
import { useHotkeys } from 'react-hotkeys-hook';
import { FileNode } from '../../types';
import { getFileLanguage } from '../../utils/fileHelpers';
import { 
  Save, 
  Copy, 
  Search, 
  Replace, 
  ZoomIn, 
  ZoomOut,
  Settings,
  GitBranch,
  AlertCircle
} from 'lucide-react';

interface CodeEditorProps {
  file?: FileNode | null;
}

export function CodeEditor({ file }: CodeEditorProps) {
  const [editorValue, setEditorValue] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [editorOptions, setEditorOptions] = useState({
    minimap: { enabled: true },
    wordWrap: 'on' as const,
    lineNumbers: 'on' as const,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    formatOnSave: true,
    formatOnPaste: true,
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    parameterHints: { enabled: true },
    codeLens: true,
    folding: true,
    foldingStrategy: 'indentation' as const,
    showFoldingControls: 'always' as const,
    bracketPairColorization: { enabled: true }
  });

  const editorRef = useRef<any>(null);
  const { 
    selectedFile, 
    openFiles, 
    updateFileContent, 
    addOpenFile, 
    removeOpenFile,
    settings 
  } = useAppStore();
  
  const { saveFile } = useFileSystem();

  // Update editor when file changes
  useEffect(() => {
    if (file) {
      setEditorValue(file.content || '');
      setHasUnsavedChanges(false);
      
      // Add to open files if not already open
      addOpenFile(file);
    }
  }, [file, addOpenFile]);

  // Apply settings to editor
  useEffect(() => {
    setEditorOptions(prev => ({
      ...prev,
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      tabSize: settings.tabSize,
      wordWrap: settings.wordWrap ? 'on' : 'off',
      minimap: { enabled: settings.minimap },
      lineNumbers: settings.lineNumbers ? 'on' : 'off'
    }));
  }, [settings]);

  // Handle editor change
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined && file) {
      setEditorValue(value);
      setHasUnsavedChanges(value !== file.content);
      
      // Auto-save if enabled
      if (settings.autoSave && value !== file.content) {
        const timeoutId = setTimeout(() => {
          handleSave(value);
        }, settings.autoSaveDelay);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [file, settings.autoSave, settings.autoSaveDelay]);

  // Save file
  const handleSave = useCallback(async (content = editorValue) => {
    if (!file) return;
    
    try {
      await saveFile(file.path, content);
      updateFileContent(file.path, content);
      setHasUnsavedChanges(false);
      
      // Show save confirmation briefly
      const editor = editorRef.current;
      if (editor) {
        editor.trigger('keyboard', 'editor.action.showHover', {});
      }
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  }, [file, editorValue, saveFile, updateFileContent]);

  // Format document
  const handleFormat = useCallback(() => {
    const editor = editorRef.current;
    if (editor) {
      editor.trigger('keyboard', 'editor.action.formatDocument', {});
    }
  }, []);

  // Copy content
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(editorValue);
  }, [editorValue]);

  // Editor mount handler
  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure TypeScript/JavaScript language features
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      typeRoots: ['node_modules/@types'],
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: 'React.createElement',
      allowSyntheticDefaultImports: true,
      esModuleInterop: true
    });

    // Add Claude Code specific commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP, () => {
      // Open Claude Code command palette
      setShowFindReplace(true);
    });

    // Add custom themes
    monaco.editor.defineTheme('claude-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' }
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6'
      }
    });

    monaco.editor.setTheme('claude-dark');
  }, [handleSave]);

  // Keyboard shortcuts
  useHotkeys('ctrl+s, cmd+s', (e) => {
    e.preventDefault();
    handleSave();
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+f, cmd+f', (e) => {
    e.preventDefault();
    setShowFindReplace(true);
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+shift+f, cmd+shift+f', (e) => {
    e.preventDefault();
    handleFormat();
  }, { enableOnFormTags: true });

  const sendCommand = useCallback(async (instruction: string, context?: any): Promise<string> => {
    if (!claudeCodeRef.current) {
      throw new Error('Claude Code CLI not initialized');
    }

    setIsProcessing(true);
    
    try {
      const response = await claudeCodeRef.current.sendCommand(instruction, {
        selectedFile,
        openFiles,
        currentContent: editorValue,
        ...context
      });
      
      return response;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, openFiles, editorValue]);

  const configureAgents = useCallback(async (config: any): Promise<void> => {
    if (claudeCodeRef.current) {
      await claudeCodeRef.current.configureAgents(config);
    }
  }, []);

  const updateWorkflow = useCallback(async (workflow: any): Promise<void> => {
    if (claudeCodeRef.current) {
      await claudeCodeRef.current.updateWorkflow(workflow);
    }
  }, []);

  const restartService = useCallback(async (): Promise<void> => {
    setClaudeCodeStatus('initializing');
    
    if (claudeCodeRef.current) {
      await claudeCodeRef.current.shutdown();
    }
    
    // Re-initialize
    setTimeout(async () => {
      try {
        const claudeCode = new ClaudeCodeCLI(process.cwd());
        claudeCodeRef.current = claudeCode;
        await claudeCode.initialize();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setClaudeCodeStatus('error');
      }
    }, 1000);
  }, []);

  const getAgentStatus = useCallback((): Agent[] => {
    return claudeCodeRef.current?.getAgentStatuses() || [];
  }, []);

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 text-gray-400">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No file selected</p>
          <p className="text-sm">Choose a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  const language = getFileLanguage(file.name);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* File Tabs */}
      <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center overflow-x-auto">
        {openFiles.map((openFile) => (
          <FileTab
            key={openFile.path}
            file={openFile}
            isActive={selectedFile?.path === openFile.path}
            hasUnsavedChanges={openFile.modified}
            onSelect={() => useAppStore.getState().setSelectedFile(openFile)}
            onClose={() => removeOpenFile(openFile.path)}
          />
        ))}
      </div>

      {/* Editor Toolbar */}
      <EditorToolbar
        file={file}
        hasUnsavedChanges={hasUnsavedChanges}
        isProcessing={isProcessing}
        claudeCodeStatus={claudeCodeStatus}
        onSave={() => handleSave()}
        onFormat={handleFormat}
        onCopy={handleCopy}
        onToggleFindReplace={() => setShowFindReplace(!showFindReplace)}
        onZoomIn={() => setFontSize(prev => Math.min(prev + 2, 24))}
        onZoomOut={() => setFontSize(prev => Math.max(prev - 2, 10))}
      />

      {/* Find/Replace Panel */}
      {showFindReplace && (
        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Find"
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white w-48"
            />
          </div>
          <div className="flex items-center gap-2">
            <Replace className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Replace"
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white w-48"
            />
          </div>
          <button
            onClick={() => setShowFindReplace(false)}
            className="ml-auto p-1 hover:bg-gray-700 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          value={editorValue}
          language={language}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="claude-dark"
          options={{
            ...editorOptions,
            fontSize
          }}
          loading={
            <div className="h-full flex items-center justify-center bg-gray-900">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          }
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-4 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-gray-400">
            {language.toUpperCase()} • Line 1, Column 1
          </span>
          {hasUnsavedChanges && (
            <span className="flex items-center gap-1 text-yellow-400">
              <AlertCircle className="w-3 h-3" />
              Unsaved changes
            </span>
          )}
          {file.gitStatus !== 'unmodified' && (
            <span className="flex items-center gap-1 text-blue-400">
              <GitBranch className="w-3 h-3" />
              {file.gitStatus}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-gray-400">
            {claudeCodeStatus === 'connected' ? '🟢 Claude Code' : '🔴 Disconnected'}
          </span>
          <span className="text-gray-400">UTF-8</span>
          <span className="text-gray-400">LF</span>
        </div>
      </div>

      {/* Claude Code Integration Indicator */}
      {isProcessing && (
        <div className="absolute top-16 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg z-10">
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span className="text-sm">Claude Code is working...</span>
          </div>
        </div>
      )}
    </div>
  );
}