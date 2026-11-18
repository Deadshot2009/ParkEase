module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        carbon: {
          950: '#070A11',
          900: '#0B0F19',
          850: '#0F1523',
          800: '#141C2E',
          750: '#18233A',
          700: '#1E2B47',
          600: '#2A3B5E',
        },
        indigo: {
          DEFAULT: '#6366F1',
          accent: '#6366F1',
          glow: '#4F46E5',
          deep: '#4338CA',
          light: '#818CF8',
        },
        cyan: {
          DEFAULT: '#06B6D4',
          accent: '#06B6D4',
          glow: '#0891B2',
          light: '#38BDF8',
          deep: '#0E7490',
        },
        amber: {
          DEFAULT: '#F59E0B',
          glow: '#D97706',
        },
        available: '#38BDF8', // Vivid Sky Blue/Cyan for open bays
        booked: '#F43F5E',    // Rose/Crimson for booked bays
        reserved: '#F59E0B',  // Solar Amber for reserved bays
        unavailable: '#64748B',// Muted Slate for maintenance
      },
      backgroundImage: {
        'radial-gradient-hero': 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.18) 0%, rgba(6, 182, 212, 0.08) 40%, transparent 80%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(20, 28, 46, 0.75) 0%, rgba(11, 15, 25, 0.88) 100%)',
        'card-hover-gradient': 'linear-gradient(145deg, rgba(28, 40, 68, 0.85) 0%, rgba(15, 21, 35, 0.95) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'indigo-glow': '0 0 25px -4px rgba(99, 102, 241, 0.45)',
        'indigo-glow-lg': '0 0 45px -4px rgba(99, 102, 241, 0.55)',
        'cyan-glow': '0 0 25px -4px rgba(6, 182, 212, 0.4)',
        'card-subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.55)',
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
