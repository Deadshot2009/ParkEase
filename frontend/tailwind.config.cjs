module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#060B18',
          50: '#0F1A34',
          100: '#0C162E',
          200: '#0A1226',
          300: '#080E1E',
          900: '#040710',
        },
        navy: {
          950: '#040711',
          900: '#070C1B',
          850: '#0A1126',
          800: '#0D1730',
          700: '#142247',
          600: '#1C2F5E',
        },
        charcoal: {
          900: '#0e121a',
          800: '#141822',
          700: '#1c212e',
          600: '#262c3c',
        },
        emerald: {
          accent: '#00E676',
          glow: '#00C853',
        },
        secondary: '#00C853',
        available: '#00E676',
        booked: '#FF3366',
        reserved: '#FFB800',
        unavailable: '#64748B',
      },
      backgroundImage: {
        'radial-gradient-hero': 'radial-gradient(circle at 50% 0%, rgba(0, 200, 83, 0.15) 0%, rgba(10, 17, 38, 0.4) 50%, transparent 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(14, 23, 48, 0.7) 0%, rgba(7, 12, 27, 0.85) 100%)',
        'card-hover-gradient': 'linear-gradient(145deg, rgba(20, 34, 71, 0.8) 0%, rgba(10, 17, 38, 0.95) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'emerald-glow': '0 0 25px -5px rgba(0, 200, 83, 0.3)',
        'emerald-glow-lg': '0 0 45px -5px rgba(0, 230, 118, 0.4)',
        'card-subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
};
