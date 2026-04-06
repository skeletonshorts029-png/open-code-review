import type { AuthError, User as SupabaseUser } from "@supabase/supabase-js";
import { AuthenticatedUser, UserProfile } from "@/lib/types";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import {
  buildFallbackProfile,
  createUserProfileDocument,
  getSupabaseProjectLabel,
} from "@/lib/supabase/database";

function mapSupabaseUser(user: SupabaseUser): AuthenticatedUser {
  return {
    uid: user.id,
    email: user.email || "",
    displayName:
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      (user.user_metadata?.user_name as string | undefined) ||
      undefined,
    photoURL:
      (user.user_metadata?.avatar_url as string | undefined) ||
      (user.user_metadata?.picture as string | undefined) ||
      undefined,
  };
}

function mapAuthError(error: unknown) {
  if (!error || typeof error !== "object") {
    return "Authentication failed. Please try again.";
  }

  const authError = error as AuthError;
  const message = authError.message || "Authentication failed.";
  const projectLabel = getSupabaseProjectLabel();
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("email not confirmed")) {
    return "Confirm your email first, then come back and sign in.";
  }

  if (lowerMessage.includes("invalid login credentials")) {
    return "That email or password is incorrect.";
  }

  if (lowerMessage.includes("user already registered")) {
    return "An account with this email already exists. Try logging in instead.";
  }

  if (lowerMessage.includes("provider is not enabled")) {
    return `Google sign-in is not enabled in Supabase project "${projectLabel}" yet. Open Supabase Authentication > Sign In / Providers > Google, enable it, paste your Google client ID and secret, save, and try again.`;
  }

  if (lowerMessage.includes("redirect url") || lowerMessage.includes("redirect_uri")) {
    return "The Google redirect URL is not allowed yet. Make sure your Supabase URL Configuration includes your local app URL and /auth/callback.";
  }

  return message;
}

async function loadFreshProfile(uid: string) {
  const { getUserProfile } = await import("@/lib/supabase/database");
  return getUserProfile(uid);
}

function getGoogleRedirectUrl(redirectPath?: string | null) {
  if (typeof window === "undefined") return undefined;

  const callbackUrl = new URL("/auth/callback", window.location.origin);
  if (redirectPath) {
    callbackUrl.searchParams.set("redirect", redirectPath);
  }

  return callbackUrl.toString();
}
function getEmailConfirmationRedirectUrl() {
  if (typeof window === "undefined") return undefined;

  return new URL("/onboarding", window.location.origin).toString();
}

export async function signUpWithEmail({
  fullName,
  email,
  password,
}: {
  fullName: string;
  email: string;
  password: string;
}) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Add your environment variables first.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: getEmailConfirmationRedirectUrl(),
    },
  });

  if (error || !data.user) {
    throw new Error(mapAuthError(error));
  }

  const user = mapSupabaseUser(data.user);
  const needsEmailConfirmation = !data.session;
  const profile = needsEmailConfirmation
    ? buildFallbackProfile(user, {
        fullName,
        email,
        onboardingComplete: false,
      })
    : await createUserProfileDocument(user, {
        fullName,
        email,
        onboardingComplete: false,
      });

  return {
    user,
    profile,
    needsEmailConfirmation,
  };
}

export async function signInWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
  remember?: boolean;
}) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Add your environment variables first.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    throw new Error(mapAuthError(error));
  }

  const user = mapSupabaseUser(data.user);
  const profile: UserProfile =
    (await loadFreshProfile(user.uid)) ||
    (await createUserProfileDocument(user, {
      fullName: user.displayName || "Buildynex User",
      email: user.email,
      profileImage: user.photoURL || "",
      onboardingComplete: false,
    })) ||
    buildFallbackProfile(user);

  return { user, profile };
}

export async function signInWithGoogle(redirectPath?: string | null) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Add your environment variables first.");
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getGoogleRedirectUrl(redirectPath),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw new Error(mapAuthError(error));
  }

  if (data.url && typeof window !== "undefined") {
    window.location.assign(data.url);
  }
}

export async function sendResetLink(email: string) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Add your environment variables first.");
  }

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/login`
      : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    throw new Error(mapAuthError(error));
  }
}

export async function signOutUser() {
  if (!supabase || !isSupabaseConfigured) return;

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(mapAuthError(error));
  }
}

export { mapAuthError, mapSupabaseUser };


