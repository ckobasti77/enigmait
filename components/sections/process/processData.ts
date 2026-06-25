export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  imageSrc: string;
  icon: "lightbulb" | "pencil" | "code" | "rocket" | "shield";
  glowColor: string;
  accentColor: string;
}

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "IDEJA & ANALIZA",
    description:
      "Razumemo vaš biznis, ciljeve i korisnike. Analiziramo potrebe i pretvaramo ideju u jasan plan.",
    imageSrc: "/images/proces-1.avif",
    icon: "lightbulb",
    glowColor: "rgba(0, 183, 255, 0.35)",
    accentColor: "#00B7FF",
  },
  {
    number: "02",
    title: "PLANIRANJE & DIZAJN",
    description:
      "Kreiramo strategiju, strukturu i dizajn koji spajaju funkcionalnost i vrhunsko korisničko iskustvo.",
    imageSrc: "/images/proces-2.avif",
    icon: "pencil",
    glowColor: "rgba(0, 109, 255, 0.35)",
    accentColor: "#006DFF",
  },
  {
    number: "03",
    title: "RAZVOJ & IMPLEMENTACIJA",
    description:
      "Gradimo brzo, sigurno i skalabilno rešenje koristeći moderne tehnologije i najbolje prakse.",
    imageSrc: "/images/proces-3.avif",
    icon: "code",
    glowColor: "rgba(107, 55, 255, 0.35)",
    accentColor: "#6B37FF",
  },
  {
    number: "04",
    title: "TESTIRANJE & OPTIMIZACIJA",
    description:
      "Temeljno testiramo svaki detalj i optimizujemo performanse za besprekorno iskustvo.",
    imageSrc: "/images/proces-4.avif",
    icon: "shield",
    glowColor: "rgba(139, 53, 255, 0.35)",
    accentColor: "#8B35FF",
  },
  {
    number: "05",
    title: "LAUNCH & PODRŠKA",
    description:
      "Pokrećemo projekat i ostajemo uz vas kroz podršku, održavanje i dalji razvoj.",
    imageSrc: "/images/proces-5.avif",
    icon: "rocket",
    glowColor: "rgba(139, 53, 255, 0.30)",
    accentColor: "#9B45FF",
  },
];
