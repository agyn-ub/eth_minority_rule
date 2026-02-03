import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          light: "hsl(var(--primary-light))",
          dark: "hsl(var(--primary-dark))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          glow: "hsl(var(--accent-glow))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
        },
        state: {
          waiting: "hsl(var(--state-waiting))",
          commit: "hsl(var(--state-commit))",
          reveal: "hsl(var(--state-reveal))",
          completed: "hsl(var(--state-completed))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          elevated: "hsl(var(--surface-elevated))",
        },
      },
      fontFamily: {
        display: ["Montserrat", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        hero: ["2.5rem", { lineHeight: "1.2", fontWeight: "700" }],
        h1: ["1.875rem", { lineHeight: "1.3", fontWeight: "700" }],
        h2: ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }],
        h3: ["1.25rem", { lineHeight: "1.5", fontWeight: "600" }],
        "body-lg": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
      },
      spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "4rem",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        sm: "0 2px 8px rgba(0, 0, 0, 0.5)",
        DEFAULT: "0 4px 16px rgba(0, 0, 0, 0.6)",
        lg: "0 8px 32px rgba(0, 0, 0, 0.8)",
        "glow-pink": "0 0 32px rgba(237, 27, 118, 0.5)",
        "glow-teal": "0 0 32px rgba(0, 166, 147, 0.5)",
        "glow-success": "0 0 24px rgba(6, 116, 113, 0.5)",
        brutal: "0 4px 0 rgba(237, 27, 118, 0.8), 0 8px 32px rgba(0, 0, 0, 0.9)",
      },
      keyframes: {
      },
      animation: {
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
