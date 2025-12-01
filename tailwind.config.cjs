module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6B667A', // Grey-Purple Metallic (primary)
          muted: '#8A8695'
        },
        secondary: {
          DEFAULT: '#9A1B26' // Deep Red (primary CTA)
        },
        dark: {
          DEFAULT: '#2A2F36', // Dark Blue-Black (header/nav)
          deep: '#1A1A1C'     // Deep Black (text)
        },
        neutralSoft: '#D8D5D2', // Soft Grey (background)
        accent: {
          DEFAULT: '#C8752A' // Autumn Orange (accent)
        }
        ,
        gold: '#D4AF37'
      }
    }
  },
  plugins: []
}
