export function BrandingCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="premium-card p-6">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-slate-300">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
