/**
 * The five phases of the process section.
 *
 * `accent` / `glow` are CSS variables rather than literals: the ramp is defined
 * once per palette in `globals.css`, so light mode, dark mode and the alt mood
 * each get their own reading of "step 1 is the cool end, step 5 is the warm
 * end" without this file knowing which theme is on. Alpha variants are derived
 * at use-site with `color-mix()`, which is why the tokens must stay opaque
 * colours and not pre-baked rgba.
 */

import type { ProcessIconName } from "@/components/ui/process-icons";

export type ProcessStep = {
  /** Not rendered — kept as the stable React key and the aria label. */
  number: string;
  title: string;
  description: string;
  imageSrc: string;
  icon: ProcessIconName;
  accent: string;
  glow: string;
};

/**
 * Which side of the spine each card sits on, from the top down. First and last
 * straddle the spine so the run reads as a closed shape rather than a zig-zag
 * that trails off. Below `lg` every card is centred and this is ignored.
 */
export const PROCESS_CARD_POSITIONS = [
  "center",
  "left",
  "right",
  "left",
  "center",
] as const;

export type ProcessCardPosition = (typeof PROCESS_CARD_POSITIONS)[number];

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "IDEJA & ANALIZA",
    description:
      "Razumemo vaš biznis, ciljeve i korisnike. Analiziramo potrebe i pretvaramo ideju u jasan plan.",
    imageSrc: "/images/proces-1.avif",
    icon: "lightbulb",
    accent: "var(--process-accent-1)",
    glow: "var(--process-glow-1)",
  },
  {
    number: "02",
    title: "PLANIRANJE & DIZAJN",
    description:
      "Kreiramo strategiju, strukturu i dizajn koji spajaju funkcionalnost i vrhunsko korisničko iskustvo.",
    imageSrc: "/images/proces-2.avif",
    icon: "pencil",
    accent: "var(--process-accent-2)",
    glow: "var(--process-glow-2)",
  },
  {
    number: "03",
    title: "RAZVOJ & IMPLEMENTACIJA",
    description:
      "Gradimo brzo, sigurno i skalabilno rešenje koristeći moderne tehnologije i najbolje prakse.",
    imageSrc: "/images/proces-3.avif",
    icon: "code",
    accent: "var(--process-accent-3)",
    glow: "var(--process-glow-3)",
  },
  {
    number: "04",
    title: "TESTIRANJE & OPTIMIZACIJA",
    description:
      "Temeljno testiramo svaki detalj i optimizujemo performanse za besprekorno iskustvo.",
    imageSrc: "/images/proces-4.avif",
    icon: "shield",
    accent: "var(--process-accent-4)",
    glow: "var(--process-glow-4)",
  },
  {
    number: "05",
    title: "LAUNCH & PODRŠKA",
    description:
      "Pokrećemo projekat i ostajemo uz vas kroz podršku, održavanje i dalji razvoj.",
    imageSrc: "/images/proces-5.avif",
    icon: "rocket",
    accent: "var(--process-accent-5)",
    glow: "var(--process-glow-5)",
  },
];
