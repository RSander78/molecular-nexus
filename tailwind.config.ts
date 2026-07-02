import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        navy: {
          DEFAULT: "#0a1628",
          light: "#1a2a4a",
        },
        brand: {
          DEFAULT: "#2563eb",
          dark: "#1e3a5f",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
