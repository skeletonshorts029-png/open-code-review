"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { signOutUser } from "@/lib/supabase/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import {
  buildFallbackProfile,
  createUserProfileDocument,
  getUserProfile,
} from "@/lib/supabase/database";
import { AuthenticatedUser, UserProfile } from "@/lib/types";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  profile: UserProfile | null;
  loading: boolean;
  backendReady: boolean;
  refreshProfile: () => Promise<void>;
  applyProfilePatch: (patch: Partial<UserProfile>) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapUser(nextUser: SupabaseUser): AuthenticatedUser {
  return {
    uid: nextUser.id,
    email: nextUser.email || "",
    displayName:
      (nextUser.user_metadata?.full_name as string | undefined) ||
      (nextUser.user_metadata?.name as string | undefined) ||
      undefined,
    photoURL:
      (nextUser.user_metadata?.avatar_url as string | undefined) ||
      (nextUser.user_metadata?.picture as string | undefined) ||
      undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let active = true;

    async function syncAuth(nextUser: SupabaseUser | null) {
      if (!active) return;
      setLoading(true);

      if (!nextUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const mappedUser = mapUser(nextUser);
      setUser(mappedUser);

      try {
        const nextProfile = await createUserProfileDocument(mappedUser, {
          fullName: mappedUser.displayName || undefined,
          email: mappedUser.email,
          profileImage: mappedUser.photoURL || undefined,
        });
        if (!active) return;
        setProfile(nextProfile || buildFallbackProfile(mappedUser));
      } catch {
        if (!active) return;
        setProfile(buildFallbackProfile(mappedUser));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void supabase.auth.getSession().then(({ data }) => syncAuth(data.session?.user || null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncAuth(session?.user || null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function refreshProfile() {
    if (!user) return;

    try {
      const nextProfile = await getUserProfile(user.uid);
      setProfile((current) => nextProfile || current || buildFallbackProfile(user));
    } catch {
      setProfile((current) => current || buildFallbackProfile(user));
    }
  }

  function applyProfilePatch(patch: Partial<UserProfile>) {
    if (!user) return;
    setProfile((current) => ({
      ...(current || buildFallbackProfile(user)),
      ...patch,
    }));
  }

  async function logout() {
    await signOutUser();
    setProfile(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      backendReady: isSupabaseConfigured,
      refreshProfile,
      applyProfilePatch,
      logout,
    }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
