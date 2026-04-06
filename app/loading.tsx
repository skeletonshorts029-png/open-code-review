import { BuildynexLoader } from "@/components/shared/buildynex-loader";

export default function RootLoading() {
  return (
    <div className="section-shell flex min-h-screen items-center justify-center py-12">
      <BuildynexLoader />
    </div>
  );
}
