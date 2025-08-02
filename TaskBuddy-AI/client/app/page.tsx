'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import TodoCard from '@/components/TodoCard';
import AIBox from '@/components/AIBox';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import confetti from 'canvas-confetti';

export default function Home() {
  const [task, setTask] = useState('');
  const [todos, setTodos] = useState([]);

  const fetchTodos = async () => {
    const res = await axios.get('http://localhost:5000/api/todos');
    setTodos(res.data);
  };

  const addTask = async () => {
    if (!task.trim()) return;
    await axios.post('http://localhost:5000/api/todos', { task });
    confetti();
    setTask('');
    fetchTodos();
  };

  const playDeleteSound = () => {
    const audio = new Audio('/sounds/delete.mp3');
    audio.play();
  };

  const deleteTask = async (id: number) => {
    await axios.delete(`http://localhost:5000/api/todos/${id}`);
    playDeleteSound();
    fetchTodos();
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 px-4 pt-28 text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Your Cosmic Tasks </h2>
        <div className="flex gap-2">
          <Input
            placeholder="Enter a task..."
            value={task}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTask(e.target.value)}
            className="bg-white/5 text-white border border-white/20"
          />
          <Button onClick={addTask}>Add</Button>
        </div>
        <TodoCard todos={todos} deleteTask={deleteTask} />
        <AIBox />
      </div>
    </main>
  );
}