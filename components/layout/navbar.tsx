import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="section-shell flex h-20 items-center justify-between gap-6">
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Button href="/login" variant="secondary">
            Log in
          </Button>
          <Button href="/signup">Start Building</Button>
        </div>
      </div>
    </header>
  );
}
