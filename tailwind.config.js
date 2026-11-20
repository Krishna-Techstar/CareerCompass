/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brutal: {
          bg: "#FAF8F5", // Warm light canvas
          pitch: "#000000", // True complete dark black (0% blue)
          cardDark: "#121212", // Neutral dark container (0% blue)
          surfaceDark: "#1A1A1A", // Neutral dark surface
          lime: "#D2FD3A", // Playful neon lime
          purple: "#DDD6FE", // Soft lavender
          pink: "#FBCFE8", // Soft rose/pink
          blue: "#BAE6FD", // Soft sky blue
          yellow: "#FEF08A", // Soft butter yellow
          orange: "#FED7AA", // Soft peach
          dark: "#000000", // Pure pitch black
        },
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px #000000",
        "brutal-white": "4px 4px 0px 0px #FFFFFF",
        "brutal-sm": "2px 2px 0px 0px #000000",
        "brutal-sm-white": "2px 2px 0px 0px #FFFFFF",
        "brutal-lg": "6px 6px 0px 0px #000000",
        "brutal-lg-white": "6px 6px 0px 0px #FFFFFF",
      },
      borderWidth: {
        brutal: "2.5px",
        "2.5": "2.5px",
        "3": "3px",
        3: "3px",
      },
    },
  },
  plugins: [],
};
