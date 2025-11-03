/** @type {import('tailwindcss').Config} */
export default {
    // 1. THIS IS THE KEY CHANGE
    darkMode: 'class',

    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}", // Your path is correct
    ],
    theme: {
        extend: {
            // 2. MAP TAILWIND COLORS TO YOUR CSS VARIABLES
            // This makes Shadcn components (like Card, Button) work with your theme
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                // Your custom brand colors
                'brand-purple': '#7c3aed',
                'brand-light': '#a78bfa',

                // Custom dark colors from your App.css
                'dark-bg': '#1a202c',
                'dark-card': '#2d3748',
                'dark-nav': '#1f2937',
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [
        require("tailwindcss-animate") // Make sure this is installed (npm install tailwindcss-animate)
    ],
};