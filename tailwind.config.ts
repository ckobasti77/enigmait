import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        deltha: ["var(--font-deltha)", ...defaultTheme.fontFamily.sans],
        aeonik: ["var(--font-aeonik)", ...defaultTheme.fontFamily.sans],
        brokenConsole: [
          "var(--font-broken-console)",
          ...defaultTheme.fontFamily.sans,
        ],
        accent: [
          "var(--font-broken-console)",
          ...defaultTheme.fontFamily.sans,
        ],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 36s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
