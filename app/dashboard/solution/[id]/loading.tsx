import { BuildynexLoader } from "@/components/shared/buildynex-loader";

export default function SolutionRouteLoading() {
  return (
    <div className="space-y-6">
      <BuildynexLoader
        title="Preparing the startup plan"
        copy="Opening your solution workspace and loading the AI-generated strategy for this problem."
        compact
      />
    </div>
  );
}
