module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Project palette (kept small and explicit here)
        brand: {
          DEFAULT: '#6B667A', // Grey-Purple Metallic (primary)
          muted: '#8A8695'
        },
        // Deep Metallic Red (primary CTA)
        'deep-red': '#9A1B26',
        // Glossy Cherry Red (hover/secondary)
        'cherry-red': '#B3252E',
        // Legacy alias for backwards compatibility
        secondary: {
          DEFAULT: '#9A1B26'
        },
        dark: {
          DEFAULT: '#2A2F36', // Dark Blue-Black (header/nav)
          deep: '#1A1A1C'     // Deep Black (text)
        },
        neutralSoft: '#D8D5D2', // Soft Grey (background)
        accent: {
          DEFAULT: '#C8752A' // Autumn Orange (accent)
        },
        // Gold accent
        'bk-gold': '#D4AF37',
        gold: '#D4AF37'
      }
    }
  },
  plugins: []
}
