import { SkeletonBlock } from "@/components/ui/skeleton-block";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="premium-card p-6">
        <SkeletonBlock className="h-8 w-56" />
        <SkeletonBlock className="mt-5 h-20 w-full" />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="premium-card p-6">
            <SkeletonBlock className="h-6 w-24" />
            <SkeletonBlock className="mt-5 h-10 w-full" />
            <SkeletonBlock className="mt-4 h-20 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
