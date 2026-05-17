/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#3B82F6',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1A1D27',
        },
        background: {
          light: '#F8F9FA',
          dark: '#0F1117',
        },
        border: {
          light: '#E5E7EB',
          dark: '#2D3748',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}