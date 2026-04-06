"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({
  children,
  requireOnboarding = true,
}: ProtectedRouteProps) {
  const { user, profile, loading, backendReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!backendReady) return;

    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requireOnboarding && profile && !profile.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }

    if (!requireOnboarding && profile?.onboardingComplete && pathname === "/onboarding") {
      router.replace("/dashboard");
    }
  }, [user, profile, loading, router, requireOnboarding, pathname, backendReady]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="premium-card w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-gradient-to-br from-fuchsia-500/25 to-sky-400/20" />
          <p className="text-lg font-semibold text-white">Preparing your workspace</p>
          <p className="mt-2 text-sm text-slate-400">Checking your Supabase session and loading your Buildynex profile.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

