import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";

export function PricingCard({
  name,
  price,
  description,
  features,
  featured,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
}) {
  return (
    <div className={`premium-card flex h-full flex-col p-6 ${featured ? "border-fuchsia-400/40 bg-white/[0.08]" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-white">{name}</h3>
          <p className="mt-2 text-sm text-slate-400">{description}</p>
        </div>
        {featured ? <Pill tone="info">Popular</Pill> : null}
      </div>
      <div className="mt-8 flex items-end gap-2">
        <span className="text-5xl font-semibold text-white">{price}</span>
        <span className="pb-2 text-sm text-slate-500">/ month</span>
      </div>
      <div className="mt-8 space-y-3 text-sm text-slate-300">
        {features.map((feature) => (
          <div key={feature} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            {feature}
          </div>
        ))}
      </div>
      <Button href="/signup" className="mt-8 w-full">
        Choose {name}
      </Button>
    </div>
  );
}
