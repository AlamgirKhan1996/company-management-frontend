"use client";

import { useState } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import RoleGuard from "@/components/auth/RoleGuard";
import {
  Bot, Search, Download, Star, Shield,
  TrendingUp, Users, Code2, DollarSign,
  Headphones, Megaphone, Scale, BarChart3,
  Upload, Sparkles, CheckCircle2,
} from "lucide-react";

interface AgentTemplate {
  id: string;
  name: string;
  role: string;
  department: string;
  description: string;
  permissions: string[];
  icon: React.ElementType;
  color: string;
  bgColor: string;
  category: string;
  rating: number;
  installs: number;
  tags: string[];
  featured?: boolean;
  verified?: boolean;
}

const TEMPLATES: AgentTemplate[] = [
  {
    id: "hr-manager",
    name: "Sara",
    role: "HR Manager",
    department: "Human Resources",
    description: "Expert in hiring plans, onboarding, leave management, and HR policy drafting. Handles employee relations professionally.",
    permissions: ["READ_EMPLOYEES", "WRITE_REPORTS", "MANAGE_LEAVES", "MANAGE_HIRING", "WRITE_POLICIES"],
    icon: Users,
    color: "text-purple-700",
    bgColor: "bg-purple-500",
    category: "HR",
    rating: 4.9,
    installs: 2341,
    tags: ["Hiring", "Onboarding", "Policies"],
    featured: true,
    verified: true,
  },
  {
    id: "sales-exec",
    name: "Marcus",
    role: "Sales Executive",
    department: "Sales",
    description: "Drives revenue with sales reports, client proposals, pipeline analysis, and closing strategies for B2B and B2C.",
    permissions: ["VIEW_CLIENTS", "WRITE_REPORTS", "READ_ANALYTICS", "SEND_EMAILS"],
    icon: TrendingUp,
    color: "text-blue-700",
    bgColor: "bg-blue-500",
    category: "Sales",
    rating: 4.8,
    installs: 1876,
    tags: ["Pipeline", "Proposals", "Revenue"],
    featured: true,
    verified: true,
  },
  {
    id: "finance-analyst",
    name: "Priya",
    role: "Financial Analyst",
    department: "Finance",
    description: "Generates financial reports, budget forecasts, expense analysis, and ROI calculations with precision.",
    permissions: ["VIEW_FINANCIALS", "WRITE_REPORTS", "READ_ANALYTICS", "VIEW_SALARIES"],
    icon: DollarSign,
    color: "text-green-700",
    bgColor: "bg-green-600",
    category: "Finance",
    rating: 4.9,
    installs: 1654,
    tags: ["Reports", "Budgets", "Forecasting"],
    verified: true,
  },
  {
    id: "dev-agent",
    name: "Alex",
    role: "Senior Developer",
    department: "Engineering",
    description: "Handles technical documentation, code review plans, sprint planning, and developer task breakdowns.",
    permissions: ["MANAGE_TASKS", "MANAGE_PROJECTS", "WRITE_REPORTS", "READ_ANALYTICS"],
    icon: Code2,
    color: "text-orange-700",
    bgColor: "bg-orange-500",
    category: "Engineering",
    rating: 4.7,
    installs: 1432,
    tags: ["Code Review", "Sprint", "Tech Docs"],
    verified: true,
  },
  {
    id: "support-agent",
    name: "Layla",
    role: "Support Agent",
    department: "Support",
    description: "Drafts customer responses, escalation plans, FAQ documents, and support quality reports.",
    permissions: ["SEND_EMAILS", "WRITE_REPORTS", "VIEW_CLIENTS", "READ_ANALYTICS"],
    icon: Headphones,
    color: "text-teal-700",
    bgColor: "bg-teal-500",
    category: "Support",
    rating: 4.8,
    installs: 987,
    tags: ["Customers", "Escalations", "FAQ"],
  },
  {
    id: "marketing-specialist",
    name: "Zara",
    role: "Marketing Specialist",
    department: "Marketing",
    description: "Creates marketing campaigns, content calendars, social media plans, and brand strategy documents.",
    permissions: ["WRITE_REPORTS", "SEND_EMAILS", "READ_ANALYTICS", "VIEW_CLIENTS"],
    icon: Megaphone,
    color: "text-pink-700",
    bgColor: "bg-pink-500",
    category: "Marketing",
    rating: 4.6,
    installs: 1123,
    tags: ["Campaigns", "Content", "Brand"],
    featured: true,
  },
  {
    id: "legal-advisor",
    name: "Jordan",
    role: "Legal Advisor",
    department: "Legal",
    description: "Reviews contract summaries, drafts policy documents, compliance checklists, and legal risk assessments.",
    permissions: ["WRITE_POLICIES", "WRITE_REPORTS", "READ_EMPLOYEES"],
    icon: Scale,
    color: "text-gray-700",
    bgColor: "bg-gray-600",
    category: "Legal",
    rating: 4.7,
    installs: 654,
    tags: ["Contracts", "Compliance", "Policies"],
    verified: true,
  },
  {
    id: "data-analyst",
    name: "Kai",
    role: "Data Analyst",
    department: "Operations",
    description: "Produces data-driven insights, KPI dashboards, trend analysis, and executive summary reports.",
    permissions: ["READ_ANALYTICS", "WRITE_REPORTS", "VIEW_FINANCIALS", "READ_EMPLOYEES"],
    icon: BarChart3,
    color: "text-indigo-700",
    bgColor: "bg-indigo-500",
    category: "Analytics",
    rating: 4.9,
    installs: 2102,
    tags: ["KPIs", "Insights", "Dashboards"],
    verified: true,
    featured: true,
  },
];

