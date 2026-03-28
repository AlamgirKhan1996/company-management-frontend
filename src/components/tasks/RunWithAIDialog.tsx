"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Zap, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

interface AIEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  isActive: boolean;
}

interface AIResult {
  taskSummary?: string;
  plan?: string[];
  execution?: string;
  status?: string;
  impact?: string;
  suggestions?: string[];
}

interface Props {
  taskId: string;
  taskTitle: string;
  onExecuted: () => void;
}

const DEPT_COLORS: Record<string, string> = {
  "Human Resources": "bg-purple-100 text-purple-700",
  "Sales": "bg-blue-100 text-blue-700",
  "Marketing": "bg-pink-100 text-pink-700",
  "Finance": "bg-green-100 text-green-700",
  "Engineering": "bg-orange-100 text-orange-700",
  "Support": "bg-teal-100 text-teal-700",
};

function AIResultDisplay({ result }: { result: AIResult }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950 overflow-hidden text-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-xs text-gray-400 font-mono ml-2">AI Execution Result</span>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-white">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="p-4 space-y-4 font-mono text-xs text-gray-200 max-h-96 overflow-y-auto">
          {result.taskSummary && (
            <div>
              <p className="text-indigo-400 uppercase tracking-widest text-[10px] mb-1">Summary</p>
              <p className="font-sans text-sm text-gray-200">{result.taskSummary}</p>
            </div>
          )}
          {result.plan && result.plan.length > 0 && (
            <div>
              <p className="text-indigo-400 uppercase tracking-widest text-[10px] mb-1">Plan</p>
              <ol className="space-y-1">
                {result.plan.map((step, i) => (
                  <li key={i} className="flex gap-2 font-sans text-xs text-gray-300">
                    <span className="text-indigo-400">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {result.execution && (
            <div>
              <p className="text-indigo-400 uppercase tracking-widest text-[10px] mb-1">Execution Output</p>
              <p className="font-sans text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                {result.execution}
              </p>
            </div>
          )}
          {result.impact && (
            <div className="border-t border-gray-800 pt-3">
              <p className="text-green-400 uppercase tracking-widest text-[10px] mb-1">Business Impact</p>
              <p className="font-sans text-sm text-gray-200">{result.impact}</p>
            </div>
          )}
          {result.suggestions && result.suggestions.length > 0 && (
            <div>
              <p className="text-yellow-400 uppercase tracking-widest text-[10px] mb-1">Suggestions</p>
              <ul className="space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2 font-sans text-xs text-gray-300">
                    <span className="text-yellow-400">›</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RunWithAIDialog({ taskId, taskTitle, onExecuted }: Props) {
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState<AIEmployee[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    async function fetchAgents() {
      setAgentsLoading(true);
      try {
        const res = await api.get("/api/ai-employees");
        const data = Array.isArray(res.data) ? res.data : [];
        setAgents(data.filter((a: AIEmployee) => a.isActive));
      } catch {
        toast.error("Failed to load AI employees");
      } finally {
        setAgentsLoading(false);
      }
    }
    fetchAgents();
  }, [open]);

  async function handleExecute() {
    if (!selectedAgent) { toast.error("Select an AI employee first"); return; }
    try {
      setLoading(true);
      setResult(null);
      const res = await api.post(`/api/tasks/${taskId}/execute-ai`, {
        aiEmployeeId: selectedAgent,
      });
      const aiRes = res.data?.aiResult || res.data?.result;
      setResult(aiRes);
      setDone(true);
      toast.success("AI employee completed the task!");
      onExecuted();
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "AI execution failed");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setOpen(false);
    setSelectedAgent("");
    setResult(null);
    setDone(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-violet-600 border-violet-200 hover:bg-violet-50 hover:text-violet-700 text-xs"
        >
          <Bot className="h-3.5 w-3.5" />
          Run with AI
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-100">
              <Bot className="h-4 w-4 text-violet-600" />
            </div>
            Run Task with AI Employee
          </DialogTitle>
        </DialogHeader>

        {/* Task being executed */}
        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="text-xs text-gray-400 mb-0.5">Task</p>
          <p className="font-medium text-gray-800 text-sm">{taskTitle}</p>
        </div>

        {!done ? (
          <div className="space-y-4">
            {/* Agent selector */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Select AI Employee
              </p>

              {agentsLoading ? (
                <div className="grid grid-cols-2 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : agents.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No active AI employees. Create one first.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => setSelectedAgent(agent.id)}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${
                        selectedAgent === agent.id
                          ? "border-violet-500 bg-violet-50"
                          : "border-gray-200 hover:border-violet-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0
                          ${DEPT_COLORS[agent.department]?.includes("purple") ? "bg-purple-500" :
                            DEPT_COLORS[agent.department]?.includes("blue") ? "bg-blue-500" :
                            DEPT_COLORS[agent.department]?.includes("pink") ? "bg-pink-500" :
                            DEPT_COLORS[agent.department]?.includes("green") ? "bg-green-600" :
                            "bg-indigo-500"}`}
                        >
                          {agent.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-gray-900 truncate">{agent.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{agent.role}</p>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1 py-0 mt-1 ${DEPT_COLORS[agent.department] || "bg-gray-100 text-gray-600"}`}
                          >
                            {agent.department}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleExecute}
              disabled={loading || !selectedAgent || agents.length === 0}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  AI is working on this task...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Execute with AI
                </span>
              )}
            </Button>

            {loading && (
              <p className="text-center text-xs text-gray-400 animate-pulse">
                AI employee is analyzing and executing your task...
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Task executed successfully!
            </div>

            {result && <AIResultDisplay result={result} />}

            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
