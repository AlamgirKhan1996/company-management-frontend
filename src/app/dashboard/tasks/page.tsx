import { useEffect, useState } from "react";
import axios from "axios";

interface Task {
  id: string;
  title: string;
  projectId: string;
  assigneeId: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const[title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const fetchTasks = async () => {
    const res = await axios.get("/api/tasks");
    setTasks(res.data);
  };

  useEffect(() => {
    const loadTasks = async () => {
      const res = await axios.get("/api/tasks");
      setTasks(res.data);
    };
    loadTasks();
  }, []);

  const createTask = async () => {
      await axios.post("/api/tasks", {
        title,
        projectId,
        assigneeId
      });
      fetchTasks();
    };

    const deleteTask = async (id: string) => {
      await axios.delete(`/api/tasks/${id}`);
      fetchTasks();
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Tasks</h1>
            <div className="mb-4">
                <input
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                />
                <input
                placeholder="Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                />
                <input
                placeholder="Assignee ID"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                />
                <button onClick={createTask}>Create Task</button>
            </div>
            <ul>
                {tasks.map((task: Task) => (
                    <li key={task.id}>
                        <span>{task.title}</span>
                        <button onClick={() => deleteTask(task.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
