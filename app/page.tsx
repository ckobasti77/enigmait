import { Hero } from "@/components/sections/hero";
import { TechSection } from "@/components/sections/tech";
import { ProcessSection } from "@/components/sections/process";
import { PortfolioSection } from "@/components/sections/portfolio";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <TechSection />
      <ProcessSection />
      <PortfolioSection />
    </main>
  );
}
