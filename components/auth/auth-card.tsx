export function AuthCard({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <div className="premium-card panel-rise w-full max-w-xl p-8 sm:p-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.28em] text-sky-200/70">Buildynex Access</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-3 max-w-lg text-sm leading-7 text-slate-400">{copy}</p>
      </div>
      {children}
    </div>
  );
}
