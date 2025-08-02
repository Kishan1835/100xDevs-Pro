import {Button} from '@/components/ui/button';

interface Todo {
  id: number; 
  task: string;
}

interface TodoCardProps {
  todos: Todo[];
  deleteTask: (id: number) => void; 
}

export default function TodoCard({ todos, deleteTask }: TodoCardProps) {
  return (
    <div className="space-y-3 mt-6">
      {todos.map((t: Todo) => (
        <div
          key={t.id}
          className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center backdrop-blur-md"
        >
          <span className="text-white">{t.task}</span>
          <Button variant="destructive" onClick={() => deleteTask(t.id)}>
            Delete
          </Button>
        </div>
      ))}
    </div>
  );
}