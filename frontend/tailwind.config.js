/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        void: '#050508',
        surface: '#0D0D15',
        card: '#12121C',
        border: '#1E1E2E',
        teal: { 400: '#2DD4BF', 500: '#14B8A6', glow: '#00FFD9' },
        violet: { 400: '#A78BFA', 500: '#8B5CF6', glow: '#BF5FFF' },
        amber: { 400: '#FBBF24', glow: '#FFD700' },
      },
      backgroundImage: {
        'mesh': 'radial-gradient(at 27% 37%, hsla(215,98%,61%,0.07) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(175,98%,61%,0.07) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(340,98%,61%,0.03) 0px, transparent 50%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        glow: { '0%, 100%': { boxShadow: '0 0 20px rgba(45,212,191,0.15)' }, '50%': { boxShadow: '0 0 40px rgba(45,212,191,0.3)' } },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card': '0 4px 24px rgba(0,0,0,0.5)',
        'teal': '0 0 30px rgba(45,212,191,0.2)',
        'violet': '0 0 30px rgba(139,92,246,0.2)',
        'neon-teal': '0 0 0 1px rgba(45,212,191,0.3), 0 0 20px rgba(45,212,191,0.1)',
      },
    },
  },
  plugins: [],
};
