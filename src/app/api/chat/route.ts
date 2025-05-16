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
    const { messages }: { messages: Message[] } = await req.json();

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
            },
            // More files and folders...
          ]
        }
      ]
    }
  ],
  "files": {
    "src/app/page.tsx": "// Code content here",
    // More file contents...
  }
}
\`\`\`

REQUIRED FILES TO INCLUDE:
- package.json (with all required dependencies) like how package.json should be for Next.js with TypeScript app
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

Be helpful, comprehensive, and focus on generating functional code that actually works.`,
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