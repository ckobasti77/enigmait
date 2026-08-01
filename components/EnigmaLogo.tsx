import clsx from "clsx";

type EnigmaLogoProps = {
  className?: string;
  variant?: "light" | "dark";
};

type Palette = {
  gradientFrom: string;
  gradientTo: string;
  digital: string;
};

const palette: Record<Required<EnigmaLogoProps>["variant"], Palette> = {
  light: {
    gradientFrom: "#38bdf8",
    gradientTo: "#a855f7",
    digital: "#ffffff",
  },
  dark: {
    gradientFrom: "#58c4ff",
    gradientTo: "#8c6cff",
    digital: "#0b1221",
  },
};

export default function EnigmaLogo({
  className,
  variant = "light",
}: EnigmaLogoProps) {
  const colors = palette[variant];

  return (
    <span
      className={clsx(
        "relative inline-block select-none text-transparent",
        "bg-clip-text bg-gradient-to-r",
        className
      )}
      style={{
        fontFamily: "var(--font-deltha), serif",
        backgroundImage: `linear-gradient(90deg, ${colors.gradientFrom}, ${colors.gradientTo})`,
        letterSpacing: "-0.045em",
      }}
    >
      ENIGMA
      <span
        className="pointer-events-none"
        style={{
          fontFamily: "var(--font-broken-console), monospace",
          position: "absolute",
          right: "-0.65rem",
          bottom: "-0.7rem",
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.4em",
          fontWeight: 700,
          color: colors.digital,
        }}
      >
        digital
      </span>
    </span>
  );
}
