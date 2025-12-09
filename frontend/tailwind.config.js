/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-gradient-to-br',
    'bg-gradient-to-r',
    'from-indigo-100',
    'from-indigo-600',
    'from-indigo-700',
    'to-purple-50',
    'to-purple-600',
    'to-purple-700',
    'via-purple-50',
    'to-pink-100',
    'bg-indigo-100',
    'bg-indigo-600',
    'text-indigo-600',
    'text-indigo-500',
    'text-indigo-100',
    'border-indigo-500',
    'ring-indigo-500',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
