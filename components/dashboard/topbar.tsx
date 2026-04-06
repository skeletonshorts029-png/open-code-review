"use client";

import { useMemo } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Pill } from "@/components/ui/pill";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/context/auth-context";

export function DashboardTopbar({ onOpenMobileNav }: { onOpenMobileNav?: () => void }) {
  const { profile, logout } = useAuth();
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="premium-card panel-rise mb-6 flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-100 transition hover:border-sky-300/30 hover:bg-sky-400/10 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Avatar name={profile?.fullName} image={profile?.profileImage} />
        <div>
          <div className="text-sm text-slate-400">{greeting}</div>
          <div className="text-xl font-semibold text-white">{profile?.fullName || "Buildynex Builder"}</div>
        </div>
        {profile?.role ? <Pill tone="info">{profile.role}</Pill> : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ThemeToggle className="" />
        <Button href="/dashboard/projects">Open projects</Button>
        <Button onClick={() => logout()} variant="secondary" showArrow={false}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
