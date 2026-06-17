/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black:  '#0A0A0A',
        white:  '#FAFAFA',
        surface: {
          DEFAULT:  '#111111',
          light:    '#FFFFFF',
          elevated: '#1A1A1A',
        },
        border: {
          DEFAULT: '#222222',
          light:   '#E5E5E5',
        },
        accent: '#E8FF47',
        muted: {
          DEFAULT: '#666666',
          light:   '#999999',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['80px', { lineHeight: '1.0', letterSpacing: '-0.04em', fontWeight: '800' }],
        hero:    ['56px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
        h1:      ['40px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        h2:      ['32px', { lineHeight: '1.2',  letterSpacing: '-0.01em' }],
        h3:      ['24px', { lineHeight: '1.3',  letterSpacing: '-0.01em' }],
      },
    },
  },
  plugins: [],
}