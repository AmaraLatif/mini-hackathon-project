/** Design tokens live here. Module 1 owns this file. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#05070f', 900: '#080c18', 800: '#0d1324', 700: '#141b30', 600: '#1d2640' },
        sonar: { 400: '#34e0c8', 500: '#3fa9ff' },
        risk: { low: '#22c55e', medium: '#facc15', high: '#ef4444' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 12px 40px -12px rgba(0,0,0,0.65)',
        glow: '0 8px 30px -8px rgba(52,224,200,0.55)',
      },
      keyframes: {
        drift: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(40px,-30px,0) scale(1.12)' },
        },
        driftAlt: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1.05)' },
          '50%': { transform: 'translate3d(-50px,30px,0) scale(0.95)' },
        },
        sweep: { to: { transform: 'rotate(360deg)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        ping2: { '0%': { transform: 'scale(.6)', opacity: '.7' }, '100%': { transform: 'scale(2.4)', opacity: '0' } },
      },
      animation: {
        drift: 'drift 18s ease-in-out infinite',
        driftAlt: 'driftAlt 22s ease-in-out infinite',
        sweep: 'sweep 9s linear infinite',
        ping2: 'ping2 3s ease-out infinite',
      },
    },
  },
  plugins: [],
};
