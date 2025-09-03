import React from 'react';
import { FileNode } from '../../types';
import { FileTreeItem } from './FileTreeItem';

interface FileTreeProps {
  files: FileNode[];
  level?: number;
}

export const FileTree: React.FC<FileTreeProps> = ({ files, level = 0 }) => {
  return (
    <div className="select-none">
      {files.map((file) => (
        <FileTreeItem key={file.id} file={file} level={level} />
      ))}
    </div>
  );
};