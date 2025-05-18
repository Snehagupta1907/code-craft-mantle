/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import solc from 'solc';

interface FileContent {
  content: string;
  path: string;
}

const compileSolidity = (files: FileContent[]) => {
  // Create a mapping of file paths to their contents
  const sources: Record<string, { content: string }> = {};
  files.forEach(file => {
    sources[file.path] = { content: file.content };
  });

  const input = {
    language: 'Solidity',
    sources,
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };

  const compiled = JSON.parse(solc.compile(JSON.stringify(input)));

  if (compiled.errors) {
    const hasErrors = compiled.errors.some((error: any) => error.severity === 'error');
    if (hasErrors) {
      const errorMessages = compiled.errors
        .filter((error: any) => error.severity === 'error')
        .map((error: any) => error.formattedMessage)
        .join('\n');
      throw new Error(errorMessages);
    }
  }

  const result: {
    contracts: Record<string, {
      bytecode: string;
      abi: any;
      contractName: string;
    }>;
  } = {
    contracts: {}
  };

  // Process all compiled contracts
  for (const sourcePath in compiled.contracts) {
    const contracts = compiled.contracts[sourcePath];
    for (const contractName in contracts) {
      const contract = contracts[contractName];
      const bytecode = contract.evm?.bytecode?.object;
      const abi = contract.abi;

      if (bytecode) {
        result.contracts[contractName] = {
          bytecode,
          abi,
          contractName
        };
      }
    }
  }

  if (Object.keys(result.contracts).length === 0) {
    throw new Error('No contracts found in the compiled output.');
  }

  return result;
};

export async function POST(req: Request) {
  try {
    const { files }: { files: FileContent[] } = await req.json();

    console.log('Received Solidity files:', files.map(f => f.path).join(', '));

    const compilationResult = compileSolidity(files);

    return NextResponse.json({
      contracts: compilationResult.contracts
    });
  } catch (error: unknown) {
    console.error('Error in Solidity compile API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred during compilation' },
      { status: 500 }
    );
  }
}