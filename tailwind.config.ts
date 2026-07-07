import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/presentation/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Paleta intencionadamente neutra y desaturada (inspiración Apple Health / Notion).
      // Ampliar aquí cuando se defina el design system completo, nunca con colores saturados.
      colors: {
        surface: {
          DEFAULT: "hsl(var(--surface))",
          elevated: "hsl(var(--surface-elevated))",
        },
        accent: "hsl(var(--accent))",
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
