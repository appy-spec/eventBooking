/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["DM Sans", "sans-serif"],
                display: ["Space Grotesk", "sans-serif"],
            },
            colors: { ink: "#101010", lime: "#d6ff4f", paper: "#f5f5f0" },
            boxShadow: { soft: "0 18px 60px rgba(0,0,0,.08)" },
        },
    },
    plugins: [],
};