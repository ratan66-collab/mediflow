/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        racing: {
          dark: '#111111',       // Softer deep dark
          card: '#1a1a1a',       // Off-black for elevated cards
          accent: '#bef264',     // Lemon green accent
          accentHover: '#a3e635', // Slightly darker lemon green
          text: '#ffffff',       // Pure white for high contrast
          textMuted: '#9ca3af',  // Slate 400
          border: '#333333'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Bebas Neue"', 'curse'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
}
