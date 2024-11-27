/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', /*'[data-mode="dark"]'],*/
  content: ['*.html', '*.js', './src/renderer/js/*.js'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },

    fontFamily: {
      display: ['Source Serif Pro', 'Georgia', 'serif'],
      body: ['Synonym', 'system-ui', 'sans-serif'],
    },

    extend: {
      colors: {
        'custom-green': '#00ff00',
      },

      animation: {
        'bounce': 'bounce 0.5s infinite',
        'bounce-100': 'bounce 0.5s 100ms infinite',
        'bounce-200': 'bounce 0.5s 200ms infinite',
        'bounce-300': 'bounce 0.5s 300ms infinite',
        'bounce-400': 'bounce 0.5s 400ms infinite',
        'bounce-500': 'bounce 0.5s 500ms infinite',
        'bounce-600': 'bounce 0.5s 600ms infinite',

      },

      keyframes: {
        bounce: {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.5 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
