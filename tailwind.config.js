/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#09122C', // black
        secondary: '#BE3144', // high-end red
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
} 