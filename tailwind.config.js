/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        lato: ["Lato", "serif"],
      },
      colors: {
        "blitz-pink": "#FF30A0",
        "blitz-red": "#FF3D3D",
        "background": "#151517",
        "secondary-background": "#272727",
        "textPrimary": "#ffffff",
      },
    },
  },
};