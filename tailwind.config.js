/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#4CAF50",
                secondary: "#FF9800",
                accent: "#2196F3",
            },
        },
    },
    plugins: [],
}
