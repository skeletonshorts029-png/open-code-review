"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { signInWithEmail, sendResetLink, signInWithGoogle } from "@/lib/supabase/auth";
import { missingSupabaseConfigKeys } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { backendReady } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryError = searchParams.get("error");
    if (queryError) {
      setError(queryError);
      setInfo("");
    }
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInfo("");

    try {
      setLoading(true);
      const result = await signInWithEmail(form);
      const redirect =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect")
          : null;
      router.push(
        result.profile?.onboardingComplete ? redirect || "/dashboard" : "/onboarding"
      );
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      setLoading(true);
      setError("");
      setInfo("Redirecting to Google...");
      const redirect =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect")
          : null;
      await signInWithGoogle(redirect);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to continue with Google."
      );
      setInfo("");
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!form.email) {
      setError("Enter your email first so we know where to send the reset link.");
      return;
    }

    try {
      await sendResetLink(form.email);
      setInfo("Password reset link sent. Check your inbox.");
      setError("");
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Could not send reset link."
      );
    }
  }

  return (
    <div className="section-shell flex min-h-screen items-center justify-center py-12">
      <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[0.95fr,1.05fr] lg:items-center">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Logo />
            <ThemeToggle showLabel={false} />
          </div>
          <h1 className="text-5xl font-semibold leading-tight text-white">
            Return to your problem-first startup workspace.
          </h1>
          <p className="max-w-xl text-sm leading-7 text-slate-400">
            Log in to discover validated market pain, analyze Buildynex AI scores,
            and continue shaping your next startup move.
          </p>
        </div>
        <AuthCard
          title="Log in to Buildynex AI"
          copy="Access your dashboard, saved analyses, and startup plans."
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            {!backendReady ? (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                Supabase env variables are missing. Add them in `.env.local` before auth
                will work. Missing: {missingSupabaseConfigKeys.join(", ")}.
              </div>
            ) : null}
            <label className="space-y-2 text-sm text-slate-300">
              <span>Email</span>
              <input
                className="input-surface"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Password</span>
              <input
                className="input-surface"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                required
              />
            </label>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-3 text-slate-400">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      remember: event.target.checked,
                    }))
                  }
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sky-300"
              >
                Forgot password?
              </button>
            </div>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            {info ? <p className="text-sm text-emerald-300">{info}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Log in"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleGoogle}
              disabled={loading}
              leadingIcon={
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm shadow-black/10">
                  <GoogleIcon className="h-5 w-5" />
                </span>
              }
              showArrow={false}
            >
              Continue with Google
            </Button>
            <p className="text-xs leading-6 text-slate-500">
              Google sign-in now runs through Supabase. Make sure Google is enabled in
              Supabase Authentication and your local URL is listed in URL Configuration.
            </p>
            <p className="text-sm text-slate-400">
              New to Buildynex?{" "}
              <Link href="/signup" className="text-sky-300">
                Create an account
              </Link>
            </p>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
