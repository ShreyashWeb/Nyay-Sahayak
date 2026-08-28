/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#D85A30",
          hover: "#C24F29",
          light: "#FDF0EC",
        },
        secondary: {
          DEFAULT: "#0F6E56",
          hover: "#0B5341",
          light: "#E7F3F0",
        },
        danger: {
          DEFAULT: "#A32D2D",
          hover: "#852424",
          light: "#FBECEC",
        },
        base: {
          DEFAULT: "#FAF9F6",
          dark: "#1A1A1A",
        },
      },
      borderRadius: {
        card: "12px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-devanagari)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
