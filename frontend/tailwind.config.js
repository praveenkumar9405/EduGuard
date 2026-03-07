/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#2E7D32",
                secondary: "#F5F7FA",
                accent: "#4A90E2",
            },
            fontFamily: {
                sans: ['Inter', 'Poppins', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
