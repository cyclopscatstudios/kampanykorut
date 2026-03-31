/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./.ladle/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: { "dark-blue": "#0f172a" },
      fontFamily: { montserrat: ["Montserrat", "sans-serif"] },
    },
  },
  plugins: [],
};
