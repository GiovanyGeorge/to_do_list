/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#FAF7F2",
          sidebar: "#FAF7F2",
          card: "#FFFFFF",
          elevated: "#F0EAE0",
        },
        accent: {
          DEFAULT: "#C2410C",
          hover: "#9A3412",
          glow: "#E2622A",
          light: "#FFFBEB",
          muted: "rgba(194, 65, 12, 0.12)",
        },
        text: {
          primary: "#1C1917",
          secondary: "#78716C",
          muted: "#A8A29E",
        },
        border: {
          subtle: "rgba(28, 25, 23, 0.12)",
          input: "rgba(28, 25, 23, 0.16)",
          DEFAULT: "rgba(28, 25, 23, 0.12)",
        },
        status: {
          danger: "#B91C1C",
          success: "#15803D",
          warning: "#B45309",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Cairo", "system-ui", "sans-serif"],
        sora: ["Sora", "sans-serif"],
        arabic: ["Cairo", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,25,23,.05), 0 14px 30px -20px rgba(28,25,23,.24)",
        "card-hover": "0 4px 6px -1px rgba(28,25,23,.07), 0 20px 32px -16px rgba(28,25,23,.28)",
        glow: "0 10px 26px -10px rgba(194,65,12,.45)",
      },
      borderRadius: {
        card: "20px",
        inner: "16px",
      },
    },
  },
  plugins: [],
};
