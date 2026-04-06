import { Pill } from "@/components/ui/pill";

export function TestimonialCard({
  quote,
  name,
  title,
}: {
  quote: string;
  name: string;
  title: string;
}) {
  return (
    <div className="premium-card h-full p-6">
      <Pill tone="info">Customer signal</Pill>
      <p className="mt-5 text-sm leading-7 text-slate-300">"{quote}"</p>
      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="font-semibold text-white">{name}</div>
        <div className="text-sm text-slate-400">{title}</div>
      </div>
    </div>
  );
}
