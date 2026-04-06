import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { ProtectedRoute } from "@/components/auth/protected-route";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="section-shell flex gap-6 py-6">
        <Sidebar />
        <main className="min-w-0 flex-1 page-enter">
          <DashboardTopbar />
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
