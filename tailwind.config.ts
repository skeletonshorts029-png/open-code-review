import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      // ── Neural Deep colour palette ─────────────────────────────
      colors: {
        background: "#02040a",
        surface:    "#0a0f1e",
        border:     "rgba(255,255,255,0.08)",
        primary:    "#6366F1",    // indigo — "Intelligence"
        accent:     "#06B6D4",    // cyan   — "Processing"
        glow:       "#3B82F6",    // blue   — background radials
        success:    "#22c55e",
        warning:    "#facc15",
        danger:     "#f87171",
      },

      // ── Box shadows ────────────────────────────────────────────
      boxShadow: {
        glow:  "0 0 0 1px rgba(99,102,241,0.08), 0 30px 64px rgba(0,0,0,0.6)",
        card:  "0 24px 48px rgba(0,0,0,0.45)",
        neon:  "0 0 20px rgba(99,102,241,0.5), 0 0 40px rgba(99,102,241,0.2)",
        cyan:  "0 0 16px rgba(6,182,212,0.55)",
      },

      // ── Border radii ────────────────────────────────────────────
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      // ── Custom timing functions ─────────────────────────────────
      transitionTimingFunction: {
        quantum:    "cubic-bezier(0.4, 0, 0.2, 1)",
        "spring-out": "cubic-bezier(0.2, 0.8, 0.2, 1)",
        "ease-snap": "cubic-bezier(0.3, 0, 0.6, 1)",
      },

      // ── Keyframes ──────────────────────────────────────────────
      keyframes: {
        meshWander: {
          "0%":   { transform: "scale(1) translate(0, 0)" },
          "50%":  { transform: "scale(1.1) translate(10%, -10%)" },
          "100%": { transform: "scale(1.05) translate(-5%, 5%)" },
        },
        pulseGlow: {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 8px 2px rgba(6, 182, 212, 0.65)",
          },
          "50%": {
            opacity: "0.45",
            boxShadow: "0 0 3px 1px rgba(6, 182, 212, 0.25)",
          },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition:  "200% center" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        quantumSpin: {
          "0%":   { transform: "rotate(0deg)" },
          "50%":  { transform: "rotate(200deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        neonPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99,102,241,0.5), 0 0 40px rgba(99,102,241,0.2)" },
          "50%":       { boxShadow: "0 0 30px rgba(99,102,241,0.8), 0 0 60px rgba(99,102,241,0.35)" },
        },
      },

      // ── Animation utilities ─────────────────────────────────────
      animation: {
        "mesh-wander":  "meshWander 20s ease-in-out infinite alternate",
        "pulse-glow":   "pulseGlow 1.8s ease-in-out infinite",
        "shimmer":      "shimmer 1.8s linear infinite",
        "fade-in-up":   "fadeInUp 0.7s ease forwards",
        "quantum-spin": "quantumSpin 5s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "neon-pulse":   "neonPulse 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
