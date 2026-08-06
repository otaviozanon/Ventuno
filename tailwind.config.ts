import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: "#111111",
        "surface-raised": "#1c1c1c",
        "surface-overlay": "#242424",
        "surface-card": "#2a2a2a",
        brand: "#d4af37",
        "brand-light": "#f0d577",
        "brand-dark": "#b8941f",
        "brand-glow": "rgba(212, 175, 55, 0.2)",
        "accent-danger": "#ef4444",
        "accent-success": "#22c55e",
        "accent-warning": "#f59e0b",
        "accent-info": "#3498db",
        "text-primary": "#fafafa",
        "text-secondary": "#a3a3a3",
        "text-muted": "#737373",
        border: "rgba(255, 255, 255, 0.06)",
        "border-hover": "rgba(255, 255, 255, 0.1)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["var(--font-russo-one)", "sans-serif"],
        heading: ["var(--font-righteous)", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out",
        "slide-up": "slideUp 250ms ease-out",
        "scale-in": "scaleIn 200ms ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
