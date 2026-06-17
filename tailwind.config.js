/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/**/*.html"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f7ff",
          500: "#4f46e5", // Royal Premium Indigo
          600: "#4338ca",
          900: "#1e1b4b",
        },
      },
    },
  },
  plugins: [],
};
