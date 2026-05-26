export type ShowcaseProject = {
  id: string;
  number: string;
  label: string;
  title: string;
  description: string;
  tags: string[];
  stats: {
    label: string;
    value: string;
  }[];
  accent: {
    primary: string;
    secondary: string;
    glow: string;
  };
};

export const showcaseProjects: ShowcaseProject[] = [
  {
    id: "project-alpha",
    number: "01",
    label: "POSLEDNJI PROJEKAT",
    title: "Placeholder digitalna platforma",
    description:
      "Kratak opis projekta ide ovde. Fokus na poslovni cilj, kvalitet izrade i rezultat koji ce biti prikazan kada portfolio bude spreman.",
    tags: ["Websajt", "UI/UX", "Custom code"],
    stats: [
      { label: "Status", value: "Live" },
      { label: "Tip", value: "Platforma" },
    ],
    accent: {
      primary: "#00B7FF",
      secondary: "#006DFF",
      glow: "rgba(0, 183, 255, 0.22)",
    },
  },
  {
    id: "project-orbit",
    number: "02",
    label: "NOVI CASE STUDY",
    title: "Placeholder commerce sistem",
    description:
      "Ovde ce stajati drugi najnoviji projekat sa kratkim kontekstom, industrijom, opsegom rada i glavnim benefitom za klijenta.",
    tags: ["Web-shop", "Sistem", "Optimizacija"],
    stats: [
      { label: "Status", value: "Ready" },
      { label: "Tip", value: "Commerce" },
    ],
    accent: {
      primary: "#6B37FF",
      secondary: "#8B35FF",
      glow: "rgba(139, 53, 255, 0.2)",
    },
  },
];
