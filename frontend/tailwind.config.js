/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:              "#0a0a0f",
          surface:         "#13131a",
          border:          "#1e1e2e",
          primary:         "#7c6af7",
          "primary-hover": "#9585f8",
          text:            "#f0eff8",
          muted:           "#6b6a80",
          success:         "#34d399",
          error:           "#f87171",
          warning:         "#fbbf24",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
