"use client";

import { DotField } from "@/components/ui/dot-field-background";

export default function DotFieldBackgroundGlobal() {
  return (
    <div aria-hidden className="fixed inset-0 z-0 pointer-events-none select-none">
      <DotField className="absolute inset-0" />
      <div className="absolute inset-0" style={{ backgroundColor: "var(--field-overlay)" }} />
    </div>
  );
}
