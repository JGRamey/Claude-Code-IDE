import React from 'react';
import { MonacoEditor } from './MonacoEditor';
import { EditorTabs } from './EditorTabs';
import { WelcomeScreen } from './WelcomeScreen';
import { useWorkspaceStore } from '../../store/workspace';

export const EditorPanel: React.FC = () => {
  const { editor } = useWorkspaceStore();

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Tabs */}
      {editor.openFiles.length > 0 && (
        <div className="border-b border-gray-700">
          <EditorTabs />
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1">
        {editor.activeFileId ? (
          <MonacoEditor />
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );
};