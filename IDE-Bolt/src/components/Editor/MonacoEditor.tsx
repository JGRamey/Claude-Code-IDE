import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useWorkspaceStore } from '../../store/workspace';
import { fileSystemService } from '../../services/fileSystem';

export const MonacoEditor: React.FC = () => {
  const { editor, updateFileContent } = useWorkspaceStore();
  const editorRef = useRef<any>(null);

  const activeFile = editor.openFiles.find(f => f.id === editor.activeFileId);

  const getLanguage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      md: 'markdown',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rs: 'rust',
      php: 'php',
      rb: 'ruby',
      yml: 'yaml',
      yaml: 'yaml',
      xml: 'xml',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Add custom keybindings
    editor.addCommand(
      editor.KeyMod.CtrlCmd | editor.KeyCode.KeyS,
      () => {
        if (activeFile) {
          saveFile();
        }
      }
    );
  };

  const saveFile = async () => {
    if (activeFile && editorRef.current) {
      const content = editorRef.current.getValue();
      const success = await fileSystemService.writeFile(activeFile.path, content);
      if (success) {
        updateFileContent(activeFile.path, content);
      }
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFileContent(activeFile.path, value);
    }
  };

  if (!activeFile) {
    return null;
  }

  return (
    <div className="h-full">
      <Editor
        height="100%"
        language={getLanguage(activeFile.name)}
        value={activeFile.content || ''}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={editor.theme === 'dark' ? 'vs-dark' : 'light'}
        options={{
          fontSize: 14,
          fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
          lineNumbers: 'on',
          minimap: { enabled: true },
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          renderLineHighlight: 'all',
          selectOnLineNumbers: true,
          matchBrackets: 'always',
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: true,
          trimAutoWhitespace: true,
          dragAndDrop: true,
          links: true,
          colorDecorators: true,
          lightbulb: { enabled: true },
          contextmenu: true,
          mouseWheelZoom: true,
          multiCursorModifier: 'ctrlCmd',
          accessibilitySupport: 'auto',
        }}
      />
    </div>
  );
};