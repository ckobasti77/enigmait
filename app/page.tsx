import Hero from "./_components/Hero";
import Timeline from "./_components/Timeline";
import { Disciplines } from "@/components/sections/disciplines";
import { TechSection } from "@/components/logo-marquee";

export default function Home() {
  return (
    <>
      <Hero />
      <Timeline />
      <Disciplines />
      <TechSection />
    </>
  );
}

