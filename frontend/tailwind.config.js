/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        primary: {
          DEFAULT: 'var(--color-primary, #15803d)',
          hover: 'var(--color-primary-hover, #166534)',
          light: 'var(--color-primary-light, #dcfce7)',
          dark: '#14532d',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary, #d97706)',
          hover: 'var(--color-secondary-hover, #b45309)',
          light: 'var(--color-secondary-light, #fef3c7)',
        },
        accent: {
          DEFAULT: 'var(--color-accent, #84cc16)',
          hover: '#65a30d',
          light: '#ecfccb',
        },
        surface: {
          DEFAULT: 'var(--color-card, #ffffff)',
          muted: 'var(--color-background-muted, #f8fafc)',
          warm: 'var(--color-background-warm, #fdfbf7)',
        },
        border: 'var(--color-border, #e2e8f0)',
        txt: {
          primary: 'var(--color-text-primary, #0f172a)',
          secondary: 'var(--color-text-secondary, #475569)',
          muted: 'var(--color-text-muted, #94a3b8)',
        }
      },
      fontFamily: {
        serif: ['"Crimson Text"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'card': '0 10px 25px -5px rgba(20, 83, 45, 0.05), 0 8px 10px -6px rgba(20, 83, 45, 0.03)',
        'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
