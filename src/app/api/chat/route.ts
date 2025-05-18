import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'X-Title': 'CodeCraft AI',
  },
});

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  try {
    const { messages, currentState }: { messages: Message[], currentState?: { files: Record<string, { content: string }> } } = await req.json();

    if (messages.length > 0) {
      console.log('Chat API request:', messages[messages.length - 1]);
    }

    const isFirstMessage = messages.filter(msg => msg.role === 'user').length === 1;

    let apiMessages: Message[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    if (isFirstMessage) {
      apiMessages = [
        {
          role: 'system',
          content: `You are CodeCraft AI, a specialized coding assistant that helps users scaffold modern web applications.

Your task is to generate a complete Next.js project structure based on the user's request, using Tailwind CSS and TypeScript and format code properly.

RESPONSE FORMAT:
1. Start with a brief introduction to what you'll be creating based on user's request
2. Include a JSON code block with the full project structure and file contents
3. End with a brief explanation of key features and how to get started

The JSON code block MUST be formatted exactly like this:
\`\`\`json
{
  "type": "new_project",
  "fileStructure": [
    {
      "type": "folder",
      "name": "src",
      "children": [
        {
          "type": "folder",
          "name": "app",
          "children": [
            {
              "type": "file",
              "name": "page.tsx",
              "path": "src/app/page.tsx"
            }
          ]
        }
      ]
    }
  ],
  "files": {
    "src/app/page.tsx": "// Code content here"
  }
}
\`\`\`

REQUIRED FILES TO INCLUDE:
- package.json (with all required dependencies)
- tsconfig.json (properly configured for Next.js with TypeScript)
- next.config.mjs
- tailwind.config.ts
- postcss.config.mjs
- src/app/globals.css (with Tailwind imports)
- src/app/layout.tsx (with proper metadata and layout structure)
- src/app/page.tsx (main page)
- Any components needed based on the user's request

RULES:
- Generate clean, modern, and well-structured code following best practices
- Use TypeScript strictly with proper typing
- Set up Tailwind CSS properly with appropriate configurations
- Include comments in complex code sections
- Make sure file paths are consistent and correct
- Create reusable components where appropriate
- For UI components, use native HTML elements with Tailwind classes rather than component libraries
- If user requires specific libraries or UI elements, include them appropriately

Be helpful, comprehensive, and focus on generating functional code that actually works.`
        },
        ...apiMessages,
      ];
    } else {
      // For follow-up messages, include the current state
      apiMessages = [
        {
          role: 'system',
          content: `You are CodeCraft AI, a specialized coding assistant that helps users modify existing web applications.

When the user requests changes to existing code:
1. First analyze if this is a modification request or a new project request
2. For modifications:
   - If adding new files/folders, include both the file structure update and file contents
   - Use the format:
   \`\`\`json
   {
     "type": "modification",
     "fileStructure": [
       {
         "type": "folder",
         "name": "newFolder",
         "children": [
           {
             "type": "file",
             "name": "newFile.sol",
             "path": "newFolder/newFile.sol"
           }
         ]
       }
     ],
     "changes": {
       "newFolder/newFile.sol": {
         "type": "update",
         "content": "file content here"
       }
     }
   }
   \`\`\`
   - For existing file modifications, only include the changes object
   - For new files/folders, include both fileStructure and changes
3. For new projects:
   - Use the existing format with full project structure
   - Include all necessary files

Current project state:
${JSON.stringify(currentState, null, 2)}

Always maintain context of previous changes and only modify what's necessary.
When adding new files or folders, make sure to update both the file structure and provide the file contents.`
        },
        ...apiMessages,
      ];
    }

    const completion = await openai.chat.completions?.create({
      model: 'openai/gpt-4o',
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 4000,
    });

    const assistantMessage = completion.choices[0].message;

    console.log('Chat API response received');

    return NextResponse.json({
      message: assistantMessage,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}