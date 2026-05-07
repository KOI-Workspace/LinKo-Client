import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        secondary: {
          DEFAULT: '#EC4899',
          50:  '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
          700: '#BE185D',
          800: '#9D174D',
          900: '#831843',
          950: '#500724',
        },
        neutral: {
          0:   '#FFFFFF',
          50:  '#FAFAFA',
          100: '#F5F5F5',
          200: '#EAEAEA',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(10, 10, 10, 0.04)',
        sm: '0 1px 3px rgba(10, 10, 10, 0.06), 0 1px 2px rgba(10, 10, 10, 0.04)',
        md: '0 4px 8px rgba(10, 10, 10, 0.06), 0 2px 4px rgba(10, 10, 10, 0.04)',
        lg: '0 12px 24px rgba(10, 10, 10, 0.08), 0 4px 8px rgba(10, 10, 10, 0.04)',
        xl: '0 24px 48px rgba(10, 10, 10, 0.12)',
        focus: '0 0 0 3px rgba(139, 92, 246, 0.2)',
      },
    },
  },
  plugins: [],
}

export default config
