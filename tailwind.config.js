/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        primary: {
          DEFAULT: '#6366f1', // Indigo
          hover: '#4f46e5',
        },
        accent: {
          DEFAULT: '#10b981', // Emerald
          hover: '#059669',
        },
        warning: {
          DEFAULT: '#f59e0b', // Amber
          hover: '#d97706',
        },
        background: {
          DEFAULT: '#111827', // Gray 900
          light: '#1f2937', // Gray 800
          lighter: '#374151', // Gray 700
        }
      }
    },
  },
  plugins: [],
};