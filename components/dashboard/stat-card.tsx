export function DashboardStatCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="premium-card hover-lift-soft panel-rise p-5">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-5 text-4xl font-semibold text-white">{value}</div>
      <div className="mt-4 text-sm text-emerald-300">{change}</div>
    </div>
  );
}
