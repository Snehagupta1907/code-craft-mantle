'use client';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { FileCode, Copy, Check } from 'lucide-react';
import type { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import React from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function Editor({ 
  selectedFile,
  fileContent,
  onFileChange 
}: {
  selectedFile: string;
  fileContent: string;
  onFileChange: (file: string, content: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  
  useEffect(() => {
    setLoading(false);
  }, []);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const getLanguage = (filename: string) => {
    if (!filename) return 'plaintext';

    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.sol')) return 'solidity';

    return 'plaintext';
  };

  const handleEditorDidMount: OnMount = async (editor, monaco) => {
    editorRef.current = editor;

    const lang = getLanguage(selectedFile);

    // Load React types for TS/JS
    if (lang === 'typescript' || lang === 'javascript') {
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false
      });

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ESNext,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        allowSyntheticDefaultImports: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types']
      });

      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        `declare module '@/*' {
          const content: any;
          export default content;
        }`,
        'file:///src/types/module-aliases.d.ts'
      );

      fetch('https://unpkg.com/@types/react@18.2.0/index.d.ts')
        .then((res) => res.text())
        .then((dts) => {
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            dts,
            'file:///node_modules/@types/react/index.d.ts'
          );
        });
    }

    // Register Solidity language
    if (lang === 'solidity') {
      monaco.languages.register({ id: 'solidity' });

      monaco.languages.setMonarchTokensProvider('solidity', {
        tokenizer: {
          root: [
            [/\b(contract|function|modifier|event|struct|enum|mapping|address|uint256|uint|bool|string|public|private|internal|external|view|pure|payable|returns|memory|storage|calldata|require|emit|assert|revert|if|else|for|while|do|break|continue|return|import|pragma|solidity)\b/, 'keyword'],
            [/[{}()\[\]]/, '@brackets'],
            [/[a-z_$][\w$]*/, 'identifier'],
            [/"[^"]*"/, 'string'],
            [/'[^']*'/, 'string'],
            [/\d+/, 'number'],
            [/\/\/.*$/, 'comment'],
            [/\/\*/, { token: 'comment', next: '@comment' }]
          ],
          comment: [
            [/[^\/*]+/, 'comment' ],
            [/\*\//, 'comment', '@pop' ],
            [/[\/*]/, 'comment' ]
          ]
        }
      });

      monaco.editor.defineTheme('sol-theme', {
        base: 'vs',
        inherit: true,
        rules: [{ token: 'keyword', foreground: 'ff7f00' }],
        colors: {}
      });

      monaco.editor.setTheme('sol-theme');
    }
  };

  const handleCopyCode = () => {
    if (fileContent) {
      navigator.clipboard.writeText(fileContent)
        .then(() => {
          setCopied(true);
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-editor-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-claude-purple border-t-transparent mb-3 mx-auto"></div>
          <p className="text-gray-500">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center bg-editor-bg">
        <div className="text-center">
          <FileCode size={40} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Select a file from the explorer to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      <div className="border-b border-claude-border bg-claude-sidebar px-4 py-2 text-sm font-medium flex items-center justify-between">
        <div className="flex items-center">
          <FileCode size={16} className="mr-2 text-claude-purple" />
          {selectedFile}
        </div>
        {fileContent && (
          <button
            onClick={handleCopyCode}
            className="ml-2 p-1 rounded hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-claude-purple focus:ring-opacity-50"
            title="Copy code"
          >
            {copied ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Copy size={16} className="text-gray-500" />
            )}
          </button>
        )}
      </div>
      <MonacoEditor
        height="calc(100% - 36px)"
        path={selectedFile}
        language={getLanguage(selectedFile)}
        value={fileContent}
        onChange={(value) => onFileChange(selectedFile, value || '')}
        theme="light"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          fontFamily: '"Fira Code", Menlo, Monaco, "Courier New", monospace',
          tabSize: 2,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 16 },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
        }}
      />
    </div>
  );
}