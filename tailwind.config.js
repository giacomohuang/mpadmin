/** @type {import('tailwindcss').Config} */

export default {
  // corePlugins: {
  //   preflight: false
  // },
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#edf8ff',
          100: '#d7edff',
          200: '#b9e1ff',
          300: '#88d0ff',
          400: '#50b5ff',
          500: '#2893ff',
          600: '#1677ff',
          700: '#0a5ceb',
          800: '#0f4abe',
          900: '#134295',
          950: '#112a5a'
        },
        orange: {
          50: '#fff4ed',
          100: '#ffe6d5',
          200: '#feccaa',
          300: '#fdac74',
          400: '#fb8a3c',
          500: '#f97316',
          600: '#ea670c',
          700: '#c2570c',
          800: '#9a4a12',
          900: '#7c3d12',
          950: '#432007'
        },
        green: {
          50: '#f0fdf5',
          100: '#dcfce8',
          200: '#bbf7d1',
          300: '#86efad',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803c',
          800: '#166533',
          900: '#14532b',
          950: '#052e14'
        },
        blue: {
          50: '#eff5ff',
          100: '#dbe8fe',
          200: '#bfd7fe',
          300: '#93bbfd',
          400: '#609afa',
          500: '#3b82f6',
          600: '#2570eb',
          700: '#1d64d8',
          800: '#1e55af',
          900: '#1e478a',
          950: '#172e54'
        },
        red: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a'
        }
      },
      borderColor: {
        primary: 'var(--border-primary)',
        secondary: 'var(--border-secondary)'
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)'
      },
      backgroundColor: {
        primary: 'rgb(var(--bg-primary) / <alpha-value>)',
        secondary: 'var(--bg-secondary)'
      }
    }
  },
  plugins: []
}
