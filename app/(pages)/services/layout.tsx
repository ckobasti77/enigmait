import type { Metadata } from "next";
import type { ReactNode } from "react";

// Covers the /services index (a client page that cannot export its own
// metadata); every detail page overrides with buildServiceMetadata.
export const metadata: Metadata = {
  title: "Usluge — Enigma Digital",
  description:
    "Web development, UI/UX dizajn, mobilne aplikacije, SEO i GEO, brending i društvene mreže — šest disciplina, jedan tim.",
};

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return (
    <div data-service-layout className="relative min-h-screen">
      {children}
    </div>
  );
}
