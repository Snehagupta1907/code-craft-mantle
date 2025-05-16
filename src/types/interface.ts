export interface Message {
    id: number;
    role: string;
    content: string;
  }
  
  export interface FileNode {
    type: 'file' | 'folder';
    name: string;
    path?: string;
    children?: FileNode[];
  }