import { BuildynexLoader } from "@/components/shared/buildynex-loader";

export default function BrandingRouteLoading() {
  return (
    <div className="space-y-6">
      <BuildynexLoader
        title="Opening Brand Studio"
        copy="Loading company names, positioning, logo direction, and the visual identity workspace."
        compact
      />
    </div>
  );
}
