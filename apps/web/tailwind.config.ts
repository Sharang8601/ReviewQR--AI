import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17212b",
        mist: "#f3f6f4",
        fern: "#2f6f5e",
        coral: "#e8664d",
        gold: "#f3b44b",
        emerald: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#145231"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 33, 43, 0.10)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.1)",
        "glass-lg": "0 20px 50px rgba(0, 0, 0, 0.15)"
      },
      backgroundImage: {
        "gradient-emerald": "linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(34, 197, 94, 0.08))",
        "gradient-dark": "linear-gradient(135deg, #0f172a 0%, #111827 42%, #052e2b 100%)"
      },
      backdropBlur: {
        glass: "12px"
      }
    }
  },
  plugins: []
};

export default config;

