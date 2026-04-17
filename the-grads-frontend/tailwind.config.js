/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        grads: {
          bg: "#07111A",
          surface: "#0B1B2B",
          panel: "#102437",
          panel2: "#132C42",
          glass: "rgba(16, 36, 55, 0.72)",
          teal: "#14B8C4",
          cyan: "#4FE3F0",
          tealDeep: "#0E8E99",
          purple: "#C03CFF",
          magenta: "#E052FF",
          text: "#EAF6FF",
          textSoft: "#9FB3C8",
          muted: "#6F859B",
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
          info: "#38BDF8",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        "glow-teal":
          "0 0 0 1px rgba(79, 227, 240, 0.18), 0 8px 30px rgba(20, 184, 196, 0.18)",
        "glow-purple":
          "0 0 0 1px rgba(192, 60, 255, 0.18), 0 10px 35px rgba(192, 60, 255, 0.20)",
        panel: "0 10px 30px rgba(0, 0, 0, 0.28)",
      },
    },
  },
  plugins: [],
};
