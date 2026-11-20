/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#111318",
          sidebar: "#151920",
          card: "#191D24",
          elevated: "#252B35",
        },
        accent: {
          DEFAULT: "#E99A43",
          hover: "#f0a857",
          muted: "rgba(233, 154, 67, 0.15)",
        },
        text: {
          primary: "#F3F4F6",
          secondary: "#9299A5",
          muted: "#6B7280",
        },
        border: {
          subtle: "#2A303C",
          DEFAULT: "#374151",
        },
      },
      fontFamily: {
        sans: ["Inter", "Cairo", "system-ui", "sans-serif"],
        arabic: ["Cairo", "sans-serif"],
      },
    },
  },
  plugins: [],
};
