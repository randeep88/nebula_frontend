/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      utilities: {
        ".hide-scrollbar-buttons": {
          "&::-webkit-scrollbar-button": {
            display: "none",
          },
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
