import type { ReactNode } from "react";

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return (
    <div data-service-layout className="relative min-h-screen">
      {children}
    </div>
  );
}
