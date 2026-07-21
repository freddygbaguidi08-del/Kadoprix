/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        promo: '#FF6B35',
        eco: '#16A34A',
        encre: '#1E293B',
        fond: '#F8FAFC',
      },
    },
  },
  plugins: [],
};
