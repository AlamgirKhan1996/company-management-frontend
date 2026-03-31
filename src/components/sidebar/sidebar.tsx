"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import {
  LayoutDashboard, Building2, Users, FolderKanban,
  Layers, Bot, Store, Activity, Settings,
  UserCog, ChevronRight, Sparkles, BarChart2,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  minRole?: "EMPLOYEE" | "MANAGER" | "ADMIN" | "SUPER_ADMIN";
  badge?: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    // Everyone sees dashboard
  },
  {
    href: "/dashboard/tasks",
    label: "My Tasks",
    icon: Layers,
    // Employees see their own tasks
  },
  {
    href: "/dashboard/departments",
    label: "Departments",
    icon: Building2,
    minRole: "MANAGER",
  },
  {
    href: "/dashboard/employees",
    label: "Employees",
    icon: Users,
    minRole: "MANAGER",
  },
  {
    href: "/dashboard/projects",
    label: "Projects",
    icon: FolderKanban,
    minRole: "MANAGER",
  },
  {
    href: "/dashboard/ai-employees",
    label: "AI Employees",
    icon: Bot,
    minRole: "MANAGER",
    badge: "AI",
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    icon: BarChart2,
    minRole: "MANAGER",
  },
  {
    href: "/dashboard/marketplace",
    label: "Marketplace",
    icon: Store,
    minRole: "ADMIN",
    badge: "New",
  },
  {
    href: "/dashboard/users",
    label: "Users",
    icon: UserCog,
    minRole: "ADMIN",
  },
  {
    href: "/dashboard/activity",
    label: "Activity Log",
    icon: Activity,
    minRole: "ADMIN",
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    // Everyone sees settings
  },
];

const ROLE_HIERARCHY = ["EMPLOYEE", "MANAGER", "ADMIN", "SUPER_ADMIN"];

function canSee(userRole: string, minRole?: string): boolean {
  if (!minRole) return true;
  const userIdx = ROLE_HIERARCHY.indexOf(userRole);
  const minIdx = ROLE_HIERARCHY.indexOf(minRole);
  if (userIdx === -1) return false;
  return userIdx >= minIdx;
}

const ROLE_STYLE: Record<string, { label: string; gradient: string; dot: string }> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    gradient: "from-red-500 to-rose-600",
    dot: "bg-red-400",
  },
  ADMIN: {
    label: "Admin",
    gradient: "from-indigo-500 to-violet-600",
    dot: "bg-indigo-400",
  },
  MANAGER: {
    label: "Manager",
    gradient: "from-blue-500 to-cyan-600",
    dot: "bg-blue-400",
  },
  EMPLOYEE: {
    label: "Employee",
    gradient: "from-gray-500 to-slate-600",
    dot: "bg-gray-400",
  },
};

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useRole();
  const roleStyle = ROLE_STYLE[role] || ROLE_STYLE.EMPLOYEE;

  const visibleItems = NAV_ITEMS.filter((item) => canSee(role, item.minRole));

  return (
    <aside className="w-64 min-h-screen bg-gray-950 flex flex-col border-r border-gray-800 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-tight leading-tight">
              CMS Platform
            </p>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest">
              Management
            </p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className={`flex items-center gap-2 bg-gradient-to-r ${roleStyle.gradient} bg-opacity-10 rounded-lg px-3 py-2`}>
          <span className={`w-2 h-2 rounded-full ${roleStyle.dot} animate-pulse`} />
          <span className="text-xs font-semibold text-white opacity-90">
            {roleStyle.label}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 relative
                ${isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
                }
              `}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-gray-500 group-hover:text-white"}`} />
              <span className="flex-1 truncate">{item.label}</span>

              {/* Badge */}
              {item.badge && (
                <span className={`
                  text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide
                  ${item.badge === "AI"
                    ? "bg-violet-500 text-white"
                    : "bg-green-500 text-white"
                  }
                `}>
                  {item.badge}
                </span>
              )}

              {/* Active indicator */}
              {isActive && (
                <ChevronRight className="h-3 w-3 text-indigo-300" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — role-specific hint */}
      <div className="px-4 py-4 border-t border-gray-800">
        {role === "EMPLOYEE" && (
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              You can view and update the status of tasks assigned to you.
            </p>
          </div>
        )}
        {role === "MANAGER" && (
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              You can manage projects, tasks, and run AI agents.
            </p>
          </div>
        )}
        {(role === "ADMIN" || role === "SUPER_ADMIN") && (
          <div className="bg-indigo-950 rounded-xl p-3 border border-indigo-900">
            <p className="text-[11px] text-indigo-300 leading-relaxed">
              Full access enabled. You can invite team members from the Users page.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
