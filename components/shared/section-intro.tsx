export function SectionIntro({
  eyebrow,
  title,
  copy,
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="max-w-3xl space-y-4">
      {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200/70">{eyebrow}</p> : null}
      <h2 className="section-heading balance-text">{title}</h2>
      {copy ? <p className="section-copy">{copy}</p> : null}
    </div>
  );
}
