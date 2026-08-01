import Hero from "./_components/Hero";
import Timeline from "./_components/Timeline";
import EffectiveSoftware from "./_components/EffectiveSoftware";
import { Disciplines } from "@/components/sections/disciplines";
import { TechSection } from "@/components/logo-marquee";

export default function Home() {
  return (
    <>
      <Hero />
      <TechSection />
      <Timeline />
      {/* <EffectiveSoftware /> */}
      <Disciplines />
    </>
  );
}

