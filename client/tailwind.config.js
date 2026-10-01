/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#153D7A',
          50: '#F0F5FC',
          100: '#DCE8F7',
          200: '#B8D2F0',
          300: '#8BB5E4',
          400: '#5891D5',
          500: '#2563C7',
          600: '#1D4FB2',
          700: '#153D7A',
          800: '#123263',
          900: '#112A50',
          950: '#0B1B36'
        },
        royal: {
          DEFAULT: '#2563C7',
          hover: '#1D4FB2',
          light: '#EBF3FE'
        },
        surface: {
          bg: '#F3F7FD',
          card: '#FFFFFF',
          border: '#DCE8F7',
          hover: '#F8FAFC'
        },
        content: {
          primary: '#172B4D',
          secondary: '#7185A5',
          muted: '#94A3B8'
        },
        status: {
          success: '#159B72',
          successBg: '#E8F8F3',
          warning: '#D58B13',
          warningBg: '#FEF6E7',
          danger: '#D94848',
          dangerBg: '#FDF2F2'
        },
        // Brand color aliases mapped to palette
        brand: {
          50: '#EBF3FE',
          100: '#DCE8F7',
          200: '#B8D2F0',
          300: '#8BB5E4',
          400: '#5891D5',
          500: '#2563C7',
          600: '#153D7A',
          700: '#123263',
          800: '#112A50',
          900: '#0B1B36',
          950: '#071224'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px 0 rgba(21, 61, 122, 0.04), 0 1px 3px 0 rgba(21, 61, 122, 0.02)',
        'card-hover': '0 8px 24px -4px rgba(37, 99, 199, 0.12), 0 2px 6px -1px rgba(21, 61, 122, 0.04)',
        'glow': '0 4px 14px 0 rgba(37, 99, 199, 0.25)',
        'glass': '0 10px 30px -5px rgba(21, 61, 122, 0.08), 0 4px 10px -2px rgba(21, 61, 122, 0.04)',
        'modal': '0 20px 50px -10px rgba(17, 42, 80, 0.18)'
      }
    },
  },
  plugins: [],
}
