import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  copy,
  actionHref,
  actionLabel,
}: {
  title: string;
  copy: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="premium-card p-10 text-center">
      <div className="mx-auto h-16 w-16 rounded-3xl bg-gradient-to-br from-fuchsia-500/20 to-sky-400/20" />
      <h3 className="mt-6 text-2xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">{copy}</p>
      {actionHref && actionLabel ? (
        <Button href={actionHref} className="mt-6">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
