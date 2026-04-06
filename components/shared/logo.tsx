import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="logo-link inline-flex items-center gap-3">
      <div className="logo-mark">
        <div className="logo-core" />
        <div className="logo-orbit" />
        <div className="logo-spark logo-spark-top" />
        <div className="logo-spark logo-spark-bottom" />
        <span className="logo-glyph">BN</span>
      </div>
      {!compact && (
        <div className="logo-copy">
          <div className="logo-wordmark">BUILDYNEX AI</div>
          <div className="logo-subline">Problem-first startup intelligence</div>
        </div>
      )}
    </Link>
  );
}
