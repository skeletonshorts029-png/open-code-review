"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import {
  budgetOptions,
  countryOptions,
  experienceOptions,
} from "@/lib/data/mock-problems";
import { updateUserProfile, uploadProfileImage } from "@/lib/supabase/database";
import { UserRole } from "@/lib/types";

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function ChoiceGroup({
  label,
  value,
  options,
  onChange,
  columns = "md:grid-cols-3",
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (nextValue: string) => void;
  columns?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-300">{label}</div>
      <div className={cn("grid gap-3", columns)}>
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left text-sm transition",
                active
                  ? "border-sky-400/45 bg-sky-400/12 text-white shadow-lg shadow-sky-400/10"
                  : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.05]"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OnboardingMultiStepForm() {
  const router = useRouter();
  const { user, profile, refreshProfile, applyProfilePatch, backendReady } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    fullName: profile?.fullName || user?.displayName || "",
    role: (profile?.role || "Student") as UserRole,
    budget: profile?.budget || budgetOptions[1],
    country: profile?.country || countryOptions[0],
    experienceLevel: profile?.experienceLevel || experienceOptions[0],
    goals:
      profile?.goals ||
      "Find a problem with real pull, validate fast, and build a credible startup path.",
    educationLevel: profile?.educationLevel || "Undergraduate",
    skills: profile?.skills?.join(", ") || "Research, writing, product thinking",
    interests: profile?.interests?.join(", ") || "AI, startups, fintech",
    availableTime: profile?.availableTime || "10 hours / week",
    startupStage: profile?.startupStage || "Pre-idea",
    teamSize: profile?.teamSize || "1-3",
    existingIdea: profile?.existingIdea || "",
    revenueStatus: profile?.revenueStatus || "Pre-revenue",
    ticketSize: profile?.ticketSize || "$25k - $100k",
    preferredSectors:
      profile?.preferredSectors?.join(", ") || "AI, fintech, healthcare",
    riskLevel: profile?.riskLevel || "Balanced",
    preferredRegion: profile?.preferredRegion || "India and Southeast Asia",
  });

  useEffect(() => {
    if (!user && !profile) return;
    setForm((current) => ({
      ...current,
      fullName: profile?.fullName || user?.displayName || current.fullName,
      role: (profile?.role || current.role) as UserRole,
      budget: profile?.budget || current.budget,
      country: profile?.country || current.country,
      experienceLevel: profile?.experienceLevel || current.experienceLevel,
      goals: profile?.goals || current.goals,
    }));
  }, [user, profile]);

  const stepTitle = useMemo(() => {
    if (step === 1) return "Core profile";
    if (step === 2) return `${form.role} lens`;
    return "Goals and finish";
  }, [step, form.role]);

  async function handleSubmit() {
    if (!user) return;
    if (!backendReady) {
      setError(
        "Supabase is not configured yet. Add your keys in .env.local before completing onboarding."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      let profileImage = profile?.profileImage || "";
      if (imageFile) {
        profileImage = await uploadProfileImage(imageFile, user.uid);
      }

      await updateUserProfile(user.uid, {
        fullName: form.fullName,
        profileImage,
        role: form.role,
        budget: form.budget,
        country: form.country,
        experienceLevel: form.experienceLevel,
        goals: form.goals,
        onboardingComplete: true,
        educationLevel: form.role === "Student" ? form.educationLevel : undefined,
        skills: form.role === "Student" ? splitList(form.skills) : undefined,
        interests: form.role === "Student" ? splitList(form.interests) : undefined,
        availableTime: form.role === "Student" ? form.availableTime : undefined,
        startupStage: form.role === "Founder" ? form.startupStage : undefined,
        teamSize: form.role === "Founder" ? form.teamSize : undefined,
        existingIdea: form.role === "Founder" ? form.existingIdea : undefined,
        revenueStatus: form.role === "Founder" ? form.revenueStatus : undefined,
        ticketSize: form.role === "Investor" ? form.ticketSize : undefined,
        preferredSectors:
          form.role === "Investor" ? splitList(form.preferredSectors) : undefined,
        riskLevel: form.role === "Investor" ? form.riskLevel : undefined,
        preferredRegion:
          form.role === "Investor" ? form.preferredRegion : undefined,
      });

      applyProfilePatch({
        fullName: form.fullName,
        profileImage,
        role: form.role,
        budget: form.budget,
        country: form.country,
        experienceLevel: form.experienceLevel,
        goals: form.goals,
        onboardingComplete: true,
      });
      await refreshProfile();
      router.replace("/dashboard");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Could not complete onboarding."
      );
    } finally {
      setLoading(false);
    }
  }

  const roleSpecificFields = {
    Student: (
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span>Education level</span>
          <input
            className="input-surface"
            value={form.educationLevel}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                educationLevel: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Available time</span>
          <input
            className="input-surface"
            value={form.availableTime}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                availableTime: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Skills</span>
          <input
            className="input-surface"
            value={form.skills}
            onChange={(event) =>
              setForm((current) => ({ ...current, skills: event.target.value }))
            }
            placeholder="Research, design, code"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Interests</span>
          <input
            className="input-surface"
            value={form.interests}
            onChange={(event) =>
              setForm((current) => ({ ...current, interests: event.target.value }))
            }
            placeholder="AI, climate, fintech"
          />
        </label>
      </div>
    ),
    Founder: (
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span>Startup stage</span>
          <input
            className="input-surface"
            value={form.startupStage}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                startupStage: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Team size</span>
          <input
            className="input-surface"
            value={form.teamSize}
            onChange={(event) =>
              setForm((current) => ({ ...current, teamSize: event.target.value }))
            }
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Existing idea</span>
          <input
            className="input-surface"
            value={form.existingIdea}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                existingIdea: event.target.value,
              }))
            }
            placeholder="Optional, if you already have a direction"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Revenue status</span>
          <input
            className="input-surface"
            value={form.revenueStatus}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                revenueStatus: event.target.value,
              }))
            }
          />
        </label>
      </div>
    ),
    Investor: (
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span>Ticket size</span>
          <input
            className="input-surface"
            value={form.ticketSize}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                ticketSize: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Risk level</span>
          <input
            className="input-surface"
            value={form.riskLevel}
            onChange={(event) =>
              setForm((current) => ({ ...current, riskLevel: event.target.value }))
            }
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Preferred sectors</span>
          <input
            className="input-surface"
            value={form.preferredSectors}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                preferredSectors: event.target.value,
              }))
            }
            placeholder="AI, healthcare, logistics"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Preferred region</span>
          <input
            className="input-surface"
            value={form.preferredRegion}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                preferredRegion: event.target.value,
              }))
            }
          />
        </label>
      </div>
    ),
  };

  return (
    <div className="premium-card max-w-5xl p-8 sm:p-10">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-sky-200/70">
            Onboarding
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white">
            Shape your Buildynex workspace
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            We use your role, market focus, and operating constraints to tailor
            problem discovery, solution generation, and roadmap suggestions.
          </p>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-semibold ${
                item <= step
                  ? "border-sky-400/40 bg-sky-400/10 text-white"
                  : "border-white/10 bg-white/[0.03] text-slate-500"
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <div>
          <div className="text-sm font-medium text-white">Step {step} of 3</div>
          <div className="text-sm text-slate-400">{stepTitle}</div>
        </div>
        <Pill tone="info">Role-aware setup</Pill>
      </div>

      {step === 1 ? (
        <div className="space-y-6">
          <label className="space-y-2 text-sm text-slate-300">
            <span>Full name</span>
            <input
              className="input-surface"
              value={form.fullName}
              onChange={(event) =>
                setForm((current) => ({ ...current, fullName: event.target.value }))
              }
            />
          </label>

          <ChoiceGroup
            label="Role"
            value={form.role}
            options={["Student", "Founder", "Investor"]}
            onChange={(nextValue) =>
              setForm((current) => ({
                ...current,
                role: nextValue as UserRole,
              }))
            }
          />


          <div className="grid gap-6 lg:grid-cols-2">
            <ChoiceGroup
              label="Budget"
              value={form.budget}
              options={budgetOptions}
              onChange={(nextValue) =>
                setForm((current) => ({ ...current, budget: nextValue }))
              }
              columns="sm:grid-cols-2"
            />
            <ChoiceGroup
              label="Experience level"
              value={form.experienceLevel}
              options={experienceOptions}
              onChange={(nextValue) =>
                setForm((current) => ({
                  ...current,
                  experienceLevel: nextValue,
                }))
              }
              columns="sm:grid-cols-3"
            />
          </div>

          <ChoiceGroup
            label="Country / market"
            value={form.country}
            options={countryOptions}
            onChange={(nextValue) =>
              setForm((current) => ({ ...current, country: nextValue }))
            }
            columns="md:grid-cols-2"
          />

          <label className="space-y-2 text-sm text-slate-300">
            <span>Profile picture</span>
            <input
              className="input-surface py-2.5"
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            />
          </label>
        </div>
      ) : step === 2 ? (
        roleSpecificFields[form.role]
      ) : (
        <div className="space-y-4">
          <label className="space-y-2 text-sm text-slate-300">
            <span>Your goals</span>
            <textarea
              className="input-surface min-h-[170px]"
              value={form.goals}
              onChange={(event) =>
                setForm((current) => ({ ...current, goals: event.target.value }))
              }
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-sm text-slate-400">Role</div>
              <div className="mt-3 text-xl font-semibold text-white">
                {form.role}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-sm text-slate-400">Budget</div>
              <div className="mt-3 text-xl font-semibold text-white">
                {form.budget}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-sm text-slate-400">Experience</div>
              <div className="mt-3 text-xl font-semibold text-white">
                {form.experienceLevel}
              </div>
            </div>
          </div>
        </div>
      )}

      {error ? <p className="mt-6 text-sm text-rose-300">{error}</p> : null}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="secondary"
          onClick={() => setStep((current) => Math.max(1, current - 1))}
          disabled={step === 1 || loading}
        >
          Back
        </Button>
        <div className="flex gap-3">
          {step < 3 ? (
            <Button onClick={() => setStep((current) => Math.min(3, current + 1))}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving profile..." : "Enter Dashboard"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


