export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['Outfit', 'sans-serif'],
      },
      colors: {
        cream:     '#f8f7f4',
        sand:      '#f0ece3',
        parchment: '#e8e0d0',
        earth:     '#c4956a',
        amber:     { DEFAULT: '#f4a940', dark: '#e8734a' },
        forest:    '#2d6a4f',
        dusk:      '#1a1a2e',
        mist:      '#6b6b80',
        ghost:     '#9b9baa',
        danger:    '#c0392b',
      },
      animation: {
        'fade-up':  'fadeUp 0.5s ease forwards',
        'fade-in':  'fadeIn 0.3s ease forwards',
        'slide-in': 'slideIn 0.4s ease forwards',
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { transform: 'translateX(-20px)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
      },
    },
  },
  plugins: [],
}
