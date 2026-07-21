/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1220',        // titres, texte fort
        canvas: '#F4F5F7',     // fond général, neutre froid (instrument, pas boutique)
        promo: '#FF6B35',      // accent unique : % de réduction + CTA principal
        eco: '#047857',        // prix, économies, verdicts positifs
        warn: '#B45309',       // alerte prix de référence douteux (ambre, pas rouge)
        line: '#E4E7EC',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl2: '1.25rem' },
      boxShadow: {
        card: '0 1px 2px rgba(11,18,32,.04), 0 8px 24px -12px rgba(11,18,32,.12)',
        lift: '0 2px 4px rgba(11,18,32,.06), 0 16px 40px -16px rgba(11,18,32,.20)',
      },
    },
  },
  plugins: [],
};
