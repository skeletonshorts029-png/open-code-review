"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/context/auth-context";
import { signInWithGoogle, signUpWithEmail } from "@/lib/supabase/auth";
import { missingSupabaseConfigKeys } from "@/lib/supabase/client";
import { updateUserProfile, uploadProfileImage } from "@/lib/supabase/database";

export default function SignupPage() {
  const router = useRouter();
  const { backendReady } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setInfo("");
      const result = await signUpWithEmail({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });

      if (result.needsEmailConfirmation) {
        setInfo("Check your inbox to confirm your email. The confirmation link will bring you into onboarding.");
        return;
      }

      if (imageFile) {
        const profileImage = await uploadProfileImage(imageFile, result.user.uid);
        await updateUserProfile(result.user.uid, { profileImage });
      }

      router.push("/onboarding");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create account."
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
      await signInWithGoogle();
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

  return (
    <div className="section-shell flex min-h-screen items-center justify-center py-12">
      <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[0.95fr,1.05fr] lg:items-center">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Logo />
            <ThemeToggle showLabel={false} />
          </div>
          <h1 className="text-5xl font-semibold leading-tight text-white">
            Create a workspace for serious startup discovery.
          </h1>
          <p className="max-w-xl text-sm leading-7 text-slate-400">
            Join Buildynex AI to uncover hidden market pain, score opportunities,
            and generate startup plans tailored to your role.
          </p>
        </div>
        <AuthCard
          title="Create your account"
          copy="Set up your Buildynex profile, upload an avatar, and enter onboarding."
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            {!backendReady ? (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                Supabase env variables are missing. Add them in `.env.local` before auth
                will work. Missing: {missingSupabaseConfigKeys.join(", ")}.
              </div>
            ) : null}
            <label className="space-y-2 text-sm text-slate-300">
              <span>Full name</span>
              <input
                className="input-surface"
                value={form.fullName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, fullName: event.target.value }))
                }
                required
              />
            </label>
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
            <label className="space-y-2 text-sm text-slate-300">
              <span>Confirm password</span>
              <input
                className="input-surface"
                type="password"
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Profile picture</span>
              <input
                className="input-surface py-2.5"
                type="file"
                accept="image/*"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              />
            </label>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            {info ? <p className="text-sm text-emerald-300">{info}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
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
              Already have an account?{" "}
              <Link href="/login" className="text-sky-300">
                Log in
              </Link>
            </p>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}


