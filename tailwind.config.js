/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-red': '#9A1B26', // Primary CTA
        'cherry-red': '#B3252E', // Hover/secondary accent
        'bk-gold': '#D4AF37',
      },
    },
  },
  plugins: [],
}
