"use client";

import { useEffect, useState } from "react";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { AiModeSwitch } from "@/components/shared/ai-mode-switch";
import { useTheme } from "@/components/theme/theme-provider";
import { useAuth } from "@/context/auth-context";
import { sendResetLink } from "@/lib/supabase/auth";
import { updateUserProfile, uploadProfileImage } from "@/lib/supabase/database";
import { UserRole } from "@/lib/types";

export default function SettingsPage() {
  const { profile, user, refreshProfile, backendReady } = useAuth();
  const { setTheme } = useTheme();
  const [form, setForm] = useState<{
    fullName: string;
    role: UserRole;
    goals: string;
    weeklyDigest: boolean;
    productUpdates: boolean;
    dealAlerts: boolean;
    theme: "dark" | "light" | "system";
  }>({
    fullName: profile?.fullName || "",
    role: profile?.role || "Student",
    goals: profile?.goals || "",
    weeklyDigest: profile?.notifications?.weeklyDigest ?? true,
    productUpdates: profile?.notifications?.productUpdates ?? true,
    dealAlerts: profile?.notifications?.dealAlerts ?? true,
    theme: profile?.theme || "dark",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");

  useEffect(() => {
    setForm({
      fullName: profile?.fullName || "",
      role: profile?.role || "Student",
      goals: profile?.goals || "",
      weeklyDigest: profile?.notifications?.weeklyDigest ?? true,
      productUpdates: profile?.notifications?.productUpdates ?? true,
      dealAlerts: profile?.notifications?.dealAlerts ?? true,
      theme: profile?.theme || "dark",
    });
  }, [profile]);

  async function handleSave() {
    if (!user) return;
    if (!backendReady) {
      setMessage("Add Supabase env keys before saving settings.");
      return;
    }

    try {
      setMessage("");
      setMessageTone("success");
      let profileImage = profile?.profileImage || "";
      if (imageFile) {
        profileImage = await uploadProfileImage(imageFile, user.uid);
      }

      await updateUserProfile(user.uid, {
        fullName: form.fullName,
        role: form.role as "Student" | "Founder" | "Investor",
        goals: form.goals,
        profileImage,
        notifications: {
          weeklyDigest: form.weeklyDigest,
          productUpdates: form.productUpdates,
          dealAlerts: form.dealAlerts,
        },
        theme: form.theme,
      });
      setTheme(form.theme);
      await refreshProfile();
      setMessage("Settings updated successfully.");
      setMessageTone("success");
    } catch (saveError) {
      setMessage(
        saveError instanceof Error
          ? saveError.message
          : "Buildynex could not save your settings right now."
      );
      setMessageTone("error");
    }
  }

  async function handlePasswordReset() {
    if (!profile?.email) return;
    await sendResetLink(profile.email);
    setMessage("Password reset email sent.");
    setMessageTone("success");
  }

  return (
    <div>
      <PageHeader title="Settings" copy="Manage profile edits, notifications, theme preferences, and account-level actions." action={<Button onClick={handleSave}>Save changes</Button>} />
      <div className="grid gap-6 xl:grid-cols-2">
        <SettingsPanel title="Edit profile" copy="Keep your identity and role preferences current so recommendations stay relevant.">
          <div className="grid gap-4">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Full name</span>
              <input className="input-surface" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Role preference</span>
              <select className="input-surface" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}>
                <option>Student</option>
                <option>Founder</option>
                <option>Investor</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Change profile picture</span>
              <input className="input-surface py-2.5" type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Goals</span>
              <textarea className="input-surface min-h-[140px]" value={form.goals} onChange={(event) => setForm((current) => ({ ...current, goals: event.target.value }))} />
            </label>
          </div>
        </SettingsPanel>

        <SettingsPanel title="Notifications" copy="Choose how often Buildynex should notify you about new problem signals and workspace activity.">
          <div className="space-y-4 text-sm text-slate-300">
            {[
              ["Weekly digest", "weeklyDigest"],
              ["Product updates", "productUpdates"],
              ["Deal and opportunity alerts", "dealAlerts"],
            ].map(([label, key]) => (
              <label key={key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.checked }))}
                />
              </label>
            ))}
          </div>
        </SettingsPanel>

        <SettingsPanel title="AI Mode" copy="Choose how Buildynex's AI reviews your work. Balanced is the default. Explorer mode is more forgiving. Strict mode demands real evidence.">
          <AiModeSwitch />
        </SettingsPanel>

        <SettingsPanel title="Theme" copy="Switch between dark, light, or system mode. The workspace updates instantly and saves with your profile.">
          <select
            className="input-surface"
            value={form.theme}
            onChange={(event) => {
              const nextTheme = event.target.value as "dark" | "light" | "system";
              setForm((current) => ({ ...current, theme: nextTheme }));
              setTheme(nextTheme);
            }}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </SettingsPanel>

        <SettingsPanel title="Account security" copy="Use Supabase Auth to handle password reset flows safely without exposing secrets in the client UI.">
          <div className="space-y-4">
            <Button variant="secondary" onClick={handlePasswordReset}>Send password reset email</Button>
            <p className="text-sm leading-7 text-slate-400">
              Password changes are handled by Supabase via a secure reset link sent to your email.
            </p>
          </div>
        </SettingsPanel>
      </div>
      {message ? (
        <p className={`mt-6 text-sm ${messageTone === "error" ? "text-rose-300" : "text-emerald-300"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}







