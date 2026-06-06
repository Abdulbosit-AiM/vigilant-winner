import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Urgency palette (accessible: colour is paired with icon + text in UI)
        urgent: "#b91c1c",
        soon: "#b45309",
        routine: "#15803d",
      },
      maxWidth: {
        device: "390px",
      },
    },
  },
  plugins: [],
};

export default config;
