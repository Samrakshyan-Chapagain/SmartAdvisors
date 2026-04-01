/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          heading: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
          sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        },
        colors: {
          ds: {
            bg:       '#0a0b14',
            'bg-sec': '#0d0f1a',
            card:     '#13152a',
            purple:   '#5b7cfa',
            orange:   '#ff6b35',
            blue:     '#0046FF',
            coral:    '#FF8040',
            green:    '#22c55e',
            text:     '#eef0ff',
            body:     '#c8cfe8',
            muted:    '#8892b8',
          },
        },
      },
    },
    plugins: [],
  }