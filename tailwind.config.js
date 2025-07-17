/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2e2d2dff', // black
        secondary: '#8B1E3F', // high-end red
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
} 