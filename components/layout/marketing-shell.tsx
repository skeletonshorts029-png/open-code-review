import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
