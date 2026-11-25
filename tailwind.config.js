/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pine: '#130B24',
        pine2: '#1C1036',
        pine3: '#2A1A4D',
        brass: '#F2512D',
        brass2: '#D63A18',
        brass3: '#FFC4B2',
        volt: '#C8F53C',
        iris: '#7C4DFF',
        paper: '#F5F3FA',
        paper2: '#ECE8F5',
        line: '#E3DEF0',
        ink: '#150E26',
        mute: '#6A6283',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(42,26,77,0.05), 0 10px 30px rgba(42,26,77,0.07)',
        lift: '0 6px 10px rgba(42,26,77,0.06), 0 22px 48px rgba(42,26,77,0.14)',
        glow: '0 10px 30px rgba(242,81,45,0.38)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.35s ease both',
      },
    },
  },
  plugins: [],
}
