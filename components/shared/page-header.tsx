import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  copy,
  action,
  className,
}: {
  title: string;
  copy?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("reveal-up mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
        {copy ? <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">{copy}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
