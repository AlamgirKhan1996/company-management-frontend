"use client";

import {
  Home,
  Users,
  Building2,
  FolderKanban,
  ClipboardList,
  Settings,
  Menu,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";

const menuItems = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Departments", icon: Building2, href: "/dashboard/departments" },
  { name: "Employees", icon: Users, href: "/dashboard/employees" },
  { name: "Projects", icon: FolderKanban, href: "/dashboard/projects" },
  { name: "Tasks", icon: ClipboardList, href: "/dashboard/tasks" },
  { name: "Users", icon: Users, href: "/dashboard/users" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={clsx(
        "h-screen bg-gray-900 text-white flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && <h1 className="text-xl font-bold">CMS</h1>}
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu */}
      <div className="flex-1 flex flex-col gap-1 mt-4">
        {menuItems.map((item) => (
          <Link href={item.href} key={item.name}>
            <div
              className={clsx(
                "flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800 rounded-md transition-all",
                collapsed && "justify-center"
              )}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.name}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
<div className="mt-auto p-4">
  <button
    onClick={() => {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; max-age=0;";
      window.location.href = "/login";
    }}
    className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
  >
    Logout
  </button>
</div>

