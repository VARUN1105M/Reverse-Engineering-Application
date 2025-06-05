/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'slideli': '#A56F88',
        'slideda': '#A56F88', 
      },
      animation: {
        float: 'float 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(-6px)' },
          '50%': { transform: 'translateY(6px)' },
        },
      },
      boxShadow: {
        'lg-red': '0 10px 15px -3px rgba(255, 0, 0, 0.5), 0 4px 6px -4px rgba(255, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}

