/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          background: "#09090b",
          foreground: "#fafafa",
          primary: {
            DEFAULT: "#3b82f6",
            foreground: "#ffffff",
          },
          secondary: {
            DEFAULT: "#1e293b",
            foreground: "#e2e8f0",
          },
          border: "#27272a",
          input: "#27272a",
          ring: "#3b82f6",
          destructive: {
            DEFAULT: "#ef4444",
            foreground: "#fafafa",
          },
        },
        fontFamily: {
          sans: ["Inter", "sans-serif"],
          mono: ["JetBrains Mono", "monospace"],
        },
      },
    },
    plugins: [],
  }