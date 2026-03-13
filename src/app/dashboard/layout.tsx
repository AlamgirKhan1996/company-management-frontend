import Protected from "@/components/protected";
import Sidebar from "@/components/sidebar/sidebar";
import { ReactNode } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Protected>
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 min-h-screen p-6">
        <DashboardHeader />
        {children}
      </main>
    </div>
    </Protected>
  );
}
