/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          heading: ['Bricolage Grotesque', 'sans-serif'],
          body: ['Plus Jakarta Sans', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }