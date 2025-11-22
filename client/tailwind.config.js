/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#4F46E5', // Indigo 600
                secondary: '#64748B', // Slate 500
                success: '#10B981', // Emerald 500
                warning: '#F59E0B', // Amber 500
                danger: '#EF4444', // Red 500
                background: '#F8FAFC', // Slate 50
                surface: '#FFFFFF',
            }
        },
    },
    plugins: [],
}
