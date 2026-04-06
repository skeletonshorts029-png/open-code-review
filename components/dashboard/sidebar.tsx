"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  ActiveProjectSummary,
  getActiveProjectSummary,
  getActiveWorkspaceHref,
  subscribeToActiveProject,
} from "@/lib/projects/project-session";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [activeProject, setActiveProject] = useState<ActiveProjectSummary | null>(null);
  const [workspaceLinks, setWorkspaceLinks] = useState({
    solution: "/dashboard/projects",
    roadmap: "/dashboard/projects",
    branding: "/dashboard/projects",
  });

  useEffect(() => {
    const syncWorkspace = () => {
      setActiveProject(getActiveProjectSummary());
      setWorkspaceLinks({
        solution: getActiveWorkspaceHref("solution"),
        roadmap: getActiveWorkspaceHref("roadmap"),
        branding: getActiveWorkspaceHref("branding"),
      });
    };

    syncWorkspace();
    return subscribeToActiveProject((summary) => {
      setActiveProject(summary);
      syncWorkspace();
    });
  }, [pathname]);

  const navItems = useMemo(
    () => [
      { id: "dashboard", href: "/dashboard", label: "Dashboard", matchPrefixes: ["/dashboard"] },
      { id: "idea-lab", href: "/dashboard/idea-lab", label: "Idea Hub", matchPrefixes: ["/dashboard/idea-lab"] },
      { id: "projects", href: "/dashboard/projects", label: "My Projects", matchPrefixes: ["/dashboard/projects"] },
      { id: "startup-plan", href: workspaceLinks.solution, label: "Startup Plan", matchPrefixes: ["/dashboard/solution"] },
      { id: "roadmap", href: workspaceLinks.roadmap, label: "Roadmap", matchPrefixes: ["/dashboard/roadmap"] },
      { id: "branding", href: workspaceLinks.branding, label: "Brand Studio", matchPrefixes: ["/dashboard/branding"] },
      { id: "goals", href: "/dashboard/goals", label: "Goals", matchPrefixes: ["/dashboard/goals"] },
      { id: "profile", href: "/dashboard/profile", label: "Profile", matchPrefixes: ["/dashboard/profile"] },
      { id: "settings", href: "/dashboard/settings", label: "Settings", matchPrefixes: ["/dashboard/settings"] },
    ],
    [workspaceLinks]
  );

  return (
    <aside className="premium-card panel-rise sticky top-6 hidden h-[calc(100vh-3rem)] w-72 flex-col overflow-hidden p-5 lg:flex">
      <Logo />
      <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-200/70">
          Active Project
        </div>
        {activeProject ? (
          <div className="mt-3">
            <div className="text-base font-semibold text-white">{activeProject.projectName}</div>
            <div className="mt-2 text-sm leading-6 text-slate-400">{activeProject.selectedProblemTitle}</div>
            <div className="mt-3 inline-flex rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-100">
              {activeProject.sector}
            </div>
          </div>
        ) : (
          <div className="mt-3 text-sm leading-6 text-slate-400">
            Activate one project from My Projects and the sidebar workspace will follow it.
          </div>
        )}
      </div>
      <div className="mt-8 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="space-y-2">
        {navItems.map((item) => {
          const active = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : item.matchPrefixes.some((prefix) => pathname.startsWith(prefix));
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition duration-300",
                active
                  ? "border border-sky-300/20 bg-gradient-to-r from-fuchsia-500/22 to-sky-400/22 text-white shadow-[0_0_0_1px_rgba(125,211,252,0.14),0_0_34px_rgba(56,189,248,0.18)]"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              )}
            >
              <span className={cn("status-dot", active ? "bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.9)]" : "bg-slate-600")} />
              {item.label}
            </Link>
          );
        })}
        </div>
      </div>
      <div className="mt-auto space-y-4 pt-5">
        <ThemeToggle className="w-full justify-center" />
      </div>
    </aside>
  );
}
