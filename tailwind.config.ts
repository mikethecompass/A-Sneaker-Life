import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Strict black & white palette
        brand: {
          black: "#0a0a0a",
          white: "#fafafa",
          gray: {
            50: "#f5f5f5",
            100: "#e5e5e5",
            200: "#d4d4d4",
            400: "#a3a3a3",
            600: "#525252",
            800: "#262626",
            900: "#171717",
          },
        },
        // Accent: green for buttons, badges, sale prices
        accent: {
          DEFAULT: "#22c55e",
          dark: "#16a34a",
          light: "#dcfce7",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
