// Sample data for a Todo List app
export const sampleFiles = {
  'package.json': `{
    "name": "todo-app",
    "version": "0.1.0",
    "private": true,
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start"
    },
    "dependencies": {
      "next": "latest",
      "react": "latest",
      "react-dom": "latest"
    },
    "devDependencies": {
      "autoprefixer": "latest",
      "postcss": "latest",
      "tailwindcss": "latest"
    }
  }`,

  'src/app/page.tsx': `import { useState } from 'react';
import TodoList from './components/TodoList';
import { Todo } from './types/todo';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    setTodos([...todos, { id: Date.now(), text, completed: false }]);
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <TodoList
        todos={todos}
        onAdd={addTodo}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
      />
    </div>
  );
}`,

  'src/app/types/todo.ts': `export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}`,

  'src/app/components/TodoList.tsx': `import { useState } from 'react';
import { Todo } from '../types/todo';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onAdd: (text: string) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function TodoList({ todos, onAdd, onToggle, onDelete }: TodoListProps) {
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      onAdd(newTodo.trim());
      setNewTodo('');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add
        </button>
      </form>
      <div className="space-y-2">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}`,

  'src/app/components/TodoItem.tsx': `import { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center gap-2 p-2 border rounded">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="h-4 w-4"
      />
      <span className={\`flex-1 \${todo.completed ? 'line-through text-gray-500' : ''}\`}>
        {todo.text}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="px-2 py-1 text-red-500 hover:bg-red-50 rounded"
      >
        Delete
      </button>
    </div>
  );
}`,

  'src/app/components/Todo.tsx': `// Reserved for future use (or can be removed if not needed)
export default function Todo() {
  return null;
}`,

  'src/app/layout.tsx': `import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'A simple todo application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`
};

  
  // Sample chat message
  export const sampleChatMessages = [
    {
      id: 1,
      role: 'assistant',
      content: "I've created a TypeScript-based Todo List app for you. The app is structured with proper TypeScript types and React components. You can explore the files in the explorer and edit them in the editor. The app includes basic functionality for adding, completing, and deleting tasks."
    }
  ];
  
  // Sample file structure
  export const sampleFileStructure = [
    {
      type: 'folder',
      name: 'src',
      children: [
        {
          type: 'folder',
          name: 'app',
          children: [
            {
              type: 'file',
              name: 'page.tsx',
              path: 'src/app/page.tsx'
            },
            {
              type: 'file',
              name: 'layout.tsx',
              path: 'src/app/layout.tsx'
            },
            {
              type: 'folder',
              name: 'components',
              children: [
                {
                  type: 'file',
                  name: 'Todo.tsx',
                  path: 'src/app/components/Todo.tsx'
                },
                {
                  type: 'file',
                  name: 'TodoItem.tsx',
                  path: 'src/app/components/TodoItem.tsx'
                },
                {
                  type: 'file',
                  name: 'TodoList.tsx',
                  path: 'src/app/components/TodoList.tsx'
                }
              ]
            },
            {
              type: 'folder',
              name: 'types',
              children: [
                {
                  type: 'file',
                  name: 'todo.ts',
                  path: 'src/app/types/todo.ts'
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  