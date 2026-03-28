"use client";

import { useState } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Zap, Bot } from "lucide-react";

interface Props {
  agentId: string;
  agentName: string;
  onTaskAssigned: () => void;
}

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const EXAMPLE_TASKS = [
  "Generate a hiring plan for Q2 with budget breakdown",
  "Analyze last month's sales performance and suggest improvements",
  "Write an onboarding plan for new team members",
  "Create a risk assessment report for current projects",
  "Draft a customer retention strategy for Q3",
];

export default function AssignTaskDialog({ agentId, agentName, onTaskAssigned }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [context, setContext] = useState("");

  function handleClose() {
    if (loading) return; // prevent close while running
    setOpen(false);
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setContext("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) { toast.error("Task title is required"); return; }
    if (!description.trim()) { toast.error("Task description is required"); return; }

    try {
      setLoading(true);
      await api.post(`/api/ai-employees/${agentId}/task`, {
        title: title.trim(),
        description: description.trim(),
        priority,
        context: context.trim() || undefined,
      });

      toast.success(`${agentName} completed the task!`);
      onTaskAssigned();
      handleClose();
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Task execution failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur"
          variant="outline"
        >
          <Zap className="h-3.5 w-3.5" />
          Assign Task
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100">
              <Bot className="h-4 w-4 text-indigo-600" />
            </div>
            Assign Task to {agentName}
          </DialogTitle>
        </DialogHeader>

        {/* Example tasks */}
        <div className="space-y-1.5">
          <p className="text-xs text-gray-400">Quick examples — click to use:</p>
          <div className="flex flex-col gap-1">
            {EXAMPLE_TASKS.slice(0, 3).map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setTitle(ex.split(" ").slice(0, 6).join(" ") + "...");
                  setDescription(ex);
                }}
                className="text-left text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1.5 rounded-lg border border-indigo-100 transition-colors truncate"
              >
                → {ex}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              placeholder="e.g. Generate Q2 hiring plan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="task-description">
              Description
              <span className="text-gray-400 font-normal ml-1 text-xs">
                (be specific for better results)
              </span>
            </Label>
            <Textarea
              id="task-description"
              placeholder="Describe the task in detail. Include goals, constraints, expected output..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={loading}
              className="resize-none"
            />
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-1000">
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Context */}
          <div className="space-y-1.5">
            <Label htmlFor="task-context">
              Additional Context
              <span className="text-gray-400 font-normal ml-1 text-xs">(optional)</span>
            </Label>
            <Textarea
              id="task-context"
              placeholder="Budget, team size, deadlines, company-specific info..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={2}
              disabled={loading}
              className="resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                {agentName} is working on it...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Execute Task
              </span>
            )}
          </Button>

          {loading && (
            <p className="text-center text-xs text-gray-400 animate-pulse">
              AI is processing your task — this may take a few seconds...
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
