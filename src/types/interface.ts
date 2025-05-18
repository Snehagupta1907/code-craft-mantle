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

  export interface ModificationChange {
    type: 'update';
    content: string;
  }

  export interface ModificationResponse {
    type: 'modification';
    fileStructure?: FileNode[];
    changes: Record<string, ModificationChange>;
  }

  export interface NewProjectResponse {
    type: 'new_project';
    fileStructure: FileNode[];
    files: Record<string, string | { content: string }>;
  }

  export interface ContractData {
    bytecode: string;
    abi: any;
    contractName: string;
  }