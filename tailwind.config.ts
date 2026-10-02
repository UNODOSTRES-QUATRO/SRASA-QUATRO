import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/game/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        quatro: {
          cream: "#fbf8f2",
          paper: "#f3ede2",
          amber: "#e09f58",
          warmOrange: "#d97736",
          navy: "#1a1e29",
          slate: "#2a3142",
          mutedGreen: "#6b8c6e",
          dustyBlue: "#7994a6",
          darkWood: "#3a261a",
          softGray: "#e5e0d8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
