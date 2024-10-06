/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Enables dark mode based on class
  content: [
    "./node_modules/flowbite/**/*.js",
    "./layout/**/*.njk",
    "./layout/**/*.html",
    "./source/**/*.js",
    "./source/**/*.cjs",
    "./src/**/*.{js,ts,cjs,mjs}"
  ],
  theme: {
    extend: {
      colors: {
        clifford: "#da373d",
        ocean: "#1ca9c9",
        forest: "#228b22",
        sunset: "#ff4500",
        sky: "#87ceeb",
        sand: "#c2b280",
        berry: "#cc66cc",
        cyan: "#00ffff",
        magenta: "#ff00ff",
        polkador: "#ff6347",
        skip: "#d3d3d3", // light gray
        silver: "#c0c0c0",
        mutedGray: "#b0b0b0",
        lightGray: "#d3d3d3"
      }
    }
  },
  plugins: [require("flowbite/plugin"), require("flowbite-typography")]
};
