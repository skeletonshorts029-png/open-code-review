"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { saveProblemForUser } from "@/lib/supabase/database";

export function SaveProblemButton({ problemId }: { problemId: string }) {
  const { user, backendReady } = useAuth();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!user) return;
    if (!backendReady) {
      setMessage("Add Supabase env keys before saving analyses.");
      return;
    }

    try {
      setLoading(true);
      await saveProblemForUser({ userId: user.uid, problemId });
      setMessage("Problem analysis saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save problem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button variant="secondary" onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save Analysis"}
      </Button>
      {message ? <p className="text-sm text-slate-400">{message}</p> : null}
    </div>
  );
}

