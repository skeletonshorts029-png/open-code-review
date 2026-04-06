import { cn } from "@/lib/utils";

export function ProgressAnalysisChart({
  items,
}: {
  items: Array<{ label: string; value: number; tone?: "primary" | "success" | "warning" | "danger" }>;
}) {
  return (
    <div className="space-y-5">
      {items.map((item) => {
        const barClass = {
          primary: "from-fuchsia-500 to-sky-400",
          success: "from-emerald-400 to-lime-300",
          warning: "from-amber-400 to-yellow-300",
          danger: "from-rose-400 to-orange-300",
        }[item.tone || "primary"];

        return (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{item.label}</span>
              <span className="font-medium text-white">{item.value}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/5">
              <div
                className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", barClass)}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
