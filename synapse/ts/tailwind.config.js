/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  presets: [require("./tailwind.preset.cjs")],
  content: [
    "./src/react/components/**/*.{ts,tsx}",
    "./src/stories/**/*.{ts,tsx}",
  ],
};
