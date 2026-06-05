/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Instrument Serif'", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        paper: "#F5F0E8",
        ink: "#1A1208",
        rust: "#C4511F",
        amber: "#D97706",
        cream: "#FBF7EE",
        muted: "#8A7F6E",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "slide-in": "slideIn 0.3s ease forwards",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: 0, transform: "translateX(-8px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
