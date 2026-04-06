"use client";

import { useEffect, useState } from "react";
import { DashboardStatCard } from "@/components/dashboard/stat-card";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { getProjects, getSavedProblems } from "@/lib/supabase/database";

export default function ProfilePage() {
  const { profile, user, backendReady } = useAuth();
  const [projectCount, setProjectCount] = useState(0);
  const [savedProblemCount, setSavedProblemCount] = useState(0);

  useEffect(() => {
    async function load() {
      if (!user || !backendReady) return;

      try {
        const [projects, saved] = await Promise.all([getProjects(user.uid), getSavedProblems(user.uid)]);
        setProjectCount(projects.length);
        setSavedProblemCount(saved.length);
      } catch {
        setProjectCount(0);
        setSavedProblemCount(0);
      }
    }

    load();
  }, [user, backendReady]);

  return (
    <div>
      <PageHeader title="Profile" copy="Your profile informs which problem opportunities Buildynex surfaces and how each plan is framed." action={<Button href="/dashboard/settings">Edit settings</Button>} />
      <ProfileCard profile={profile} />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard label="Role" value={profile?.role || "Unset"} change="Current recommendation lens" />
        <DashboardStatCard label="Experience" value={profile?.experienceLevel || "Unset"} change="Execution confidence today" />
        <DashboardStatCard label="Saved problems" value={String(savedProblemCount)} change="Analyses kept in your library" />
        <DashboardStatCard label="Projects" value={String(projectCount)} change="Startup paths currently saved" />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="premium-card panel-rise p-6">
          <h2 className="text-2xl font-semibold text-white">Builder profile</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Budget range", profile?.budget || "Not set"],
              ["Country / market", profile?.country || "Not set"],
              ["Experience level", profile?.experienceLevel || "Not set"],
              ["Goals", profile?.goals || "Not set"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
                <div className="text-slate-500">{label}</div>
                <div className="mt-2 text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="premium-card panel-rise p-6">
          <h2 className="text-2xl font-semibold text-white">Why this matters</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">Your role changes how Buildynex frames startup solutions, whether beginner-friendly, venture-scale, or investment-grade.</div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">Your experience level and operating market help Buildynex suggest opportunities that feel more actionable instead of purely theoretical.</div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">Your goals and budget keep recommendations grounded in what you can actually execute next.</div>
          </div>
        </div>
      </div>
    </div>
  );
}




