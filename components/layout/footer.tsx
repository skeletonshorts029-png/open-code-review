import Link from "next/link";
import { Logo } from "@/components/shared/logo";

const footerSections = [
  {
    title: "Product",
    items: [
      { label: "Homepage", href: "/" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Discover", href: "/dashboard/discover" },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "Projects", href: "/dashboard/projects" },
      { label: "Roadmap", href: "/dashboard/roadmap/education-project-portfolios" },
      { label: "Brand Studio", href: "/dashboard/branding/education-project-portfolios" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Log in", href: "/login" },
      { label: "Sign up", href: "/signup" },
      { label: "Settings", href: "/dashboard/settings" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/" },
      { label: "Contact", href: "/" },
      { label: "Terms", href: "/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/70">
      <div className="section-shell grid gap-10 py-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xl text-sm leading-7 text-slate-400">
            Buildynex AI helps students, founders, and investors discover real market pain, score it with AI, and turn strong problems into startup plans worth pursuing.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 text-sm text-slate-400 sm:grid-cols-2 xl:grid-cols-4">
          {footerSections.map(({ title, items }) => (
            <div key={title} className="min-w-0">
              <div className="font-semibold text-white">{title}</div>
              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="inline-flex max-w-full break-words transition hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
