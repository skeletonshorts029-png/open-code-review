"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Pill } from "@/components/ui/pill";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/context/auth-context";

export function DashboardTopbar() {
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
