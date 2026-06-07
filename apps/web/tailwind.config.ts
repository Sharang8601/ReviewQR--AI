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
        gold: "#f3b44b"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 33, 43, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;

