/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0eefe',
          200: '#bae0fd',
          300: '#7bcefb',
          400: '#36b6f6',
          500: '#0c96e0',
          600: '#0078c2',
          700: '#0161a1',
          800: '#065285',
          900: '#0a446e',
          950: '#062b49',
        },
        status: {
          approved: {
            light: '#ecfdf5',
            DEFAULT: '#10b981',
            dark: '#047857',
          },
          pending: {
            light: '#fffbeb',
            DEFAULT: '#f59e0b',
            dark: '#b45309',
          },
          holiday: {
            light: '#eff6ff',
            DEFAULT: '#3b82f6',
            dark: '#1d4ed8',
          },
          nonworking: {
            light: '#f8fafc',
            DEFAULT: '#94a3b8',
            dark: '#475569',
          },
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 2px 8px 0 rgba(0, 0, 0, 0.05)',
        card: '0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}; 