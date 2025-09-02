import { FileNode } from '../types';

class FileSystemService {
  private baseUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api`;

  async readDirectory(path: string): Promise<FileNode[]> {
    try {
      const response = await fetch(`${this.baseUrl}/files?path=${encodeURIComponent(path)}`);
      if (!response.ok) throw new Error('Failed to read directory');
      return await response.json();
    } catch (error) {
      console.error('Error reading directory:', error);
      return [];
    }
  }

  async readFile(path: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/files/content?path=${encodeURIComponent(path)}`);
      if (!response.ok) throw new Error('Failed to read file');
      const result = await response.json();
      return result.content;
    } catch (error) {
      console.error('Error reading file:', error);
      return '';
    }
  }

  async writeFile(path: string, content: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/files/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error writing file:', error);
      return false;
    }
  }

  async createFile(path: string, type: 'file' | 'folder'): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, type }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error creating file:', error);
      return false;
    }
  }

  async deleteFile(path: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/files`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  async renameFile(oldPath: string, newPath: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/files/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPath, newPath }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error renaming file:', error);
      return false;
    }
  }
}

export const fileSystemService = new FileSystemService();