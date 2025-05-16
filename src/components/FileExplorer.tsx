/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';

interface FileNode {
  type: 'file' | 'folder';
  name: string;
  path?: string;
  children?: FileNode[];
}

interface FileTreeProps {
  node: FileNode;
  depth?: number;
  selectedFile: string;
  onFileSelect: (path: string) => void;
}

interface FileExplorerProps {
  files: FileNode[];
  selectedFile: string;
  onFileSelect: (path: string) => void;
}

const getFileIcon = (fileName: string, isSelected: boolean) => {
  const isSolidityFile = fileName.endsWith('.sol');
  const iconColor = isSelected
    ? 'text-claude-purple'
    : isSolidityFile
    ? 'text-yellow-500'
    : 'text-gray-500';

  return <File size={16} className={`mr-2 ${iconColor}`} />;
};

const FileTree = ({ node, depth = 0, selectedFile, onFileSelect }: FileTreeProps) => {
  const [isOpen, setIsOpen] = useState(true);

  if (node.type === 'file') {
    const isSelected = selectedFile === node.path;
    const isSolidityFile = node.name.endsWith('.sol');

    return (
      <div
        className={`flex items-center py-1 px-2 cursor-pointer hover:bg-gray-100 transition-colors rounded-md ${
          isSelected ? 'bg-gray-100 text-claude-purple' : 'text-gray-700'
        }`}
        style={{ paddingLeft: `${depth * 12}px` }}
        onClick={() => node.path && onFileSelect(node.path)}
      >
        {getFileIcon(node.name, isSelected)}
        <span className="text-sm truncate">
          {node.name}
          {isSolidityFile && <span className="ml-1 text-xs text-yellow-500">[Solidity]</span>}
        </span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center py-1 px-2 cursor-pointer hover:bg-gray-100 transition-colors rounded-md"
        style={{ paddingLeft: `${depth * 12}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown size={16} className="mr-1 text-gray-500" />
        ) : (
          <ChevronRight size={16} className="mr-1 text-gray-500" />
        )}
        <Folder size={16} className="mr-2 text-claude-purple-light" />
        <span className="text-sm font-medium text-gray-700">{node.name}</span>
      </div>
      {isOpen &&
        node.children &&
        [...node.children]
          .sort((a, _b) => (a.type === 'folder' ? -1 : 1))
          .map((child, idx) => (
            <FileTree
              key={idx}
              node={child}
              depth={depth + 1}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
            />
          ))}
    </div>
  );
};

export default function FileExplorer({ files, selectedFile, onFileSelect }: FileExplorerProps) {
  return (
    <div className="h-full overflow-y-auto bg-claude-sidebar border-r border-claude-border">
      <div className="p-3 border-b border-claude-border">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Explorer</h2>
      </div>
      <div className="p-2">
        {files.map((node, idx) => (
          <FileTree
            key={idx}
            node={node}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
          />
        ))}
      </div>
    </div>
  );
}
