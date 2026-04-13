/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F7F9FB',
        'dark-bg': '#0B0F1A',
        brand: {
          DEFAULT: '#1E4AFF',
          light: '#4A6FFF',
          dark: '#0A2FA0',
        },
        gold: {
          DEFAULT: '#C9A64D',
          light: '#D4B96E',
        },
        dark: '#3A4250',
        'dark-text': '#F1F5F9',
        secondary: '#6B7280',
        border: '#E1E6EE',
        'dark-border': 'rgba(75, 85, 99, 0.3)',
        card: 'rgba(255, 255, 255, 0.72)',
        'dark-card': 'rgba(17, 24, 39, 0.72)',
        glass: 'rgba(255, 255, 255, 0.55)',
        'dark-glass': 'rgba(31, 41, 55, 0.55)',
        'glass-border': 'rgba(225, 230, 238, 0.6)',
        'dark-glass-border': 'rgba(75, 85, 99, 0.4)',
        overlay: 'rgba(30, 74, 255, 0.04)',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(58, 66, 80, 0.04)',
        sm: '0 2px 8px rgba(58, 66, 80, 0.06)',
        md: '0 4px 16px rgba(58, 66, 80, 0.08)',
        lg: '0 8px 32px rgba(58, 66, 80, 0.10)',
        xl: '0 12px 48px rgba(58, 66, 80, 0.12)',
        glow: '0 0 24px rgba(30, 74, 255, 0.08)',
        gold: '0 0 16px rgba(201, 166, 77, 0.12)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'page-pattern': "url('/hero-bg.png')",
        'hero-glow': "radial-gradient(circle, rgba(30, 74, 255, 0.045) 0%, transparent 70%)"
      },
      animation: {
        fadeInUp: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        pulse: 'pulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