const CATEGORIES = ["All", "HR", "Sales", "Finance", "Engineering", "Support", "Marketing", "Legal", "Analytics"];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [installing, setInstalling] = useState<string | null>(null);
  const [installed, setInstalled] = useState<Set<string>>(new Set());

  const filtered = TEMPLATES.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = activeCategory === "All" || t.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const featured = TEMPLATES.filter((t) => t.featured);

  async function handleInstall(template: AgentTemplate) {
    if (installed.has(template.id)) return;
    try {
      setInstalling(template.id);
      await api.post("/api/ai-employees", {
        name: template.name,
        role: template.role,
        department: template.department,
        permissions: template.permissions,
      });
      setInstalled((prev) => new Set([...prev, template.id]));
      toast.success(`${template.name} (${template.role}) has joined your team!`);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Installation failed");
    } finally {
      setInstalling(null);
    }
  }

  return (
    <RoleGuard minRole="ADMIN">
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <span className="text-sm font-medium text-indigo-200">AI Agent Marketplace</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Build Your Digital Workforce</h1>
          <p className="text-indigo-200 max-w-xl">
            Install pre-built AI agents for your company. Each agent is specialized,
            trained for its role, and ready to execute tasks immediately.
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-indigo-200">
            <span className="flex items-center gap-1"><Bot className="h-4 w-4" /> {TEMPLATES.length} agents available</span>
            <span className="flex items-center gap-1"><Download className="h-4 w-4" /> One-click install</span>
            <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> Verified agents</span>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-12 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute right-32 top-4 w-24 h-24 rounded-full bg-white/5" />
      </div>

      {/* Featured agents */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          Featured Agents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((t) => {
            const Icon = t.icon;
            const isInstalled = installed.has(t.id);
            const isInstalling = installing === t.id;
            return (
              <div
                key={t.id}
                className="relative bg-white rounded-2xl border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                <div className={`h-1.5 w-full ${t.bgColor}`} />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${t.bgColor} bg-opacity-10`}>
                      <Icon className={`h-5 w-5 ${t.color}`} />
                    </div>
                    {t.verified && (
                      <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">
                        <Shield className="h-2.5 w-2.5" /> Verified
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{t.name}</h3>
                  <p className="text-xs text-gray-500">{t.role}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-0.5 text-xs text-yellow-600">
                      <Star className="h-3 w-3 fill-yellow-500" />
                      {t.rating}
                    </div>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{t.installs.toLocaleString()} installs</span>
                  </div>
                  <button
                    onClick={() => handleInstall(t)}
                    disabled={isInstalling || isInstalled}
                    className={`mt-3 w-full py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                      isInstalled
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    {isInstalling ? (
                      <><span className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" /> Installing...</>
                    ) : isInstalled ? (
                      <><CheckCircle2 className="h-3 w-3" /> Installed</>
                    ) : (
                      <><Download className="h-3 w-3" /> Install</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search agents by role, department, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* All agents grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => {
          const Icon = t.icon;
          const isInstalled = installed.has(t.id);
          const isInstalling = installing === t.id;

          return (
            <div
              key={t.id}
              className="bg-white rounded-2xl border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${t.bgColor} flex-shrink-0 shadow-sm`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{t.name}</h3>
                      <p className="text-xs text-gray-500">{t.role} · {t.department}</p>
                    </div>
                    {t.verified && (
                      <Shield className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {t.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {t.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 text-gray-500">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        {t.rating}
                      </span>
                      <span>{t.installs.toLocaleString()} installs</span>
                    </div>

                    <button
                      onClick={() => handleInstall(t)}
                      disabled={isInstalling || isInstalled}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isInstalled
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                      }`}
                    >
                      {isInstalling ? (
                        <><span className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" /> Installing...</>
                      ) : isInstalled ? (
                        <><CheckCircle2 className="h-3.5 w-3.5" /> Installed</>
                      ) : (
                        <><Download className="h-3.5 w-3.5" /> Install Agent</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Bot className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p>No agents found matching your search</p>
        </div>
      )}

      {/* Upload your own agent CTA */}
      <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-8 text-center bg-indigo-50/50">
        <div className="p-3 rounded-full bg-indigo-100 inline-flex mb-4">
          <Upload className="h-6 w-6 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Publish Your Own AI Agent
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
          Built a specialized AI agent? Share it with the marketplace.
          Help other companies build smarter digital workforces.
        </p>
        <button
          onClick={() => toast.info("Agent publishing coming soon! 🚀")}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors inline-flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Submit Your Agent
        </button>
      </div>
    </div>
    </RoleGuard>
  );
}
    
  
