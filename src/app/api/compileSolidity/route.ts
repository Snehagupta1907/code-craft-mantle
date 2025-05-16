/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import solc from 'solc';

const compileSolidity = (source: string) => {

  const inputFileName = 'input.sol';

  const input = {
    language: 'Solidity',
    sources: {
      [inputFileName]: {
        content: source,
      },
    },
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


  const contracts = compiled.contracts[inputFileName];
  if (!contracts) {
    throw new Error('No contracts found in the compiled output.');
  }


  const result: { 
    bytecode: string, 
    contractName: string, 
    abi: any, 
    allContracts: Record<string, { abi: any, bytecode: string }> 
  } = {
    bytecode: '',
    contractName: '',
    abi: null,
    allContracts: {}
  };

  // Extract all contracts and their ABIs
  for (const contractName in contracts) {
    const contract = contracts[contractName];
    const bytecode = contract.evm?.bytecode?.object;
    const abi = contract.abi;
    
    result.allContracts[contractName] = {
      abi,
      bytecode: bytecode || ''
    };


    if (bytecode && !result.bytecode) {
      result.bytecode = bytecode;
      result.contractName = contractName;
      result.abi = abi;
    }
  }


  if (!result.bytecode) {
    throw new Error('Bytecode not found for any contract.');
  }

  return result;
};

export async function POST(req: Request) {
  try {
    const { sourceCode }: { sourceCode: string } = await req.json(); // Solidity source code


    console.log('Received Solidity source code:', 
      sourceCode.length > 200 ? sourceCode.substring(0, 200) + '...' : sourceCode);


    const compilationResult = compileSolidity(sourceCode);

 
    return NextResponse.json({
      bytecode: compilationResult.bytecode,
      contractName: compilationResult.contractName,
      abi: compilationResult.abi,
      contracts: compilationResult.allContracts
    });
  } catch (error: unknown) {
    console.error('Error in Solidity compile API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred during compilation' }, 
      { status: 500 }
    );
  }
}