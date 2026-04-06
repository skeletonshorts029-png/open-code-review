import { BuildynexLoader } from "@/components/shared/buildynex-loader";

export default function RoadmapRouteLoading() {
  return (
    <div className="space-y-6">
      <BuildynexLoader
        title="Preparing the roadmap workspace"
        copy="Opening the roadmap view and staging the next milestone plan for this problem."
        compact
      />
    </div>
  );
}
