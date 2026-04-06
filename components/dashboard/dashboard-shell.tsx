"use client";

import { useState } from "react";
import { MobileSidebar, Sidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { ProtectedRoute } from "@/components/auth/protected-route";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="section-shell flex gap-6 px-4 py-4 sm:px-6 lg:px-0 lg:py-6">
        <MobileSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
        <Sidebar />
        <main className="min-w-0 flex-1 page-enter">
          <DashboardTopbar onOpenMobileNav={() => setMobileSidebarOpen(true)} />
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
