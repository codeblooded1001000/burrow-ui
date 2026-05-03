import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F5',
        surface: '#FFFFFF',
        border: { DEFAULT: '#EDE8E0' },
        ink: {
          primary: '#1A1A1A',
          secondary: '#6B6B6B',
          tertiary: '#A8A29A',
        },
        teal: {
          DEFAULT: '#1A5F5A',
          hover: '#134543',
          tint: 'rgba(26,95,90,0.05)',
        },
        forest: '#2D7A4F',
        terracotta: '#C5573D',
        'dark-bg': '#14211F',
        'dark-surface': '#1B2A28',
        'dark-border': '#2A3936',
        'dark-ink': {
          primary: '#F5F1EA',
          secondary: '#B5AEA3',
          tertiary: '#6F6862',
        },
        'dark-teal': {
          DEFAULT: '#5BA89E',
          hover: '#7AC0B6',
          tint: 'rgba(91,168,158,0.07)',
        },
        'dark-forest': '#5BA876',
        'dark-terracotta': '#D87A60',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '12px',
        lg: '20px',
      },
      keyframes: {
        'burrow-spin': {
          to: { transform: 'rotate(360deg)' },
        },
        'burrow-shimmer': {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'burrow-spin': 'burrow-spin 0.8s linear infinite',
        'burrow-shimmer': 'burrow-shimmer 1.4s infinite linear',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
