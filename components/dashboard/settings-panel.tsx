export function SettingsPanel({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <div className="premium-card hover-lift-soft panel-rise p-6">
      <div className="mb-5">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-400">{copy}</p>
      </div>
      {children}
    </div>
  );
}
