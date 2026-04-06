"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { getBrandingData, getRoadmapData, getSolutionData } from "@/lib/data/role-content";
import { setActiveProjectId } from "@/lib/projects/project-session";
import { saveProject } from "@/lib/supabase/database";
import { GeneratedProjectBundle, ProblemRecord, ProjectStatus } from "@/lib/types";

export function ProjectSaveButton({
  problem,
  status = "Planning",
  bundle,
  existingProjectId,
}: {
  problem: ProblemRecord;
  status?: ProjectStatus;
  bundle?: GeneratedProjectBundle;
  existingProjectId?: string;
}) {
  const { profile, user, backendReady } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const role = profile?.role || "Founder";

  async function handleSave() {
    if (!user) return;
    if (!backendReady) {
      setMessage("Add Supabase env keys before saving projects.");
      return;
    }

    try {
      setLoading(true);
      const nextBundle = bundle || {
        solutionData: getSolutionData(problem, role),
        roadmapData: getRoadmapData(problem, role),
        brandingData: getBrandingData(problem),
      };

      const savedProjectId = await saveProject({
        id: existingProjectId,
        userId: user.uid,
        projectName: `${nextBundle.brandingData.nameIdeas[0] || problem.sector} startup plan`,
        selectedProblemId: problem.id,
        selectedProblemTitle: problem.title,
        sector: problem.sector,
        role,
        solutionData: nextBundle.solutionData,
        roadmapData: nextBundle.roadmapData,
        brandingData: nextBundle.brandingData,
        progressStatus: status,
      });
      setActiveProjectId(savedProjectId, {
        id: savedProjectId,
        projectName: `${nextBundle.brandingData.nameIdeas[0] || problem.sector} startup plan`,
        selectedProblemTitle: problem.title,
        sector: problem.sector,
        role,
      });
      setMessage(existingProjectId ? "Active project updated and kept in focus." : "Project saved and set as your active workspace.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save project.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
        {loading ? "Saving..." : "Save Project"}
      </Button>
      {message ? <p className="text-sm text-slate-400">{message}</p> : null}
    </div>
  );
}

