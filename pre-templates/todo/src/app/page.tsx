"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConnectButton } from "@/components/ConnectWallet";
import { TODO_ABI, TODO_CONTRACT_ADDRESS } from "@/constants";

type Task = {
  text: string;
  isDeleted: boolean;
};

export default function TodoApp() {
  const { address } = useAccount();
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState<Task[]>([]);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);

  // Load contract
  useEffect(() => {
    const loadContract = async () => {
      if (window.ethereum && address) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const todoContract = new ethers.Contract(
          TODO_CONTRACT_ADDRESS,
          TODO_ABI,
          signer
        );
        setContract(todoContract);
      }
    };
    loadContract();
  }, [address]);

  // Fetch Todos
  const fetchTodos = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      console.log(contract,"contract");
      const tasks = await contract.getMyTasks();
      const activeTasks = tasks.filter((t) => !t.isDeleted);
      console.log(tasks,"Active Tasks");
      setTodos(activeTasks);
    } catch (err) {
      console.error("Error fetching todos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract && address) fetchTodos();
  }, [contract]);

  // Add Todo
  const addTodo = async () => {
    if (!newTodo || !contract) return;
    try {
      const tx = await contract.addTask(newTodo);
      await tx.wait();
      setNewTodo("");
      fetchTodos();
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  // Delete Todo
  const deleteTodo = async (index: number) => {
    if (!contract) return;
    try {
      const tx = await contract.deleteTask(index);
      await tx.wait();
      fetchTodos();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">📝 Todo's</h1>

      <div className="text-center">
        <ConnectButton />
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 flex gap-2">
            <Input
              placeholder="Enter a new task"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
            />
            <Button onClick={addTodo}>Add</Button>
            <Button onClick={fetchTodos}>Fetch Tasks</Button>
          </CardContent>
        </Card>

        {loading ? (
          <p className="text-center text-sm text-gray-500">Loading tasks...</p>
        ) : todos.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No tasks found.</p>
        ) : (
          <div className="space-y-2">
            {todos.map((todo, index) => (
              <Card key={index}>
                <CardContent className="flex justify-between items-center p-3">
                  <span className="text-sm break-all">{todo.text}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTodo(index)}
                  >
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
