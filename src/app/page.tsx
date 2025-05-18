/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import Chat from "../components/Chat";
import Editor from "../components/Editor";
import FileExplorer from "../components/FileExplorer";
// import CodePreview from "../components/CodePreview";
import {
  Code2,
  Github,
  Download,
  Eye,
  Code,
  Clipboard,
  Check,
} from "lucide-react";
import { ConnectButton } from "../components/ConnectWallet";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

import { type FileNode, type Message } from "../types/interface";
import React from "react";

export default function Home() {
  // State for chat
  const [messages, setMessages] = useState<Message[]>([]);

  // State for files
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);
  const [files, setFiles] = useState<Record<string, { content: string }>>({});
  const [selectedFile, setSelectedFile] = useState<string | null>("");
  const [previewFiles, setPreviewFiles] = useState<
    Record<string, { code: string }>
  >({});

  // State for UI mode
  const [hasStarted, setHasStarted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State for Solidity compilation
  const [bytecode, setBytecode] = useState<string | null>(null);
  const [compilationError, setCompilationError] = useState<string | null>(null);
  const [abi, setAbi] = useState<any | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isConnected } = useAccount();

  type NormalizedFiles = Record<string, { content: string }>;

  const getPreviewFiles = (
    normalizedFiles: NormalizedFiles
  ): Record<string, { code: string }> => {
    const previewFiles: Record<string, { code: string }> = {};

    Object.entries(normalizedFiles).forEach(([filePath, fileData]) => {
      // Sandpack expects file paths to start with "/"
      const normalizedPath = filePath.startsWith("/")
        ? filePath
        : `/${filePath}`;

      previewFiles[normalizedPath] = {
        code: fileData.content,
      };
    });

    return previewFiles;
  };

  useEffect(() => {
    if (hasStarted && fileStructure.length === 0) {
      console.log("Loading empty file structure...");
    }
  }, [hasStarted, fileStructure.length]);

  // Handle file selection
  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);

    setBytecode(null);
    setAbi(null);
    setCompilationError(null);
  };

  // Handle file content changes
  const handleFileChange = (filePath: string, content: string) => {
    setFiles((prev) => ({
      ...prev,
      [filePath]: { content },
    }));

    // Reset compilation results when file content changes
    if (filePath.endsWith(".sol")) {
      setBytecode(null);
      setAbi(null);
      setCompilationError(null);
    }
  };

  const isSolidityFile = selectedFile?.endsWith(".sol") || false;

  const compileSolidity = async () => {
    if (!selectedFile || !isSolidityFile) return;

    setCompiling(true);
    setBytecode(null);
    setCompilationError(null);

    try {
      const response = await fetch("/api/compileSolidity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceCode: files[selectedFile].content,
        }),
      });

      const data = await response.json();
      console.log({ data });

      if (!response.ok) {
        setCompilationError(data.error || "Failed to compile Solidity code");
      } else {
        setBytecode(data.bytecode);
        setAbi(data.abi);
      }
    } catch (error: unknown) {
      setCompilationError(
        error instanceof Error
          ? error.message
          : "An error occurred during compilation"
      );
    } finally {
      setCompiling(false);
    }
  };

  // for file structure and content
  const parseAIResponse = (content: string) => {
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);

      if (jsonMatch && jsonMatch[1]) {
        const projectData = JSON.parse(jsonMatch[1]);

        if (projectData.fileStructure && projectData.files) {
          setFileStructure(projectData.fileStructure);
          const normalizedFiles: Record<string, { content: string }> = {};

          Object.keys(projectData.files).forEach((filePath) => {
            const fileData = projectData.files[filePath];

            // Case 1: If file data is already a string, use directly
            if (typeof fileData === "string") {
              normalizedFiles[filePath] = { content: fileData };
            }
            // Case 2: If file has a content property
            else if (fileData && fileData.content) {
              normalizedFiles[filePath] = fileData;
            }
            // Case 3: If file is an object with key-value pairs
            else if (typeof fileData === "object") {
              const lines = Object.keys(fileData).map((key) => {
                const value = fileData[key];
                return value ? `${key}${value}` : key;
              });
              normalizedFiles[filePath] = { content: lines.join("\n") };
            }
            // Fallback case
            else {
              normalizedFiles[filePath] = { content: JSON.stringify(fileData) };
            }
          });

          console.log({ normalizedFiles });
          setFiles(normalizedFiles);

          const previewFiles = getPreviewFiles(normalizedFiles);
          setPreviewFiles(previewFiles);
          console.log({ previewFiles });

          // Select the first file by default if available
          if (
            projectData.fileStructure[0]?.children?.[0]?.children?.[0]?.path
          ) {
            setSelectedFile(
              projectData.fileStructure[0].children[0].children[0].path
            );
          }

          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return false;
    }
  };

  console.log({ messages, files, fileStructure });

  // Handle sending messages
  const handleSendMessage = async (content: string) => {
    const newMessage = { id: Date.now(), role: "user", content };

    setMessages((prev) => [...prev, newMessage]);

    if (!hasStarted) {
      setHasStarted(true);
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            { role: "user", content },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from API");
      }

      const data = await response.json();
      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.message.content,
      };

      setMessages((prev) => [...prev, aiMessage]);

      const parsedSuccessfully = parseAIResponse(data.message.content);

      if (!parsedSuccessfully && messages.length === 0) {
        const structureResponse = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              ...messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
              { role: "user", content },
              { role: "assistant", content: data.message.content },
              {
                role: "user",
                content:
                  'Please provide the project file structure and code as JSON. Include a "fileStructure" array and a "files" object with file contents.',
              },
            ],
          }),
        });

        if (structureResponse.ok) {
          const structureData = await structureResponse.json();
          const structureMessage = {
            id: Date.now() + 2,
            role: "assistant",
            content: structureData.message.content,
          };

          setMessages((prev) => [...prev, structureMessage]);

          parseAIResponse(structureData.message.content);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "I'm sorry, I encountered an error while processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // for deploying contract
  const deployContract = async () => {
    if (!abi || !bytecode) return;

    try {
      if (!window.ethereum) {
        return;
      }

      const provider = new ethers.BrowserProvider(
        window.ethereum as unknown as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();

      const contractFactory = new ethers.ContractFactory(abi, bytecode, signer);
      const contract = await contractFactory.deploy();

      const contractAddress = await contract.waitForDeployment();
      const contractAddressString = contract.target?.toString() || null;

      console.log({ contract, contractAddress, contractAddressString });
      setContractAddress(contractAddressString);
    } catch (error) {
      console.error("Error deploying contract:", error);
      return;
    }
  };

  // Copy contract address to clipboard
  const copyToClipboard = () => {
    if (contractAddress) {
      navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col h-screen">
        <header className="border-b border-claude-border py-3 px-4 flex justify-between items-center bg-white">
          <div className="flex items-center">
            <Code2 size={24} className="text-claude-purple mr-2" />
            <h1 className="text-xl font-semibold text-claude-text">
              CodeCraft AI
            </h1>
          </div>
          <div className="flex gap-4">
            {/* <a href="#" className="flex items-center text-gray-600 hover:text-claude-purple transition-colors">
            <Github size={20} className="mr-1" />
            <span className="text-sm">GitHub</span>
          </a> */}
            <ConnectButton />
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <h1 className="text-center text-claude-text justify-center items-center flex h-full text-3xl font-bold">
            Please connect your wallet to continue
          </h1>
        </main>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="flex flex-col h-screen">
        <header className="border-b border-claude-border py-3 px-4 flex justify-between items-center bg-white">
          <div className="flex items-center">
            <Code2 size={24} className="text-claude-purple mr-2" />
            <h1 className="text-xl font-semibold text-claude-text">
              CodeCraft AI
            </h1>
          </div>
          <div className="flex gap-4">
            {/* <a href="#" className="flex items-center text-gray-600 hover:text-claude-purple transition-colors">
            <Github size={20} className="mr-1" />
            <span className="text-sm">GitHub</span>
          </a> */}
            <ConnectButton />
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <Chat
            messages={messages}
            onSendMessage={handleSendMessage}
            isInitialView={true}
            isLoading={isLoading}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-claude-border py-3 px-4 flex justify-between items-center bg-white">
        <div className="flex items-center">
          <Code2 size={24} className="text-claude-purple mr-2" />
          <h1 className="text-xl font-semibold text-claude-text">
            CodeCraft AI
          </h1>
        </div>
        <div className="flex gap-4">
          {isSolidityFile && (
            <button
              onClick={compileSolidity}
              disabled={compiling}
              className="btn-primary text-sm flex items-center"
            >
              {compiling ? "Compiling..." : "Compile Solidity"}
            </button>
          )}
          {bytecode && abi && (
            <button
              onClick={deployContract}
              className="btn-primary text-sm flex items-center"
            >
              Deploy Contract
            </button>
          )}
          {contractAddress && (
            <div className="flex items-center bg-gray-100 rounded px-3 py-1 border border-gray-300">
              <span className="text-sm mr-2 text-gray-700 truncate max-w-[10rem]">
                {contractAddress}
              </span>
              <button
                onClick={copyToClipboard}
                className="text-claude-purple hover:text-claude-purple-dark"
                title="Copy contract address"
              >
                {copied ? <Check size={16} /> : <Clipboard size={16} />}
              </button>
            </div>
          )}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn-secondary text-sm flex items-center"
          >
            {showPreview ? (
              <>
                <Code size={16} className="mr-1" />
                <span>Show Code</span>
              </>
            ) : (
              <>
                <Eye size={16} className="mr-1" />
                <span>Show Preview</span>
              </>
            )}
          </button>
          {/* <button className="btn-secondary text-sm flex items-center">
            <Download size={16} className="mr-1" />
            <span>Download Code</span>
          </button> */}

          <div className="flex gap-4">
            {/* <a href="#" className="flex items-center text-gray-600 hover:text-claude-purple transition-colors">
            <Github size={20} className="mr-1" />
            <span className="text-sm">GitHub</span>
          </a> */}
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden bg-editor-bg">
        <div className="flex h-full flex-col">
          <div className="flex flex-1 overflow-hidden">
            <div className="w-1/3 h-full border-r border-gray-800">
              <Chat
                messages={messages}
                onSendMessage={handleSendMessage}
                isInitialView={false}
                isLoading={isLoading}
              />
            </div>

            <div className="w-2/3 h-full flex">
              <div className="w-1/4 h-full">
                <FileExplorer
                  files={fileStructure}
                  selectedFile={selectedFile || ""}
                  onFileSelect={handleFileSelect}
                />
              </div>

              <div className="w-3/4 h-full flex flex-col">
                <div className="flex-1 h-full">
                  {showPreview && previewFiles ? (
                    <>
                      {/* <CodePreview files={previewFiles} /> */}
                      <div className="w-full h-screen border-4">
                        <iframe
                          src="https://word-puzzle-lemon.vercel.app/"
                          className="w-full h-full border-none"
                          height={"80%"}
                        />
                      </div>
                    </>
                  ) : selectedFile ? (
                    <Editor
                      selectedFile={selectedFile}
                      fileContent={files[selectedFile].content || ""}
                      onFileChange={handleFileChange}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Select a file to edit
                    </div>
                  )}
                </div>
                {(compilationError || bytecode) && (
                  <div className="p-3 bg-gray-900 text-gray-300 border-t border-gray-700 max-h-40 overflow-auto">
                    {compilationError ? (
                      <div className="text-red-400">
                        <h3 className="font-bold">Compilation Error:</h3>
                        <pre className="whitespace-pre-wrap text-sm">
                          {compilationError}
                        </pre>
                      </div>
                    ) : bytecode ? (
                      <div className="text-green-400">
                        <h3 className="font-bold">Compilation Successful</h3>
                        {contractAddress && (
                          <div className="mt-2">
                            <span className="font-bold">
                              Contract Address:{" "}
                            </span>
                            <span className="text-white">
                              {contractAddress}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
